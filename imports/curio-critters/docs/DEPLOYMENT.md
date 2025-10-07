


# Deployment Guide for Curio Critters

## Local Development
Follow README for setup.

## Production Build
1. Frontend: `cd src/frontend && npm run build` (outputs to dist/).
2. Backend: No build needed; run with PM2 or similar for production.

## Hosting Options
- **Frontend (PWA)**: Deploy static files to Vercel/Netlify.
  - `vercel --prod` from src/frontend.
- **Backend**: Deploy to Render/Heroku.
  - `render deploy` from src/backend (set env vars like JWT_SECRET).
- **Database**: Use hosted SQLite or migrate to PostgreSQL for scale.

## APK for Fire Tablet
1. Integrate Capacitor (see README).
2. Build: `npm run build && npx cap sync && npx cap open android`.
3. Generate APK in Android Studio.
4. Sideload: Enable unknown sources on tablet; install via USB/ADB.

Monitor with parental dashboard analytics post-deploy.


