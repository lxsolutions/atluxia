






# ActivityPub Bridge

The APub-Bridge maps Actors and Activities from ActivityPub to PolyVerse Protocol (PVP) events.

## Mapping Overview

- **ActivityPub Actor** → PVP Profile event
- **Create activity** → PVP Post event
- **Follow activity** → PVP Follow event
- **Like activity** → PVP Like event

## Implementation Plan

1. **Inbound mapping**: Convert ActivityPub activities to PVP events
2. **Outbound mapping**: Convert PVP events to ActivityPub activities
3. **Echo test**: Implement basic round-trip testing

## API Endpoints

- `POST /apub/inbound`: Receive ActivityPub activities and convert to PVP
- `GET /apub/outbound/:eventId`: Get PVP event as ActivityPub activity






