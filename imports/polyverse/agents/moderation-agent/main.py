


import asyncio
import json
import redis
from typing import Dict, Any

class ModerationAgent:
    def __init__(self, redis_host: str = 'redis', redis_port: int = 6379):
        self.redis = redis.Redis(host=redis_host, port=redis_port, decode_responses=True)
        self.pubsub = self.redis.pubsub()
        
    async def start(self):
        """Start listening for moderation tasks"""
        print("Starting Moderation Agent...")
        self.pubsub.subscribe('moderation_tasks')
        
        for message in self.pubsub.listen():
            if message['type'] == 'message':
                try:
                    task = json.loads(message['data'])
                    result = await self.process_task(task)
                    # Store result in Redis and publish
                    result_key = f"task_result:{task['task_id']}"
                    self.redis.setex(result_key, 3600, json.dumps(result))  # Store for 1 hour
                    self.redis.publish(f"task_result_{task['task_id']}", json.dumps(result))
                except Exception as e:
                    print(f"Error processing task: {e}")
    
    async def process_task(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """Process a moderation task"""
        print(f"Processing moderation task: {task}")
        
        # Extract task data
        content = task.get('content', '')
        author = task.get('author', '')
        task_id = task.get('task_id', '')
        
        # Simple moderation logic (in production, this would use ML models)
        labels = []
        
        # Check for spam keywords
        spam_keywords = ['spam', 'scam', 'phishing', 'buy now', 'limited time']
        for keyword in spam_keywords:
            if keyword.lower() in content.lower():
                labels.append({
                    'label': 'spam',
                    'confidence': 0.85,
                    'evidence': f'Contains spam keyword: {keyword}'
                })
        
        # Check for hate speech
        hate_keywords = ['hate', 'racist', 'bigot', 'discriminate']
        for keyword in hate_keywords:
            if keyword.lower() in content.lower():
                labels.append({
                    'label': 'hate_speech',
                    'confidence': 0.9,
                    'evidence': f'Contains hate speech keyword: {keyword}'
                })
        
        # Check for adult content
        adult_keywords = ['nsfw', 'explicit', 'adult', '18+']
        for keyword in adult_keywords:
            if keyword.lower() in content.lower():
                labels.append({
                    'label': 'adult_content',
                    'confidence': 0.8,
                    'evidence': f'Contains adult content keyword: {keyword}'
                })
        
        # Decision based on labels
        decision = 'allow'
        if any(label['confidence'] > 0.8 for label in labels):
            decision = 'review'
        if any(label['label'] == 'hate_speech' and label['confidence'] > 0.85 for label in labels):
            decision = 'block'
        
        return {
            'task_id': task_id,
            'decision': decision,
            'labels': labels,
            'content_preview': content[:100] + '...' if len(content) > 100 else content
        }

if __name__ == "__main__":
    agent = ModerationAgent()
    asyncio.run(agent.start())


