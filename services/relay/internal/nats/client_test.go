


package nats

import (
	"testing"
)

func TestNATSClientCreation(t *testing.T) {
	// This is a basic test to ensure the client can be created
	// without actually connecting to a NATS server
	cfg := Config{
		URL:    "nats://localhost:4222",
		Stream: "test_stream",
		Topic:  "test.topic",
	}

	// This should fail since we don't have a NATS server running,
	// but it should fail gracefully with a connection error, not a panic
	client, err := NewClient(cfg)
	if err == nil {
		t.Error("Expected connection error when no NATS server is available")
		client.Close()
		return
	}

	// Should get a connection error
	if err != nil {
		t.Logf("Expected connection error: %v", err)
	}
}

func TestNATSConfigValidation(t *testing.T) {
	tests := []struct {
		name    string
		cfg     Config
		wantErr bool
	}{
		{
			name:    "empty URL",
			cfg:     Config{URL: "", Stream: "test", Topic: "test"},
			wantErr: true,
		},
		{
			name:    "empty Stream",
			cfg:     Config{URL: "nats://localhost:4222", Stream: "", Topic: "test"},
			wantErr: true,
		},
		{
			name:    "empty Topic",
			cfg:     Config{URL: "nats://localhost:4222", Stream: "test", Topic: ""},
			wantErr: true,
		},
		{
			name:    "valid config",
			cfg:     Config{URL: "nats://localhost:4222", Stream: "test", Topic: "test.topic"},
			wantErr: true, // Should fail because no NATS server is running
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

func TestNATSHealthCheck(t *testing.T) {
	// Create a client that will fail to connect
	cfg := Config{
		URL:    "nats://localhost:4222",
		Stream: "test",
		Topic:  "test.topic",
	}
	
	client, err := NewClient(cfg)
	if err == nil {
		t.Error("Expected client creation to fail")
		client.Close()
		return
	}
	
	// HealthCheck should fail for client that failed to connect
	if client != nil {
		err := client.HealthCheck()
		if err == nil {
			t.Error("HealthCheck should fail for client that failed to connect")
		}
	}
}


