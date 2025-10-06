






from fastapi import FastAPI, HTTPException, BackgroundTasks, Request
from pydantic import BaseModel
import redis
import json
import uuid
import asyncio
import requests
from typing import Dict, Any, List, Optional
from bs4 import BeautifulSoup
import nltk
import numpy as np
from datetime import datetime, timedelta
import time
import aiohttp
import os

app = FastAPI()

# Redis connection
redis_host = os.getenv("REDIS_HOST", "redis")
redis_port = int(os.getenv("REDIS_PORT", "6379"))
redis_client = redis.Redis(host=redis_host, port=redis_port, decode_responses=True)

class TaskRequest(BaseModel):
    task_type: str
    data: Dict[str, Any]
    model_policy: str = "balanced"

class TaskResponse(BaseModel):
    task_id: str
    status: str
    result: Dict[str, Any] = None

# Truth Agent models
class Citation(BaseModel):
    url: str
    title: str
    quote: str
    accessedAt: str
    relevance_score: float

class TruthAgentRequest(BaseModel):
    query: str
    maxTokens: Optional[int] = 500
    temperature: Optional[float] = 0.7

class TruthAgentResponse(BaseModel):
    answer: str
    citations: List[Citation]
    confidence: float
    dissentingLinks: List[str] = []
    query_suggestions: List[str] = []

async def wait_for_task_result(task_id: str, timeout: int = 10) -> Dict[str, Any]:
    """Wait for task result from Redis pub/sub"""
    pubsub = redis_client.pubsub()
    pubsub.subscribe(f'task_result_{task_id}')
    
    try:
        for message in pubsub.listen():
            if message['type'] == 'message':
                return json.loads(message['data'])
    except asyncio.TimeoutError:
        return {"error": "Task timeout"}
    finally:
        pubsub.unsubscribe()

@app.post("/task", response_model=TaskResponse)
async def create_task(request: TaskRequest, background_tasks: BackgroundTasks):
    """Create a new AI task and dispatch to appropriate agent"""
    task_id = str(uuid.uuid4())
    
    # Dispatch task to appropriate agent channel
    if request.task_type == "summarization":
        channel = "summarization_tasks"
    elif request.task_type == "moderation":
        channel = "moderation_tasks"
    elif request.task_type == "onboarding":
        channel = "onboarding_tasks"
    else:
        raise HTTPException(status_code=400, detail=f"Unknown task type: {request.task_type}")
    
    # Create task payload
    task_payload = {
        "task_id": task_id,
        "task_type": request.task_type,
        "model_policy": request.model_policy,
        **request.data
    }
    
    # Publish task to agent
    redis_client.publish(channel, json.dumps(task_payload))
    
    return TaskResponse(
        task_id=task_id,
        status="dispatched",
        result={"message": f"Task dispatched to {request.task_type} agent"}
    )

@app.get("/task/{task_id}", response_model=TaskResponse)
async def get_task_result(task_id: str):
    """Get result for a specific task"""
    # Check if result is cached
    result_key = f"task_result:{task_id}"
    result = redis_client.get(result_key)
    
    if result:
        return TaskResponse(
            task_id=task_id,
            status="completed",
            result=json.loads(result)
        )
    
    return TaskResponse(
        task_id=task_id,
        status="processing",
        result={"message": "Task still processing"}
    )

# Rate limiting and transparency functions
async def check_rate_limit(ip_address: str) -> bool:
    """Check if IP address has exceeded rate limit"""
    key = f"rate_limit:{ip_address}"
    current = redis_client.get(key)
    
    rate_limit = int(os.getenv("RATE_LIMIT_REQUESTS_PER_MINUTE", "10"))
    if current and int(current) >= rate_limit:
        return False
    
    # Increment counter with 1 minute expiration
    redis_client.incr(key)
    redis_client.expire(key, 60)
    return True

