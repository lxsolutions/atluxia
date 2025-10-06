"""
PolyVerse integration service for emitting PlayfulSignals and linking to Truth Archive
"""

import httpx
import json
import logging
from datetime import datetime
from typing import Dict, Any, Optional
from decimal import Decimal
from app.core.config import settings

logger = logging.getLogger(__name__)


class PolyVerseIntegration:
    def __init__(self):
        self.truth_graph_url = settings.TRUTH_GRAPH_URL
        self.indexer_url = settings.INDEXER_URL
        self.enabled = settings.POLYVERSE_INTEGRATION_ENABLED
    
    async def emit_playful_signal(self, dispute_data: Dict[str, Any]) -> bool:
        """
        Emit a PlayfulSignal to the Truth Archive when a dispute is resolved
        """
        if not self.enabled:
            logger.info("PolyVerse integration disabled, skipping PlayfulSignal emission")
            return False
        
        try:
            # Validate we have required data
            if not dispute_data.get('truth_claim_id') or not dispute_data.get('winner_id'):
                logger.warning("Cannot emit PlayfulSignal: missing truth_claim_id or winner_id")
                return False
            
            # Cap the signal strength at 2%
            signal_strength = min(
                Decimal('0.02'), 
                Decimal(str(dispute_data.get('playful_signal_strength', 0.02)))
            )
            
            playful_signal = {
                "type": "PlayfulSignal",
                "claimId": dispute_data['truth_claim_id'],
                "argumentId": f"dispute_{dispute_data['id']}",  # Use dispute ID as argument ID
                "winnerSide": dispute_data['winner_side'],
                "signalStrength": float(signal_strength),
                "matchMeta": {
                    "gameType": dispute_data.get('game_name', 'unknown'),
                    "verificationConfidence": 1.0 if dispute_data.get('winner_proof_verified') else 0.5,
                    "verificationMethod": "manual_heuristic",
                    "disputeId": str(dispute_data['id']),
                    "timestamp": dispute_data.get('resolved_at', datetime.utcnow().isoformat())
                },
                "sig": ""  # TODO: Add proper signature
            }
            
            # Send to Indexer for ingestion
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.indexer_url}/truth/playful-signal",
                    json=playful_signal,
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    logger.info(f"PlayfulSignal emitted for dispute {dispute_data['id']}")
                    return True
                else:
                    logger.error(f"Failed to emit PlayfulSignal: {response.text}")
                    return False
                    
        except Exception as e:
            logger.error(f"Error emitting PlayfulSignal: {str(e)}")
            return False
    
    async def link_dispute_to_claim(self, dispute_id: int, claim_id: str) -> bool:
        """
        Link a dispute to a Truth Archive claim
        """
        if not self.enabled:
            return True  # Silently succeed if integration is disabled
            
        try:
            # This would typically involve updating the claim with dispute reference
            # For now, we'll just log the linkage
            logger.info(f"Linking dispute {dispute_id} to claim {claim_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error linking dispute to claim: {str(e)}")
            return False
    
    async def get_claim_info(self, claim_id: str) -> Optional[Dict[str, Any]]:
        """
        Get information about a Truth Archive claim
        """
        if not self.enabled:
            return None
            
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.truth_graph_url}/claims/{claim_id}",
                    timeout=5.0
                )
                
                if response.status_code == 200:
                    return response.json()
                else:
                    logger.warning(f"Claim {claim_id} not found: {response.status_code}")
                    return None
                    
        except Exception as e:
            logger.error(f"Error fetching claim info: {str(e)}")
            return None


# Singleton instance
polyverse_integration = PolyVerseIntegration()