# PolyVerse Mobile App v0.4

React Native mobile application for PolyVerse platform using Expo.

## v0.4 Features

### Core Features
- **Shorts Feed**: Vertical video feed with algorithm selection
- **Truth Archive**: Browse and explore truth claims with confidence scores
- **Video Creation**: Record and upload short videos (≤90 seconds)
- **Algorithm Transparency**: "Why this?" feature showing recommendation logic
- **User Authentication**: Secure login and profile management

### v0.4 Enhancements
- **Background Uploads**: Upload videos in the background while using the app
- **HLS Playback**: Support for HLS live/VOD streaming
- **Push Notifications**: Expo notifications for new content, tips, and upload status
- **Deep Linking**: Universal links and app scheme for content sharing
- **Share Sheets**: Native sharing for shorts and claims

## Tech Stack

- **Framework**: Expo (React Native)
- **Navigation**: Expo Router
- **State Management**: React Query (TanStack)
- **Video**: Expo AV
- **Camera**: Expo Camera
- **Storage**: Expo Secure Store
- **Styling**: React Native StyleSheet

## Getting Started

### Prerequisites

- Node.js (v18+)
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (for iOS development) or Android Studio (for Android)

### Installation

1. Install dependencies:
   ```bash
   cd apps/mobile
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Run on specific platform:
   ```bash
   npm run android    # Android
   npm run ios        # iOS
   npm run web        # Web
   ```

## Project Structure

```
app/
├── (tabs)/           # Tab navigation screens
│   ├── shorts.tsx    # Shorts feed
│   ├── truth.tsx     # Truth archive
│   ├── create.tsx    # Video creation
│   └── profile.tsx   # User profile
├── auth/             # Authentication screens
│   └── login.tsx     # Login screen
├── components/       # Reusable components
├── hooks/            # Custom React hooks
├── types/            # TypeScript type definitions
└── utils/            # Utility functions
```

## Environment Variables

Create a `.env` file in the mobile directory:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000
```

## Development Notes

- The app uses TypeScript for type safety
- React Query handles server state and caching
- Expo Router provides file-based navigation
- Video recording uses Expo Camera with vertical aspect ratio
- Algorithm transparency is implemented via the "Why this?" drawer

## Testing

Run the test suite:
```bash
npm test
```

## Building for Production

1. Build the app:
   ```bash
   expo build:android
   expo build:ios
   ```

2. Publish updates:
   ```bash
   expo publish
   ```

## Contributing

Please follow the project's coding standards and commit message conventions.