import asyncio
import json
import redis
from typing import Dict, Any

class SummarizerAgent:
    def __init__(self, redis_host: str = "redis", redis_port: int = 6379):
        self.redis = redis.Redis(host=redis_host, port=redis_port, decode_responses=True)
        self.pubsub = self.redis.pubsub()
        
    async def start(self):
        """Start listening for summarization tasks"""
        print("Starting Summarizer Agent...")
        self.pubsub.subscribe("summarization_tasks")
        
        for message in self.pubsub.listen():
            if message["type"] == "message":
                try:
                    task = json.loads(message["data"])
                    result = await self.process_task(task)
                    # Publish result
                    result_key = f"task_result:{task['task_id']}"; self.redis.setex(result_key, 3600, json.dumps(result)); self.redis.publish(f"task_result_{task['task_id']}", json.dumps(result))
                except Exception as e:
                    print(f"Error processing task: {e}")
    
    async def process_task(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """Process a summarization task"""
        print(f"Processing summarization task: {task}")
        
        task_id = task.get("task_id", "")
        content = task.get("content", "")
        model_policy = task.get("model_policy", "balanced")
        
        # Simple summarization logic (in production, this would call AI models)
        words = content.split()
        if len(words) <= 10:
            summary = content
        else:
            # Simple extractive summarization
            summary = " ".join(words[:5]) + " ... " + " ".join(words[-5:])
        
        return {
            "task_id": task_id,
            "summary": summary,
            "model_policy": model_policy,
            "original_length": len(words),
            "summary_length": len(summary.split())
        }

if __name__ == "__main__":
    agent = SummarizerAgent()
    asyncio.run(agent.start())
