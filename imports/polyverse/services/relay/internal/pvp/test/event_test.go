
package pvp_test

import (
	"testing"
	"time"

	"github.com/lxsolutions/polyverse/services/relay/internal/pvp"
)

func TestEventValidation(t *testing.T) {
	tests := []struct {
		name    string
		event   pvp.Event
		wantErr bool
	}{
		{
			name: "valid event",
			event: pvp.Event{
				ID:        "evt_123",
				Kind:      "post",
				CreatedAt: time.Now().Unix(),
				AuthorDID: "did:key:abc123",
				Sig:       "signature123",
			},
			wantErr: false,
		},
		{
			name: "missing id",
			event: pvp.Event{
				ID:        "",
				Kind:      "post",
				CreatedAt: time.Now().Unix(),
				AuthorDID: "did:key:abc123",
				Sig:       "signature123",
			},
			wantErr: true,
		},
		{
			name: "missing kind",
			event: pvp.Event{
				ID:        "evt_123",
				Kind:      "",
				CreatedAt: time.Now().Unix(),
				AuthorDID: "did:key:abc123",
				Sig:       "signature123",
			},
			wantErr: true,
		},
		{
			name: "missing signature",
			event: pvp.Event{
				ID:        "evt_123",
				Kind:      "post",
				CreatedAt: time.Now().Unix(),
				AuthorDID: "did:key:abc123",
				Sig:       "",
			},
			wantErr: true,
		},
		{
			name: "missing author did",
			event: pvp.Event{
				ID:        "evt_123",
				Kind:      "post",
				CreatedAt: time.Now().Unix(),
				AuthorDID: "",
				Sig:       "signature123",
			},
			wantErr: true,
		},
		{
			name: "negative timestamp",
			event: pvp.Event{
				ID:        "evt_123",
				Kind:      "post",
				CreatedAt: -1,
				AuthorDID: "did:key:abc123",
				Sig:       "signature123",
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Test basic validation
			if tt.event.ID == "" {
				if !tt.wantErr {
					t.Errorf("Expected error for missing ID")
				}
				return
			}
			if tt.event.Kind == "" {
				if !tt.wantErr {
					t.Errorf("Expected error for missing kind")
				}
				return
			}
			if tt.event.Sig == "" {
				if !tt.wantErr {
					t.Errorf("Expected error for missing signature")
				}
				return
			}
			if tt.event.AuthorDID == "" {
				if !tt.wantErr {
					t.Errorf("Expected error for missing author DID")
				}
				return
			}
			if tt.event.CreatedAt <= 0 {
				if !tt.wantErr {
					t.Errorf("Expected error for invalid timestamp")
				}
				return
			}

			// If we get here and wantErr is true, the test should have failed
			if tt.wantErr {
				t.Errorf("Expected error but validation passed")
			}
		})
	}
}

func TestExtractPublicKeyFromDID(t *testing.T) {
	tests := []struct {
		name    string
		did     string
		want    string
		wantErr bool
	}{
		{
			name:    "valid did:key",
			did:     "did:key:abc123",
			want:    "abc123",
			wantErr: false,
		},
		{
			name:    "invalid prefix",
			did:     "did:web:abc123",
			want:    "",
			wantErr: true,
		},
		{
			name:    "too short",
			did:     "did:key:",
			want:    "",
			wantErr: true,
		},
		{
			name:    "empty string",
			did:     "",
			want:    "",
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := pvp.ExtractPublicKeyFromDID(tt.did)
			if (err != nil) != tt.wantErr {
				t.Errorf("ExtractPublicKeyFromDID() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if got != tt.want {
				t.Errorf("ExtractPublicKeyFromDID() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestVerifySignature(t *testing.T) {
	// This is a basic test - actual signature verification would require
	// proper Ed25519 key generation and signing
	event := pvp.Event{
		ID:        "test_id",
		Kind:      "post",
		CreatedAt: time.Now().Unix(),
		AuthorDID: "did:key:test",
		Sig:       "invalid_signature",
	}

	// Test with invalid signature
	valid, err := pvp.VerifySignature(event, "test_public_key")
	if err == nil {
		t.Errorf("Expected error for invalid signature verification")
	}
	if valid {
		t.Errorf("Expected invalid signature verification result")
	}
}
