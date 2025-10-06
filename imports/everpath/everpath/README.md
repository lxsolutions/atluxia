# EverPath - Career & Education Platform

A cross-platform Career & Education app for all ages that continuously closes the gap between what a user *wants to be* and where their **skills/experience** are today.

## 🚀 v0 Foundations Complete!

The v0 foundations are now complete and ready for development. This includes the complete monorepo infrastructure, backend API with authentication, pathing engine, frontend applications, and comprehensive documentation.

## 🎯 Vision

For kids who are too young to work, EverPath focuses on **Education** (it can replace school/homeschool); for working‑age users, EverPath recommends and prepares them for the **best next jobs** and provides **learning plans** to upskill toward their desired role.

## 🏗️ Architecture

### Monorepo Structure
```
everpath/
├── apps/
│   ├── web/          # Next.js web application
│   ├── mobile/       # React Native mobile app
│   └── admin/        # Admin dashboard
├── packages/
│   ├── ui/           # Shared UI components
│   └── tsconfig/     # TypeScript configurations
└── services/
    ├── api/          # FastAPI backend
    ├── worker/       # Background job processing
    ├── ml/           # Machine learning services
    └── data/         # Database migrations & seeds
```

### Core Features
- **Age-aware Onboarding**: Captures age, aspirations, skills, interests, and constraints
- **Continuous Pathing Engine**: Computes skill gaps and recommends next steps
- **Dual Function**: Increases skills & knowledge + delivers better jobs
- **Kids Mode**: Safe, COPPA-aware learning via mini-games and quests
- **Teens/Adults Mode**: Skills audits, portfolio builder, job matching
- **Learning & Skills Ledger**: Tracks assessments, badges, XP, and artifacts

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)

### Development Setup

1. **Clone and setup environment:**
   ```bash
   cp .env.sample .env
   # Edit .env with your configuration
   ```

2. **Start all services:**
   ```bash
   docker compose up --build
   ```

3. **Access the applications:**
   - Web App: http://localhost:3000
   - Admin Dashboard: http://localhost:3001
   - API Documentation: http://localhost:8000/docs
   - MinIO Console: http://localhost:9001

4. **Seed initial data:**
   ```bash
   docker compose exec api python -m services.data.seed
   ```

### Local Development (without Docker)

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Start database and services:**
   ```bash
   docker compose up postgres minio redis -d
   ```

3. **Run services:**
   ```bash
   # Terminal 1: API
   cd services/api && python -m uvicorn app.main:app --reload
   
   # Terminal 2: Web App
   cd apps/web && pnpm dev
   
   # Terminal 3: Admin
   cd apps/admin && pnpm dev
   ```

## 📊 Data Model

### Core Entities
- **Users**: kid, teen, adult, parent, educator, admin roles
- **Profiles**: aspirations, location, availability, education level
- **Skills**: technical, soft skills, academic, creative, trades
- **Roles**: career paths with skill requirements
- **Quests**: practice tasks, mini-projects, lessons, assessments
- **Assessments**: quizzes, coding challenges, project reviews
- **Job Leads**: from mock and external providers
- **Artifacts**: projects, certificates, resumes, portfolios

## 🔧 API Endpoints

### Authentication
- `POST /auth/signup` - User registration
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user

### User Management
- `GET /users/profile` - Get user profile
- `PUT /users/profile` - Update profile
- `GET /users/skills` - Get user skills
- `POST /users/skills` - Update skill levels

### Pathing Engine
- `GET /path/next-steps` - Get recommended next steps

### Catalog
- `GET /catalog/roles` - Get all roles
- `GET /catalog/skills` - Get all skills

### Jobs
- `GET /jobs/search` - Search job leads

## 🎮 Curio Critters Integration

The platform integrates the Curio Critters educational game for kids:
- Mounted under `/kids/curio-critters`
- Shared authentication and XP system
- Game achievements contribute to skill development
- Parental controls and progress tracking

## 🔐 Security & Privacy

- COPPA/GDPR compliant with guardian consent for minors
- Role-based access control
- Data encryption at rest
- Content filtering by age
- Parental controls and screen time management

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run specific test suites
cd services/api && pytest
cd apps/web && pnpm test
```

## 📈 Deployment

### Production Deployment
1. Set up environment variables
2. Build and push Docker images
3. Deploy with your preferred platform (Fly.io, Render, etc.)
4. Run database migrations
5. Seed initial data

### Environment Variables
See `.env.sample` for required environment variables.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

- Documentation: [docs.everpath.com](https://docs.everpath.com)
- Issues: [GitHub Issues](https://github.com/everpath/everpath/issues)
- Discussions: [GitHub Discussions](https://github.com/everpath/everpath/discussions)