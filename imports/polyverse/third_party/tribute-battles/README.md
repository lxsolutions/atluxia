# Tribute Battles

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/your-org/tribute-battles)
[![Docker](https://img.shields.io/badge/docker-compatible-blue.svg)](https://www.docker.com/)

**Tribute Battles** is a hybrid fiat + crypto platform that allows users to settle disputes through skill-based game competitions. Players pay entry fees that go into escrow, compete in matches, and the winner claims the prize pool.

## 🎮 Overview

Tribute Battles transforms how people resolve disagreements by turning them into competitive gaming matches. Whether it's a debate about religion, strategy, or any other topic, users can settle it through fair and skill-based competition in games like Age of Empires II, StarCraft II, and more.

### Key Features

- **Dispute Resolution**: Settle arguments through competitive gaming
- **Secure Escrow**: Fiat payments via Stripe Connect, crypto via USDC smart contracts
- **Global Leaderboards**: Track performance across different games
- **Argument Histories**: Track long-term trends (e.g., Catholics vs Muslims)
- **Streaming Integration**: Stream matches on Twitch/YouTube
- **Fair Competition**: Skill-based resolution, not chance

## 🏗️ Architecture

```
├── frontend/          # Next.js + TypeScript + Tailwind CSS
├── backend/           # FastAPI + PostgreSQL + SQLAlchemy
├── contracts/        # Solidity smart contracts (Polygon/Base)
├── docs/             # Documentation
└── docker-compose.yml # Multi-service orchestration
```

### Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: FastAPI, Python, PostgreSQL, SQLAlchemy
- **Database**: PostgreSQL with full ACID compliance
- **Payments**: Stripe Connect (fiat), USDC smart contracts (crypto)
- **Smart Contracts**: Solidity, Hardhat, OpenZeppelin
- **Infrastructure**: Docker, Docker Compose, GitHub Actions
- **License**: MIT

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for frontend development)
- Python 3.10+ (for backend development)
- PostgreSQL database

### Using Docker Compose (Recommended)

1. Clone the repository:
```bash
git clone https://github.com/your-org/tribute-battles.git
cd tribute-battles
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Start all services:
```bash
docker-compose up -d
```

4. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

### Manual Setup

#### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database and API keys
```

4. Run database migrations:
```bash
alembic upgrade head
```

5. Start the backend:
```bash
uvicorn app.main:app --reload
```

#### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your API URL
```

4. Start the frontend:
```bash
npm run dev
```

#### Smart Contracts Setup

1. Navigate to contracts directory:
```bash
cd contracts
```

2. Install dependencies:
```bash
npm install
```

3. Configure networks in `hardhat.config.js`:
```javascript
// Add your RPC URLs and private keys
networks: {
  polygon: {
    url: process.env.POLYGON_RPC_URL,
    accounts: [process.env.PRIVATE_KEY]
  }
}
```

4. Compile contracts:
```bash
npm run compile
```

## 📁 Project Structure

```
tribute-battles/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/            # Next.js app router
│   │   ├── components/     # React components
│   │   ├── lib/           # Utility functions
│   │   └── types/        # TypeScript types
│   ├── package.json
│   └── Dockerfile
├── backend/                 # FastAPI backend application
│   ├── app/
│   │   ├── api/           # API endpoints
│   │   ├── core/          # Core configuration
│   │   ├── crud/          # Database operations
│   │   ├── models/        # SQLAlchemy models
│   │   ├── schemas/       # Pydantic schemas
│   │   └── services/      # Business logic
│   ├── requirements.txt
│   └── Dockerfile
├── contracts/               # Smart contracts
│   ├── contracts/         # Solidity contracts
│   ├── scripts/          # Deployment scripts
│   └── hardhat.config.js
├── docs/                  # Documentation
│   ├── vision.md         # Vision and mission
│   ├── legal.md          # Legal disclaimer
│   └── roadmap.md        # Development roadmap
└── docker-compose.yml     # Service orchestration
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/tribute_battles

# Security
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Stripe
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Redis (for caching)
REDIS_URL=redis://localhost:6379
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

#### Smart Contracts (.env)
```env
# Polygon
POLYGON_RPC_URL=https://polygon-rpc.com
PRIVATE_KEY=your-private-key
ETHERSCAN_API_KEY=your-etherscan-api-key

# Base
BASE_RPC_URL=https://mainnet.base.org
```

## 🎮 How It Works

### 1. Create a Dispute
- Choose a game (Age of Empires II, StarCraft II, etc.)
- Set the entry fee and choose payment method
- Define the sides (e.g., Catholics vs Muslims)
- Invite your opponent

### 2. Confirm & Pay
- Both players confirm the dispute
- Entry fees are placed in escrow
- Match is scheduled and prepared

### 3. Compete
- Play the match according to agreed rules
- Submit proof of victory (screenshots, replays)
- Results are verified

### 4. Get Paid
- Winner receives the entire prize pool
- Leaderboards are updated
- Argument histories are recorded

## 📊 API Documentation

Once the backend is running, you can access the interactive API documentation at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Key API Endpoints

#### Users
- `POST /api/v1/users/register` - Register new user
- `POST /api/v1/users/login` - User login
- `GET /api/v1/users/me` - Get current user
- `PUT /api/v1/users/{id}` - Update user profile

#### Disputes
- `POST /api/v1/disputes` - Create new dispute
- `GET /api/v1/disputes` - List disputes
- `GET /api/v1/disputes/{id}` - Get dispute details
- `PUT /api/v1/disputes/{id}/confirm` - Confirm dispute
- `POST /api/v1/disputes/{id}/result` - Submit match result

#### Games
- `GET /api/v1/games` - List available games
- `POST /api/v1/games` - Create new game
- `GET /api/v1/games/{id}` - Get game details

#### Leaderboards
- `GET /api/v1/leaderboards` - Get leaderboard for a game
- `GET /api/v1/leaderboards/user/{user_id}` - Get user's leaderboard positions

## 🔒 Security

### Backend Security
- JWT-based authentication
- OAuth integration (Google, GitHub)
- Input validation and sanitization
- SQL injection protection
- Rate limiting
- CORS protection

### Smart Contract Security
- Access controls
- Reentrancy protection
- Input validation
- Formal verification ready
- Regular security audits

### Frontend Security
- XSS protection
- CSRF protection
- Secure authentication
- Input validation

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

### Smart Contract Tests
```bash
cd contracts
npm test
```

### Integration Tests
```bash
docker-compose -f docker-compose.test.yml up --abort-on-container-exit
```

## 🚀 Deployment

### Docker Deployment

1. Build and push images:
```bash
docker-compose build
docker-compose push
```

2. Deploy to production:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Production Environment

- Use managed database services (RDS, Cloud SQL)
- Configure proper environment variables
- Set up monitoring and logging
- Configure SSL/TLS certificates
- Set up backup and disaster recovery

### Smart Contract Deployment

```bash
# Deploy to Polygon
npm run deploy:poly

# Deploy to Base
npm run deploy:base

# Verify on Etherscan
npm run verify
```

## 📈 Monitoring

### Application Monitoring
- Health checks for all services
- Performance metrics
- Error tracking
- User behavior analytics

### Database Monitoring
- Query performance
- Connection pooling
- Backup status
- Storage usage

### Smart Contract Monitoring
- Transaction success rates
- Gas usage optimization
- Contract balance monitoring
- Event tracking

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Commit your changes (`git commit -m 'feat: add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Code Style

- **Backend**: Follow PEP 8, use black for formatting
- **Frontend**: Follow ESLint configuration, use Prettier
- **Smart Contracts**: Follow Solidity style guide, use Slither for linting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the [docs](docs/) folder
- **Issues**: Report bugs on [GitHub Issues](https://github.com/your-org/tribute-battles/issues)
- **Discussions**: Join our [GitHub Discussions](https://github.com/your-org/tribute-battles/discussions)
- **Discord**: Join our [Discord server](https://discord.gg/tribute-battles)

## 🙏 Acknowledgments

- OpenZeppelin for smart contract templates
- FastAPI and Next.js communities
- The gaming community for inspiration
- All contributors who have helped build this platform

---

**Made with ❤️ by the Tribute Battles team**
