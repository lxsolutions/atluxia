












# PolyVerse Web Client

The PolyVerse web client provides the primary user interface for interacting with the decentralized social network. This Next.js application allows users to create profiles, post content, manage feeds, and interact with AI services.

## Table of Contents

- [Project Structure](#project-structure)
  - [Pages Directory](#pages-directory)
  - [Components Directory](#components-directory)
  - [API Routes](#api-routes)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Development Server](#running-the-development-server)
- [Key Features](#key-features)
  - [Algorithm Bundle Selection](#algorithm-bundle-selection)
  - [Moderation Controls](#moderation-controls)
  - [AI Integration](#ai-integration)

## Project Structure

### Pages Directory

The `pages` directory contains the application's routes:

```
pages/
├── api/            # API endpoints
│   ├── events.ts    # Event creation and retrieval
│   └── feed.ts      # Feed generation endpoint
├── index.tsx       # Home page with feed display
├── profile.tsx     # User profile management
└── post.tsx        # Post creation interface
```

### Components Directory

The `components` directory contains reusable UI elements:

```
components/
├── FeedItem.tsx    # Individual feed post component
├── BundleSelector.tsx # Algorithm bundle selection UI
├── ModerationPanel.tsx # Moderation controls and settings
└── AIChatBox.tsx   # Interface for AI interactions
```

### API Routes

API routes handle server-side logic:

- `GET /api/feed`: Fetches feed data from indexer service
- `POST /api/events`: Creates new events via relay service
- `GET /api/profile/:did`: Retrieves user profile information

## Getting Started

### Prerequisites

- Node.js v16+
- npm or yarn package manager

### Installation

```bash
cd apps/web
npm install  # or 'yarn install'
```

### Running the Development Server

```bash
npm run dev  # or 'yarn dev'

# The server will start at http://localhost:3000
```

## Key Features

### Algorithm Bundle Selection

Users can choose from different feed ranking algorithms:

1. **Time Decay Diversity**: Recent posts with author diversity cap
2. **Community Weighted**: Follow graph + quality scores from labelers
3. **Locality Focused**: Content relevant to user's geographic area

The selection UI is implemented in `components/BundleSelector.tsx`.

### Moderation Controls

Users have granular control over content visibility:

- Keyword-based filtering
- Mute/block lists for specific users
- NSFW toggle switch
- Model-based safety preferences

These controls are managed through the `components/ModerationPanel.tsx` component.

### AI Integration

The web client integrates with the AI mesh for various features:

1. **Thread Summarization**: Generate TL;DR summaries of long conversations
2. **Content Generation**: AI-assisted post creation
3. **Chat Interface**: Direct interaction with AI models

The `components/AIChatBox.tsx` component provides a unified interface for these capabilities.

This web client serves as the primary user-facing application for PolyVerse, providing intuitive access to all core platform features while maintaining decentralized architecture principles.