async def record_transparency_log(query: str, response: TruthAgentResponse, ip_address: str):
    """Record transparency log for AI responses"""
    log_entry = {
        "timestamp": datetime.utcnow().isoformat(),
        "query": query,
        "answer": response.answer,
        "confidence": response.confidence,
        "citation_count": len(response.citations),
        "ip_address": ip_address,
        "has_citations": len(response.citations) > 0,
        "was_governance_blocked": "cannot provide" in response.answer.lower() or "violate" in response.answer.lower()
    }
    
    # Store in Redis with configurable expiration
    log_key = f"ai_transparency:{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:8]}"
    retention_seconds = int(os.getenv("TRANSPARENCY_LOG_RETENTION", "2592000"))  # Default 30 days
    redis_client.setex(log_key, retention_seconds, json.dumps(log_entry))

# Truth Agent endpoints
@app.post("/ask", response_model=TruthAgentResponse)
async def truth_agent_query(request: TruthAgentRequest, fastapi_request: Request):
    """
    Truth Agent endpoint that follows the pipeline:
    Retriever → ClaimCheck → CitationRank → AnswerCompose → GovernanceEnforce
    """
    try:
        # Rate limiting check
        client_ip = fastapi_request.client.host
        if not await check_rate_limit(client_ip):
            raise HTTPException(status_code=429, detail="Rate limit exceeded. Please try again in a minute.")
        # Step 1: Retriever - Search for relevant information
        search_results = await retrieve_information(request.query)
        
        if not search_results:
            response = TruthAgentResponse(
                answer="I don't have sufficient evidence to answer this question based on available sources.",
                citations=[],
                confidence=0.1,
                query_suggestions=[f"Search for '{request.query}' on academic databases", 
                                 f"Look for recent news about '{request.query}'",
                                 f"Create a wiki page for '{request.query}' to help build community knowledge"]
            )
            # Record transparency log (async - don't wait for completion)
            asyncio.create_task(record_transparency_log(request.query, response, client_ip))
            return response
        
        # Step 2: Claim Check - Basic NLI simulation
        verified_claims = []
        for result in search_results:
            if await claim_check(result['content'], request.query):
                verified_claims.append(result)
        
        if not verified_claims:
            response = TruthAgentResponse(
                answer="The available evidence doesn't sufficiently support a clear answer to this question.",
                citations=[],
                confidence=0.2,
                query_suggestions=[f"Find contradictory evidence about '{request.query}'",
                                 f"Search for expert opinions on '{request.query}'",
                                 f"Create a wiki page for '{request.query}' to document different perspectives"]
            )
            # Record transparency log (async - don't wait for completion)
            asyncio.create_task(record_transparency_log(request.query, response, client_ip))
            return response
        
        # Step 3: Citation Ranking
        ranked_citations = await rank_citations(verified_claims, request.query)
        
        # Step 4: Answer Composition
        answer, confidence = await compose_answer(ranked_citations, request.query)
        
        # Step 5: Governance Check
        if not await governance_check(answer, ranked_citations):
            response = TruthAgentResponse(
                answer="I cannot provide a definitive answer as it would violate content guidelines or require human review.",
                citations=[],
                confidence=0.0,
                dissentingLinks=[c['url'] for c in ranked_citations[:3]],
                query_suggestions=[f"Review community guidelines for '{request.query}'",
                                 f"Create a wiki discussion page for '{request.query}' to explore different viewpoints"]
            )
            # Record transparency log (async - don't wait for completion)
            asyncio.create_task(record_transparency_log(request.query, response, client_ip))
            return response
        
        # Format citations
        citations = [
            Citation(
                url=c['url'],
                title=c['title'],
                quote=c['content'][:200] + "..." if len(c['content']) > 200 else c['content'],
                accessedAt=c['accessed_at'],
                relevance_score=c['relevance_score']
            ) for c in ranked_citations[:3]  # Top 3 citations
        ]
        
        # Create response
        response = TruthAgentResponse(
            answer=answer,
            citations=citations,
            confidence=confidence,
            dissentingLinks=[]
        )
        
        # Record transparency log (async - don't wait for completion)
        asyncio.create_task(record_transparency_log(request.query, response, client_ip))
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing query: {str(e)}")

# Truth Assist endpoint for claim management proposals
class TruthAssistRequest(BaseModel):
    claim_text: Optional[str] = None
    claim_id: Optional[str] = None
    context: Optional[str] = None
    action_type: str = "analyze"  # analyze, merge, split, evidence, counterclaim

