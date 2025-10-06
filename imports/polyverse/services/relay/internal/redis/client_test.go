

package redis

import (
"context"
"testing"
"time"
)

func TestRedisClientCreation(t *testing.T) {
// This is a basic test to ensure the client can be created
// without actually connecting to a Redis server
cfg := Config{
URL: "redis://localhost:6379",
}

// This should fail since we don't have a Redis server running,
// but it should fail gracefully with a connection error, not a panic
client, err := NewClient(cfg)
if err == nil {
t.Error("Expected connection error when no Redis server is available")
client.Close()
return
}

// Should get a connection error
if err != nil {
t.Logf("Expected connection error: %v", err)
}
}

func TestRedisConfigValidation(t *testing.T) {
tests := []struct {
name    string
cfg     Config
wantErr bool
}{
{
name:    "empty URL",
cfg:     Config{URL: ""},
wantErr: true,
},
{
name:    "invalid URL",
cfg:     Config{URL: "invalid://url"},
wantErr: true,
},
{
name:    "valid URL",
cfg:     Config{URL: "redis://localhost:6379"},
wantErr: true, // Should fail because no Redis server is running
},
}

for _, tt := range tests {
t.Run(tt.name, func(t *testing.T) {
_, err := NewClient(tt.cfg)
if (err != nil) != tt.wantErr {
t.Errorf("NewClient() error = %v, wantErr %v", err, tt.wantErr)
}
})
}
}

func TestRedisRateLimitLogic(t *testing.T) {
	// Create a client that will fail to connect
	cfg := Config{
		URL: "redis://localhost:6379",
	}
	
	client, err := NewClient(cfg)
	if err == nil {
		t.Error("Expected client creation to fail")
		client.Close()
		return
	}
	
	// RateLimit should fail for client that failed to connect
	if client != nil {
		ctx := context.Background()
		_, err := client.RateLimit(ctx, "test", 10, time.Minute)
		if err == nil {
			t.Error("RateLimit should fail for client that failed to connect")
		}
	}
}

func TestRedisHealthCheck(t *testing.T) {
	// Create a client that will fail to connect
	cfg := Config{
		URL: "redis://localhost:6379",
	}
	
	client, err := NewClient(cfg)
	if err == nil {
		t.Error("Expected client creation to fail")
		client.Close()
		return
	}
	
	// HealthCheck should fail for client that failed to connect
	if client != nil {
		ctx := context.Background()
		err := client.HealthCheck(ctx)
		if err == nil {
			t.Error("HealthCheck should fail for client that failed to connect")
		}
	}
}

