










# PolyVerse Moderation System

## Three-Layer Model

PolyVerse uses a three-layer moderation approach to balance user sovereignty with community safety:

1. **Client-side filters**: User-controlled content filtering
2. **Community labelers**: Independent labeling providers
3. **Relay policies**: Jurisdictional compliance and norms

## Client Filters

Users can configure their own filters including:
- Mute/block lists
- Keyword-based filtering
- NSFW toggle
- Model-based safety preferences

### Example Configuration
```json
{
  "user_filters": {
    "muted_users": ["did:key:user123"],
    "keywords_blocked": ["spam", "hate speech"],
    "nsfw_enabled": false,
    "safety_level": "moderate"
  }
}
```

## Community Labelers

Independent label providers analyze content and assign labels with confidence scores.

### Label Types
- `promotional`: Advertisements or spam
- `adult_content`: NSFW/explicit material
- `hate_speech`: Discriminatory language
- `misinformation`: False or misleading claims

### API Endpoint
```http
POST /labels
Content-Type: application/json

{
  "event_id": "did:key:...",
  "provider_did": "did:key:labeler123"
}
```

## Relay Policies

Relays can enforce jurisdictional compliance and community norms while maintaining transparency.

### Policy Types
- Legal compliance filters (per jurisdiction)
- Community norm enforcement
- Optional opt-in blocklists

## Appeals Process

Users can appeal moderation decisions through an on-chain/off-chain signed review system.

```json
{
  "appeal_id": "did:key:...",
  "original_event": "event123",
  "labeler_did": "did:key:labeler456",
  "user_claim": "False positive, content is educational",
  "evidence": ["link_to_context"],
  "status": "pending"
}
```

## Safety Principles

- **Transparency**: All moderation actions are visible and auditable
- **User control**: Final decision-making remains with the user
- **No silent shadowbanning**: Only explicit labeling is allowed




