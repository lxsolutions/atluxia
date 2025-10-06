



package events

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

type EventKind string

const (
	EventPost     EventKind = "post"
	EventRepost   EventKind = "repost"
	EventFollow   EventKind = "follow"
	EventLike     EventKind = "like"
	EventProfile  EventKind = "profile"
)

type PVPEvent struct {
	ID          string      `json:"id"`
	Kind        EventKind   `json:"kind"`
	CreatedAt   int64       `json:"created_at"`
	AuthorDID   string      `json:"author_did"`
	Body        EventBody   `json:"body"`
	Refs        []string    `json:"refs,omitempty"`
	Signature   string      `json:"sig"`
}

type EventBody struct {
	Text  string `json:"text"`
	Media string `json:"media,omitempty"`
}

// NewEvent creates a new unsigned PVP event
func NewEvent(kind EventKind, authorDID string, body EventBody) *PVPEvent {
	return &PVPEvent{
		ID:        uuid.New().String(),
		Kind:      kind,
		CreatedAt: time.Now().Unix(),
		AuthorDID: authorDID,
		Body:      body,
	}
}

// Sign signs the event with a given private key
func (e *PVPEvent) Sign(privateKey []byte) error {
	// TODO: Implement signing logic

	return nil
}

// Verify verifies the signature of an event
func Verify(event *PVPEvent, publicKey []byte) bool {
	// TODO: Implement verification logic

	return true
}

// ToJSON converts the event to its canonical JSON form for signing/verification
func (e *PVPEvent) ToJSON() ([]byte, error) {
	return json.Marshal(e)
}



