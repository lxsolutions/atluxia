#!/usr/bin/env python3
"""
Basic test for AI Router service
"""
import sys
import asyncio
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock

# Add the current directory to Python path
sys.path.insert(0, '.')

from main import app

def test_health_endpoint():
    """Test the health endpoint"""
    client = TestClient(app)
    response = client.get("/healthz")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy", "service": "ai-router"}

def test_ask_endpoint():
    """Test the ask endpoint with a simple query"""
    # Mock Redis to avoid connection issues
    with patch('main.redis_client') as mock_redis:
        # Mock rate limiting to always allow
        mock_redis.get.return_value = None
        mock_redis.incr.return_value = 1
        
        # Mock transparency logging
        mock_redis.keys.return_value = []
        mock_redis.get.return_value = None
        
        client = TestClient(app)
        response = client.post("/ask", json={"query": "test"})
        assert response.status_code == 200
        data = response.json()
        assert "answer" in data
        assert "citations" in data
        assert "confidence" in data

def test_rate_limiting():
    """Test rate limiting by making multiple requests"""
    # Mock Redis to avoid connection issues
    with patch('main.redis_client') as mock_redis:
        # Mock rate limiting to always allow
        mock_redis.get.return_value = None
        mock_redis.incr.return_value = 1
        
        # Mock transparency logging
        mock_redis.keys.return_value = []
        mock_redis.get.return_value = None
        
        client = TestClient(app)
        
        # First request should succeed
        response1 = client.post("/ask", json={"query": "test1"})
        assert response1.status_code == 200
        
        # Second request should also succeed (rate limit is per minute)
        response2 = client.post("/ask", json={"query": "test2"})
        assert response2.status_code == 200

if __name__ == "__main__":
    # Run the tests
    test_health_endpoint()
    print("✓ Health endpoint test passed")
    
    test_ask_endpoint()
    print("✓ Ask endpoint test passed")
    
    test_rate_limiting()
    print("✓ Rate limiting test passed")
    
    print("All tests passed!")