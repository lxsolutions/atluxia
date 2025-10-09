
# Contributing to RentShield TH

We love your input! We want to make contributing to RentShield TH as easy and transparent as possible.

## Development Process

1. **Fork the repo** and create your branch from `main`.
2. **Make your changes** following our coding standards.
3. **Add tests** for any new functionality.
4. **Ensure the test suite passes**.
5. **Update documentation** as needed.
6. **Submit a pull request**.

## Code Style

### TypeScript/JavaScript
- Use TypeScript strictly typed
- Prefer functional components with hooks
- Follow Airbnb JavaScript Style Guide
- Use meaningful variable and function names

### React/Next.js
- Use App Router for new pages
- Prefer server components where appropriate
- Use TypeScript for props and state
- Follow React best practices

### Database
- Use Prisma for database access
- Follow our schema conventions
- Add appropriate indexes
- Include seed data for new features

## Commit Messages

Follow conventional commit format:

```
feat: add new listing filter functionality
fix: resolve image upload issue
docs: update API documentation
style: format code with prettier
refactor: reorganize component structure
test: add unit tests for trust score
chore: update dependencies
```

## Pull Request Process

1. **Fill out the template** completely
2. **Include screenshots** for UI changes
3. **Update documentation** if needed
4. **Ensure all tests pass**
5. **Get code review** from at least one maintainer

## Setting Up Development Environment

### Prerequisites
- Node.js 18+
- pnpm 8+
- Docker & Docker Compose
- PostgreSQL (via Docker)

### Local Setup
```bash
# Clone your fork
git clone git@github.com:your-username/rentshield-th.git
cd rentshield-th

# Install dependencies
pnpm install

# Set up environment
cp .env.example .env
# Edit .env with your local configuration

# Start services
docker compose -f infra/docker-compose.yml up -d

# Setup database
pnpm db:push
pnpm db:seed

# Start development
pnpm dev
```

## Testing

### Running Tests
```bash
# All tests
pnpm test

# Specific test suite
pnpm web:test    # Frontend tests
pnpm api:test    # API tests
pnpm db:test     # Database tests

# With coverage
pnpm test:coverage
```

### Writing Tests
- Use Vitest for unit tests
- Use Playwright for E2E tests
- Mock external dependencies
- Test edge cases and error conditions

## Documentation

### Updating Documentation
- Keep README.md current
- Update API documentation for new endpoints
- Add architecture decision records for significant changes
- Include examples for new features

### API Documentation
- Use OpenAPI/Swagger for REST endpoints
- Document tRPC procedures with JSDoc
- Include example requests and responses

## Issue Reporting

### Bug Reports
- Use the bug report template
- Include steps to reproduce
- Add screenshots if applicable
- Specify environment details

### Feature Requests
- Use the feature request template
- Describe the problem and proposed solution
- Include mockups if applicable

## Code Review Guidelines

### As a Reviewer
- Be constructive and respectful
- Focus on code quality and maintainability
- Check for security implications
- Ensure tests are adequate

### As an Author
- Be open to feedback
- Address all review comments
- Keep PRs focused and manageable
- Respond promptly to reviews

## Community Guidelines

- Be respectful and inclusive
- Help others when possible
- Follow the code of conduct
- Report any inappropriate behavior

## Getting Help

- Check existing documentation first
- Search existing issues
- Ask in GitHub Discussions
- Join our community chat

## Release Process

1. **Version bump** following semver
2. **Update changelog**
3. **Create release branch**
4. **Run full test suite**
5. **Build production artifacts**
6. **Deploy to staging**
7. **Verify functionality**
8. **Deploy to production**
9. **Create GitHub release**

Thank you for contributing to RentShield TH! 🎉
