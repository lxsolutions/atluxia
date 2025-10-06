

package nats

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/nats-io/nats.go"
)

type Client struct {
	conn *nats.Conn
	js   nats.JetStreamContext
}

type Config struct {
	URL    string
	Stream string
	Topic  string
}

func NewClient(cfg Config) (*Client, error) {
	// Connect to NATS server
	conn, err := nats.Connect(cfg.URL)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to NATS: %w", err)
	}

	// Create JetStream context
	js, err := conn.JetStream()
	if err != nil {
		conn.Close()
		return nil, fmt.Errorf("failed to create JetStream context: %w", err)
	}

	// Create stream if it doesn't exist
	streamCfg := &nats.StreamConfig{
		Name:        cfg.Stream,
		Description: "PolyVerse event stream",
		Subjects:    []string{cfg.Topic},
		Retention:   nats.LimitsPolicy,
		MaxAge:      24 * time.Hour * 7, // 7 days retention
		MaxBytes:    1024 * 1024 * 1024, // 1GB
		Storage:     nats.FileStorage,
	}

	_, err = js.AddStream(streamCfg)
	if err != nil && err != nats.ErrStreamNameAlreadyInUse {
		conn.Close()
		return nil, fmt.Errorf("failed to create stream: %w", err)
	}

	log.Printf("NATS client connected to stream: %s, topic: %s", cfg.Stream, cfg.Topic)

	return &Client{
		conn: conn,
		js:   js,
	}, nil
}

func (c *Client) PublishEvent(ctx context.Context, subject string, event interface{}) error {
	data, err := json.Marshal(event)
	if err != nil {
		return fmt.Errorf("failed to marshal event: %w", err)
	}

	_, err = c.js.Publish(subject, data)
	if err != nil {
		return fmt.Errorf("failed to publish event: %w", err)
	}

	log.Printf("Event published to NATS subject: %s", subject)
	return nil
}

func (c *Client) SubscribeEvents(ctx context.Context, subject string, handler func([]byte) error) error {
	_, err := c.js.Subscribe(subject, func(m *nats.Msg) {
		if err := handler(m.Data); err != nil {
			log.Printf("Error processing event: %v", err)
			// Don't ack the message if processing failed
			return
		}
		// Ack the message if processing succeeded
		m.Ack()
	}, nats.DeliverAll(), nats.ManualAck())

	if err != nil {
		return fmt.Errorf("failed to subscribe to subject: %w", err)
	}

	log.Printf("Subscribed to NATS subject: %s", subject)
	return nil
}

func (c *Client) Close() {
	if c.conn != nil {
		c.conn.Close()
	}
}

func (c *Client) HealthCheck() error {
	if !c.conn.IsConnected() {
		return fmt.Errorf("NATS connection is not connected")
	}
	return nil
}

