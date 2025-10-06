







# PolyVerse Protocol (PVP) Specification

## Overview

The PolyVerse Protocol (PVP) is a minimal event layer designed for decentralized social networks. It focuses on signed, content-addressed events that can be verified and processed by independent relays.

## Event Schema

```json
{
  "id": "string",
  "kind": "post|repost|follow|like|profile",
  "created_at": 123456789,
  "author_did": "did:key:...",
  "body": {
    "text": "UTF-8 string",
    "media": "CID (IPFS)"
  },
  "refs": ["event_id_1", "event_id_2"],
  "sig": "Ed25519 signature"
}
```

## Signature Rules

Events are signed using Ed25519 over their canonical JSON form. The signature is included in the `sig` field.

### Canonical Form

The event object must be serialized to JSON with:
- Keys sorted alphabetically
- No whitespace or formatting
- Unicode normalized (NFC)

## Event Types

### Post (`post`)
A user-generated post containing text and/or media content.

```json
{
  "kind": "post",
  "body": {
    "text": "Hello world!",
    "media": "Qm...CID"
  }
}
```

### Follow (`follow`)
Indicates that one user follows another.

```json
{
  "kind": "follow",
  "refs": ["target_user_did"]
}
```

### Like (`like`)
A like of another event.

```json
{
  "kind": "like",
  "refs": ["liked_event_id"]
}
```

## Verification

Events can be verified by:
1. Parsing the canonical JSON form
2. Extracting the `sig` field
3. Verifying against the author's public key (derived from DID)

## API Endpoints

### Event Storage and Retrieval

- `POST /pvp/event`: Store a new event
- `GET /pvp/event/:id`: Retrieve an event by ID

### Feed Generation

- `GET /pvp/feed?algo=<bundle>&cursor=...`: Get feed using selected algorithm bundle








