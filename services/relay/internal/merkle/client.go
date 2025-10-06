package merkle

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"log"
	"time"

	"github.com/redis/go-redis/v9"
)

type Client struct {
	client *redis.Client
}

type Config struct {
	URL string
}

func NewClient(cfg Config) (*Client, error) {
	opts, err := redis.ParseURL(cfg.URL)
	if err != nil {
		return nil, fmt.Errorf("failed to parse Redis URL: %w", err)
	}

	client := redis.NewClient(opts)

	// Test connection
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := client.Ping(ctx).Err(); err != nil {
		return nil, fmt.Errorf("failed to connect to Redis: %w", err)
	}

	log.Printf("Merkle Redis client connected to: %s", cfg.URL)

	return &Client{
		client: client,
	}, nil
}

// AppendEvent adds an event to the merkle log and returns the new merkle root
func (c *Client) AppendEvent(ctx context.Context, eventID string, eventData []byte) (string, error) {
	// Calculate hash of the event
	eventHash := sha256.Sum256(eventData)
	eventHashHex := hex.EncodeToString(eventHash[:])

	// Get the current merkle tree state
	currentRoot, err := c.client.Get(ctx, "merkle:root").Result()
	if err == redis.Nil {
		// First event, root is the event hash itself
		currentRoot = eventHashHex
	} else if err != nil {
		return "", fmt.Errorf("failed to get current merkle root: %w", err)
	}

	// Build new merkle root (simple concatenation and hash for MVP)
	// For MVP, we'll use a simple approach: hash(currentRoot + eventHash)
	newRootData := currentRoot + eventHashHex
	newRootHash := sha256.Sum256([]byte(newRootData))
	newRootHex := hex.EncodeToString(newRootHash[:])

	// Store the event
	if err := c.client.Set(ctx, fmt.Sprintf("merkle:event:%s", eventID), eventHashHex, 0).Err(); err != nil {
		return "", fmt.Errorf("failed to store event hash: %w", err)
	}

	// Update the merkle root
	if err := c.client.Set(ctx, "merkle:root", newRootHex, 0).Err(); err != nil {
		return "", fmt.Errorf("failed to update merkle root: %w", err)
	}

	// Add to event log
	if err := c.client.RPush(ctx, "merkle:log", eventID).Err(); err != nil {
		return "", fmt.Errorf("failed to add event to log: %w", err)
	}

	return newRootHex, nil
}

// GetRoot returns the current merkle root
func (c *Client) GetRoot(ctx context.Context) (string, error) {
	root, err := c.client.Get(ctx, "merkle:root").Result()
	if err == redis.Nil {
		return "", nil // No root yet
	}
	if err != nil {
		return "", fmt.Errorf("failed to get merkle root: %w", err)
	}
	return root, nil
}

// VerifyEvent verifies that an event is included in the merkle log
func (c *Client) VerifyEvent(ctx context.Context, eventID string, eventData []byte) (bool, error) {
	// Calculate expected hash
	expectedHash := sha256.Sum256(eventData)
	expectedHashHex := hex.EncodeToString(expectedHash[:])

	// Get stored hash
	storedHash, err := c.client.Get(ctx, fmt.Sprintf("merkle:event:%s", eventID)).Result()
	if err == redis.Nil {
		return false, nil // Event not found
	}
	if err != nil {
		return false, fmt.Errorf("failed to get event hash: %w", err)
	}

	return storedHash == expectedHashHex, nil
}

// HealthCheck checks if the merkle service is healthy
func (c *Client) HealthCheck(ctx context.Context) error {
	return c.client.Ping(ctx).Err()
}

// Close closes the Redis connection
func (c *Client) Close() error {
	return c.client.Close()
}