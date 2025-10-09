



# Backend API Documentation

Base URL: http://localhost:56456/api (or deployed URL)

## Authentication
- POST /auth/login: {username, password} → JWT token
- Use Bearer token for protected routes

## Endpoints
- GET /users/:id: Fetch user data (auth required)
- POST /users: Create user {username, grade}
- GET /analytics/summary?user_id=:id: Learning metrics
- POST /progress: Update quest/pet progress {userId, data}

Full schema in db.js. Use CURL for testing as in README.



