
package pvp

import (
	"crypto/ed25519"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log"
)

// Event represents a PVP event
type Event struct {
	ID        string                 `json:"id"`
	Kind      string                 `json:"kind"`
	CreatedAt int64                  `json:"created_at"`
	AuthorDID string                 `json:"author_did"`
	Body      map[string]interface{} `json:"body,omitempty"`
	Refs      []interface{}          `json:"refs,omitempty"`
	Sig       string                 `json:"sig"`
}

// VerificationData represents the canonical structure for signature verification
type VerificationData struct {
	Kind      string                 `json:"kind"`
	CreatedAt int64                  `json:"created_at"`
	AuthorDID string                 `json:"author_did"`
	Body      map[string]interface{} `json:"body,omitempty"`
	Refs      []interface{}          `json:"refs"` // Always include refs field, even when empty
}

// VerifySignature verifies the Ed25519 signature of a PVP event
func VerifySignature(event Event, publicKeyBase64 string) (bool, error) {
	// Decode the public key from base64
	publicKey, err := base64.StdEncoding.DecodeString(publicKeyBase64)
	if err != nil {
		return false, fmt.Errorf("failed to decode public key: %v", err)
	}

	// Decode the signature from base64
	signature, err := base64.StdEncoding.DecodeString(event.Sig)
	if err != nil {
		return false, fmt.Errorf("failed to decode signature: %v", err)
	}

	// Create the canonical JSON for verification (same as signing process)
	// Use a struct to ensure consistent field ordering: kind, created_at, author_did, body, refs
	verificationData := VerificationData{
		Kind:      event.Kind,
		CreatedAt: event.CreatedAt,
		AuthorDID: event.AuthorDID,
		Body:      event.Body,
		Refs:      event.Refs,
	}

	// Convert to canonical JSON
	canonicalJSON, err := json.Marshal(verificationData)
	if err != nil {
		return false, fmt.Errorf("failed to marshal verification data: %v", err)
	}

	// Verify the signature
	isValid := ed25519.Verify(publicKey, canonicalJSON, signature)
	if !isValid {
		log.Printf("Signature verification failed for event %s", event.ID)
		log.Printf("Public key: %s", publicKeyBase64)
		log.Printf("Signature: %s", event.Sig)
		log.Printf("Canonical JSON: %s", string(canonicalJSON))
	}

	return isValid, nil
}

// ExtractPublicKeyFromDID extracts the public key from a DID:key format
// For now, we assume the DID is in format "did:key:base64publickey"
func ExtractPublicKeyFromDID(did string) (string, error) {
	if len(did) < 11 || did[:8] != "did:key:" {
		return "", fmt.Errorf("invalid DID format: %s", did)
	}
	return did[8:], nil // Return the base64 public key part
}
