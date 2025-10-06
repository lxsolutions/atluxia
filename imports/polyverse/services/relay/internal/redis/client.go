


package redis

import (
	"context"
	"fmt"
	"log"
	"strconv"
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

	log.Printf("Redis client connected to: %s", cfg.URL)

	return &Client{
		client: client,
	}, nil
}

func (c *Client) RateLimit(ctx context.Context, key string, limit int, window time.Duration) (bool, error) {
	now := time.Now().UnixNano()
	windowMicro := window.Microseconds()
	clearBefore := now - windowMicro

	// Remove old timestamps
	c.client.ZRemRangeByScore(ctx, key, "0", strconv.FormatInt(clearBefore, 10))

	// Count current requests in window
	count, err := c.client.ZCard(ctx, key).Result()
	if err != nil {
		return false, fmt.Errorf("failed to get request count: %w", err)
	}

	if int(count) >= limit {
		return false, nil // Rate limited
	}

	// Add current request timestamp
	member := &redis.Z{
		Score:  float64(now),
		Member: now,
	}
	if err := c.client.ZAdd(ctx, key, *member).Err(); err != nil {
		return false, fmt.Errorf("failed to add request timestamp: %w", err)
	}

	// Set expiration on the key
	if err := c.client.Expire(ctx, key, window).Err(); err != nil {
		return false, fmt.Errorf("failed to set key expiration: %w", err)
	}

	return true, nil // Not rate limited
}

func (c *Client) GetRemainingRequests(ctx context.Context, key string, limit int) (int, error) {
	count, err := c.client.ZCard(ctx, key).Result()
	if err != nil {
		return 0, fmt.Errorf("failed to get request count: %w", err)
	}
	return limit - int(count), nil
}

func (c *Client) HealthCheck(ctx context.Context) error {
	return c.client.Ping(ctx).Err()
}

func (c *Client) Close() error {
	return c.client.Close()
}


