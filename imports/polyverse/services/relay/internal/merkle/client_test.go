package merkle

import (
	"context"
	"testing"
	"time"

	"github.com/redis/go-redis/v9"
)

func TestMerkleClient(t *testing.T) {
	// Create a test Redis client
	opts := &redis.Options{
		Addr: "localhost:6379",
	}
	
	// Skip test if Redis is not available
	client := redis.NewClient(opts)
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()
	
	if err := client.Ping(ctx).Err(); err != nil {
		t.Skip("Redis not available, skipping merkle test")
	}
	client.Close()

	// Test with actual Redis connection
	cfg := Config{
		URL: "redis://localhost:6379",
	}
	
	merkleClient, err := NewClient(cfg)
	if err != nil {
		t.Fatalf("Failed to create merkle client: %v", err)
	}
	defer merkleClient.Close()

	t.Run("TestAppendAndGetRoot", func(t *testing.T) {
		ctx := context.Background()
		
		// Clear any existing data
		merkleClient.client.FlushDB(ctx)
		
		// First event
		event1 := []byte(`{"id": "event1", "kind": "post", "text": "Hello World"}`)
		root1, err := merkleClient.AppendEvent(ctx, "event1", event1)
		if err != nil {
			t.Fatalf("Failed to append first event: %v", err)
		}
		
		if root1 == "" {
			t.Error("Expected non-empty root for first event")
		}
		
		// Second event
		event2 := []byte(`{"id": "event2", "kind": "post", "text": "Hello Again"}`)
		root2, err := merkleClient.AppendEvent(ctx, "event2", event2)
		if err != nil {
			t.Fatalf("Failed to append second event: %v", err)
		}
		
		if root2 == "" {
			t.Error("Expected non-empty root for second event")
		}
		
		if root1 == root2 {
			t.Error("Root should change after adding second event")
		}
		
		// Verify events
		valid1, err := merkleClient.VerifyEvent(ctx, "event1", event1)
		if err != nil {
			t.Fatalf("Failed to verify event1: %v", err)
		}
		if !valid1 {
			t.Error("Event1 should be valid")
		}
		
		valid2, err := merkleClient.VerifyEvent(ctx, "event2", event2)
		if err != nil {
			t.Fatalf("Failed to verify event2: %v", err)
		}
		if !valid2 {
			t.Error("Event2 should be valid")
		}
		
		// Test with wrong data
		wrongData := []byte(`{"id": "event1", "kind": "post", "text": "Wrong Data"}`)
		validWrong, err := merkleClient.VerifyEvent(ctx, "event1", wrongData)
		if err != nil {
			t.Fatalf("Failed to verify wrong data: %v", err)
		}
		if validWrong {
			t.Error("Wrong data should not be valid")
		}
		
		// Test GetRoot
		currentRoot, err := merkleClient.GetRoot(ctx)
		if err != nil {
			t.Fatalf("Failed to get root: %v", err)
		}
		if currentRoot != root2 {
			t.Errorf("GetRoot returned %s, expected %s", currentRoot, root2)
		}
	})
}