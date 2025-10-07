
# Curio Critters - Educational RPG Game

Curio Critters is an educational RPG game that makes K-12 learning addictive and fun. The game integrates Diablo II-style progression, Fluvsies-inspired pet care, stealth learning frameworks, and epic adventures covering core subjects.

## Features

- **Pet Care**: Nurture cute critters through feeding, playing, and training
- **RPG Adventures**: Embark on quests that teach math, science, history, and more
- **Stealth Learning**: Educational content hidden in gameplay
- **Progress Tracking**: Adaptive difficulty based on performance
- **PWA Support**: Installable on Amazon Fire Tablet and other devices
- **Real Sounds & Animations**: Immersive audio-visual experience
- **Offline Sync**: Progress saved locally when offline, syncs automatically
- **Parental Dashboard**: Track learning metrics and progress
- **Backend APIs**: RESTful services for data persistence

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/lxsolutions/curio-critters.git
   cd curio-critters
   ```

2. Install frontend dependencies:
   ```bash
   cd src/frontend
   npm install
   ```

3. Install backend dependencies:
   ```bash
   cd ../backend
   npm install
   ```

4. Initialize the database (runs automatically on first start):
   ```bash
   node db.js
   ```

### Running the Application

1. Start the backend server:
   ```bash
   cd src/backend
   node server.js
   ```
   - Backend API will be available at `http://localhost:56456`

2. Start the frontend development server:
   ```bash
   cd ../frontend
   npm run dev --port 50390
   ```
   - Frontend will be available at `http://localhost:50390`

### Testing

1. Run unit tests:
   ```bash
   cd src/frontend
   npm test
   ```

2. Verify API endpoints:
   ```bash
   curl http://localhost:56456/api/users/1
   curl http://localhost:56456/api/analytics/summary?user_id=1
   ```

### For Amazon Fire Tablet QA Testing

The app is optimized for tablet testing and can be accessed via WiFi.

#### Local HTTP Server Access
1. Start the frontend server on port 50390 as shown above
2. Get your local IP address:
   ```bash
   hostname -I | awk '{print $1}'
   ```
3. Open Silk Browser on your Amazon Fire Tablet
4. Navigate to `http://<local_ip>:50390` (replace `<local_ip>` with your server's IP)
5. Add the app to home screen for PWA installation

#### Testing Instructions
1. **Login**: Test kid login with username and grade selection
2. **Pet Care**: Navigate to pet care section, try feed/play buttons that trigger learning mini-games
3. **Quests**: Complete educational quests with trivia questions from various subjects
4. **Offline Mode**: Disconnect WiFi and verify functionality persists (IndexedDB + service worker caching)
5. **PWA Installation**: Add to home screen in Silk Browser for standalone app experience

#### Verification Steps
- ✅ Kid login works and stores data locally
- ✅ Pet care mini-games trigger educational content with real sounds
- ✅ Quests present subject-specific questions with rewards
- ✅ Offline mode maintains progress and functionality
- ✅ PWA installs correctly on Amazon Fire Tablet

## Deployment

1. Build the frontend for production:
   ```bash
   cd src/frontend
   npm run build
   ```

2. Host the static frontend files (from `dist/` directory)

3. Run the backend server on your production environment:
   ```bash
   cd src/backend
   node server.js
   ```

## Documentation

- **Backend API**: RESTful endpoints for user management, progress tracking, and analytics
- **Database Schema**: SQLite with tables for users, learning metrics, pet care logs, and quest progress
- **Frontend Components**: React components for pet care game, RPG adventures, and parental dashboard
- **Offline Sync**: IndexedDB implementation for offline-first functionality

**This is education disguised as the most engaging game ever created! 🎯**

## License

Licensed under MIT License. See [LICENSE.md](LICENSE.md).


## Changes:
- Finalized app with MIT license
- Production build ready (frontend static files)
- Backend server setup with PM2
- Complete educational RPG system with pet care, quests, and stealth learning
- Offline sync, real sounds, parental dashboard
- Tablet-compatible PWA for Amazon Fire