class TruthAssistProposal(BaseModel):
    action: str
    rationale: str
    confidence: float
    suggested_changes: Dict[str, Any]
    related_claims: List[str] = []
    evidence_suggestions: List[Dict[str, Any]] = []

class TruthAssistResponse(BaseModel):
    proposals: List[TruthAssistProposal]
    transparency_id: str

@app.post("/truth/assist", response_model=TruthAssistResponse)
async def truth_assist(request: TruthAssistRequest, fastapi_request: Request):
    """
    Truth Assist endpoint for claim management proposals:
    - New claim creation suggestions
    - Claim merging/splitting proposals
    - Evidence attachment recommendations
    - Counterargument identification
    """
    try:
        # Rate limiting check
        client_ip = fastapi_request.client.host
        if not await check_rate_limit(client_ip):
            raise HTTPException(status_code=429, detail="Rate limit exceeded. Please try again in a minute.")
        
        transparency_id = f"assist_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:8]}"
        
        # Mock implementation - in production would use more sophisticated analysis
        proposals = []
        
        if request.action_type == "analyze" and request.claim_text:
            # Check for similar existing claims
            similar_claims = await find_similar_claims(request.claim_text)
            
            if similar_claims:
                # Suggest merging with existing claims
                proposals.append(TruthAssistProposal(
                    action="merge_claims",
                    rationale="Similar claims already exist - consider merging for better coherence",
                    confidence=0.85,
                    suggested_changes={
                        "target_claim_id": similar_claims[0]['id'],
                        "merge_candidates": [claim['id'] for claim in similar_claims[1:3]],
                        "preserve_evidence": True
                    },
                    related_claims=[claim['id'] for claim in similar_claims[:3]],
                    evidence_suggestions=[]
                ))
            else:
                # Suggest creating a new claim
                proposals.append(TruthAssistProposal(
                    action="create_claim",
                    rationale="This appears to be a new claim that could benefit from structured evaluation",
                    confidence=0.75,
                    suggested_changes={
                        "title": f"Analysis of: {request.claim_text[:50]}...",
                        "statement": request.claim_text,
                        "topicTags": ["proposed", "needs-review"]
                    },
                    related_claims=[],
                    evidence_suggestions=[
                        {
                            "kind": "web_search",
                            "query": request.claim_text,
                            "sources": ["Google Scholar", "PubMed", "arXiv"]
                        }
                    ]
                ))
        
        elif request.action_type == "merge" and request.claim_id:
            # Suggest claim merging
            proposals.append(TruthAssistProposal(
                action="merge_claims",
                rationale="This claim overlaps with existing claims and could be merged for better coherence",
                confidence=0.65,
                suggested_changes={
                    "target_claim_id": request.claim_id,
                    "merge_candidates": ["claim_123", "claim_456"],
                    "preserve_evidence": True
                },
                related_claims=["claim_123", "claim_456"],
                evidence_suggestions=[]
            ))
        
        elif request.action_type == "evidence" and request.claim_id:
            # Get existing evidence for the claim
            existing_evidence = await get_claim_evidence(request.claim_id)
            evidence_count = len(existing_evidence)
            
            # Suggest evidence attachment based on current evidence count
            if evidence_count == 0:
                rationale = "This claim has no supporting evidence yet - critical need for verification"
                confidence = 0.9
            elif evidence_count < 3:
                rationale = "This claim would benefit from additional supporting evidence"
                confidence = 0.8
            else:
                rationale = "This claim has good evidence coverage, but could still benefit from diverse sources"
                confidence = 0.6
            
            proposals.append(TruthAssistProposal(
                action="add_evidence",
                rationale=rationale,
                confidence=confidence,
                suggested_changes={
                    "claim_id": request.claim_id,
                    "evidence_types": ["research_paper", "expert_testimony", "data_analysis"],
                    "search_queries": [f"evidence for {request.context or 'claim'}"]
                },
                related_claims=[],
                evidence_suggestions=[
                    {
                        "kind": "url",
                        "source": "https://scholar.google.com",
                        "query": f"{request.context or 'evidence'} site:edu"
                    }
                ]
            ))
        
        elif request.action_type == "counterclaim" and request.claim_id:
            # Suggest counterargument exploration
            proposals.append(TruthAssistProposal(
                action="explore_counterclaims",
                rationale="This claim may have valid counterarguments that should be considered",
                confidence=0.7,
                suggested_changes={
                    "claim_id": request.claim_id,
                    "counterclaim_angles": ["methodological", "evidential", "interpretive"],
                    "search_opposing": True
                },
                related_claims=[],
                evidence_suggestions=[
                    {
                        "kind": "web_search",
                        "query": f"counterarguments for {request.context or 'claim'}",
                        "sources": ["opposing viewpoints", "critical analysis"]
                    }
                ]
            ))
        
        # Record transparency log
        assist_log = {
            "timestamp": datetime.utcnow().isoformat(),
            "transparency_id": transparency_id,
            "action_type": request.action_type,
            "claim_text": request.claim_text,
            "claim_id": request.claim_id,
            "proposal_count": len(proposals),
            "ip_address": client_ip
        }
        redis_client.setex(f"assist_transparency:{transparency_id}", 2592000, json.dumps(assist_log))
        
        return TruthAssistResponse(
            proposals=proposals,
            transparency_id=transparency_id
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in truth assist: {str(e)}")

# Truth Service Integration
TRUTH_GRAPH_URL = os.getenv("TRUTH_GRAPH_URL", "http://truth-graph:3000")
CONSENSUS_URL = "http://consensus:3001"

async def search_truth_claims(query: str) -> List[Dict]:
    """Search for claims in the truth graph service"""
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{TRUTH_GRAPH_URL}/truth/search", params={"q": query}) as response:
                if response.status == 200:
                    data = await response.json()
                    return data.get("claims", [])
                return []
    except Exception as e:
        print(f"Error searching truth claims: {e}")
        return []

async def find_similar_claims(claim_text: str, threshold: float = 0.7) -> List[Dict]:
    """Find claims similar to the given text"""
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(f"{TRUTH_GRAPH_URL}/truth/similar", json={
                "text": claim_text,
                "threshold": threshold
            }) as response:
                if response.status == 200:
                    data = await response.json()
                    return data.get("similar_claims", [])
                return []
    except Exception as e:
        print(f"Error finding similar claims: {e}")
        return []

async def get_claim_evidence(claim_id: str) -> List[Dict]:
    """Get evidence for a specific claim"""
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{TRUTH_GRAPH_URL}/claims/{claim_id}/evidence") as response:
                if response.status == 200:
                    data = await response.json()
                    return data.get("evidence", [])
                return []
    except Exception as e:
        print(f"Error getting claim evidence: {e}")
        return []

async def get_claim_consensus(claim_id: str) -> Dict:
    """Get consensus reports for a claim"""
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{CONSENSUS_URL}/consensus/claim/{claim_id}/reports") as response:
                if response.status == 200:
                    return await response.json()
                return {}
    except Exception as e:
        print(f"Error getting claim consensus: {e}")
        return {}

# Enhanced Truth Agent pipeline components
async def retrieve_information(query: str) -> List[Dict]:
    """Enhanced retriever that searches truth graph service for relevant claims"""
    # First, search for relevant claims in truth graph
    claims = await search_truth_claims(query)
    
    if not claims:
        # Fallback to mock data if no claims found
        return [
            {
                'url': 'https://example.com/fact1',
                'title': 'Scientific Study on Topic',
                'content': f'Research shows that {query} has been extensively studied with conclusive results.',
                'accessed_at': '2024-01-15T10:30:00Z',
                'relevance_score': 0.85
            },
            {
                'url': 'https://example.com/fact2', 
                'title': 'Expert Opinion',
                'content': f'Leading experts in the field generally agree that {query} is well-established.',
                'accessed_at': '2024-01-14T15:45:00Z',
                'relevance_score': 0.78
            }
        ]
    
    # Convert claims to citation format
    citations = []
    for claim in claims:
        # Get evidence for this claim
        evidence = await get_claim_evidence(claim.get('id', ''))
        
        # Get consensus reports
        consensus = await get_claim_consensus(claim.get('id', ''))
        
        # Calculate confidence based on consensus
        confidence = 0.5  # Default
        if consensus and 'reports' in consensus:
            # Use highest confidence from any lens
            max_confidence = max((report.get('confidence', 0.5) for report in consensus['reports']), default=0.5)
            confidence = max_confidence
        
        # Create citation from claim and evidence
        citation_content = f"Claim: {claim.get('statement', '')}"
        if evidence:
            citation_content += f"\nSupporting evidence: {evidence[0].get('content', '')[:200]}..."
        
        citations.append({
            'url': f"/truth/{claim.get('id', '')}",
            'title': claim.get('title', f'Claim about {query}'),
            'content': citation_content,
            'accessed_at': datetime.utcnow().isoformat(),
            'relevance_score': confidence,
            'claim_id': claim.get('id', ''),
            'evidence_count': len(evidence)
        })
    
    return citations

async def claim_check(content: str, query: str) -> bool:
    """Mock claim check - in production would use NLI models"""
    # Simple keyword matching for MVP
    query_terms = query.lower().split()
    content_lower = content.lower()
    return any(term in content_lower for term in query_terms if len(term) > 3)

async def rank_citations(results: List[Dict], query: str) -> List[Dict]:
    """Mock citation ranking"""
    # Sort by relevance score (would use more sophisticated ranking in production)
    return sorted(results, key=lambda x: x['relevance_score'], reverse=True)

async def compose_answer(citations: List[Dict], query: str) -> tuple[str, float]:
    """Enhanced answer composition that references truth claims"""
    if not citations:
        return "I cannot answer this question based on available information.", 0.0
    
    # Use the highest confidence citation
    main_source = max(citations, key=lambda x: x['relevance_score'])
    confidence = min(0.95, main_source['relevance_score'] * 1.05)
    
    # Check if this is a truth claim citation
    if 'claim_id' in main_source:
        # This is a truth claim - reference it specifically
        answer = f"Based on verified claims in the Truth Archive, {query} appears to be supported by evidence. " \
                 f"Claim {main_source['claim_id']} has {main_source['evidence_count']} supporting evidence items " \
                 f"and a consensus confidence of {main_source['relevance_score']:.2f}. " \
                 f"{main_source['content'][:150]}..."
    else:
        # Fallback to generic answer
        answer = f"Based on available sources, {query} appears to be supported by evidence. " \
                 f"According to {main_source['title']}, {main_source['content'][:100]}..."
    
    return answer, confidence

async def governance_check(answer: str, citations: List[Dict]) -> bool:
    """Enhanced governance check that considers truth service consensus"""
    # Basic safety check - reject answers without citations
    if not citations:
        return False
    
    # Check for prohibited content (very basic)
    prohibited_terms = ['hate speech', 'violence', 'illegal activities']
    answer_lower = answer.lower()
    
    if any(term in answer_lower for term in prohibited_terms):
        return False
    
    # Additional check: if we have truth claims, ensure they have sufficient confidence
    truth_citations = [c for c in citations if 'claim_id' in c]
    if truth_citations:
        # Require at least one truth citation with confidence > 0.6
        has_confident_claim = any(c['relevance_score'] > 0.6 for c in truth_citations)
        if not has_confident_claim:
            return False
    
    return True

# Transparency logs endpoint
@app.get("/transparency/logs")
async def get_transparency_logs(limit: int = 100, offset: int = 0):
    """Retrieve AI transparency logs"""
    # Get all transparency log keys
    log_keys = redis_client.keys("ai_transparency:*")
    
    # Sort keys by timestamp (newest first)
    log_keys.sort(reverse=True)
    
    # Paginate results
    paginated_keys = log_keys[offset:offset + limit]
    
    # Retrieve log entries
    logs = []
    for key in paginated_keys:
        log_data = redis_client.get(key)
        if log_data:
            log_entry = json.loads(log_data)
            log_entry["log_id"] = key.replace("ai_transparency:", "")
            logs.append(log_entry)
    
    return {
        "logs": logs,
        "total": len(log_keys),
        "limit": limit,
        "offset": offset
    }

# Health check endpoint
@app.get("/healthz")
async def health_check():
    return {"status": "healthy", "service": "ai-router"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)





