










# Contributing to Tribute Battles

We welcome contributions to Tribute Battles! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Style](#code-style)
- [Testing](#testing)
- [Documentation](#documentation)
- [Submitting Changes](#submitting-changes)
- [Reporting Issues](#reporting-issues)
- [Community Guidelines](#community-guidelines)

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+
- Docker and Docker Compose
- Git
- PostgreSQL (for local development)

### Setup Instructions

1. **Fork the Repository**
   ```bash
   git clone https://github.com/your-username/tribute-battles.git
   cd tribute-battles
   ```

2. **Set Up Environment**
   ```bash
   # Copy environment files
   cp .env.example .env
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env.local
   
   # Edit environment files with your configuration
   nano .env
   nano backend/.env
   nano frontend/.env.local
   ```

3. **Install Dependencies**
   ```bash
   # Backend
   cd backend
   pip install -r requirements.txt
   
   # Frontend
   cd ../frontend
   npm install
   
   # Contracts
   cd ../contracts
   npm install
   ```

4. **Start Development Environment**
   ```bash
   # Start all services with Docker Compose
   cd ..
   docker-compose up -d
   
   # Or start individually
   # Backend: cd backend && uvicorn app.main:app --reload
   # Frontend: cd frontend && npm run dev
   # Database: Already started by Docker Compose
   ```

5. **Verify Setup**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/amazing-feature
```

### 2. Make Your Changes

- Follow the [Code Style](#code-style) guidelines
- Write tests for new functionality
- Update documentation as needed
- Ensure all tests pass

### 3. Commit Your Changes

```bash
git add .
git commit -m "feat: add amazing feature"
```

Use conventional commit messages:
- `feat:`: New feature
- `fix:`: Bug fix
- `docs:`: Documentation changes
- `style:`: Code style changes
- `refactor:`: Code refactoring
- `test:`: Adding or fixing tests
- `chore:`: Build process or auxiliary tool changes

### 4. Push to Your Fork

```bash
git push origin feature/amazing-feature
```

### 5. Create a Pull Request

1. Go to the original repository on GitHub
2. Click "New Pull Request"
3. Select your feature branch
4. Fill in the PR template
5. Submit for review

## Code Style

### Backend (Python/FastAPI)

- Follow PEP 8 style guidelines
- Use `black` for code formatting
- Use `isort` for import sorting
- Use `flake8` for linting
- Use `mypy` for type checking

```bash
# Format code
black backend/

# Sort imports
isort backend/

# Lint code
flake8 backend/

# Type check
mypy backend/
```

### Frontend (TypeScript/React)

- Follow ESLint configuration
- Use Prettier for code formatting
- Use TypeScript strict mode
- Follow React best practices

```bash
# Format code
npm run format

# Lint code
npm run lint

# Type check
npm run type-check
```

### Smart Contracts (Solidity)

- Follow Solidity style guide
- Use Slither for security analysis
- Use Foundry for testing
- Use OpenZeppelin contracts when possible

```bash
# Compile contracts
npm run compile

# Run tests
npm test

# Security analysis
slither .
```

### General Guidelines

- Write clear, descriptive variable and function names
- Add comments for complex logic
- Keep functions small and focused
- Follow the existing code patterns
- Use meaningful commit messages
- Update documentation with changes

## Testing

### Backend Testing

```bash
cd backend
pytest
```

### Frontend Testing

```bash
cd frontend
npm test
npm run test:coverage
```

### Smart Contract Testing

```bash
cd contracts
npm test
npm run test:coverage
```

### Integration Testing

```bash
# Run all services and test integration
docker-compose -f docker-compose.test.yml up --abort-on-container-exit
```

### Testing Guidelines

- Write tests for new features
- Write tests for bug fixes
- Aim for high test coverage
- Use meaningful test names
- Test both success and failure cases
- Mock external dependencies when possible

## Documentation

### Documentation Types

1. **Code Documentation**: Comments and docstrings
2. **API Documentation**: OpenAPI/Swagger documentation
3. **User Documentation**: README files and guides
4. **Developer Documentation**: This file and setup guides

### Documentation Guidelines

- Keep documentation up to date with code changes
- Use clear, concise language
- Include examples where helpful
- Document APIs thoroughly
- Update README files when adding new features

### Adding Documentation

1. Add docstrings to functions and classes
2. Update API documentation in backend
3. Update user-facing documentation
4. Add comments for complex logic
5. Update this contributing guide if needed

## Submitting Changes

### Pull Request Guidelines

1. **Title**: Use a clear, descriptive title
2. **Description**: Provide a detailed description of changes
3. **Related Issues**: Link to any related issues
4. **Testing**: Describe testing performed
5. **Breaking Changes**: Note any breaking changes
6. **Checklists**: Use provided checklists

### PR Template

```markdown
## Description
Brief description of changes

## Changes Made
- List of changes
- Include any breaking changes

## Testing
- What tests were run
- Any manual testing performed

## Related Issues
Closes #123
Related to #456

## Screenshots (if applicable)
![Screenshot](url)

## Checklist
- [ ] Code follows style guidelines
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] CI/CD pipeline is passing
- [ ] Changes are reviewed and approved
```

## Reporting Issues

### Bug Reports

When reporting bugs, please include:

1. **Description**: Clear description of the bug
2. **Steps to Reproduce**: Step-by-step instructions
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happens
5. **Environment**: OS, browser, version info
6. **Screenshots**: If applicable

### Feature Requests

When requesting features, please include:

1. **Description**: Clear description of the feature
2. **Use Case**: Why this feature is needed
3. **Proposed Solution**: How it could be implemented
4. **Alternatives**: Any alternative solutions considered
5. **Additional Context**: Any other relevant information

### Issue Template

```markdown
## Bug Report / Feature Request

**Description**
Brief description of the issue or feature request

**Steps to Reproduce**
1. Step one
2. Step two
3. Step three

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Environment**
- OS: [e.g., Ubuntu 20.04]
- Browser: [e.g., Chrome 91]
- Version: [e.g., v1.0.0]

**Additional Context**
Any other relevant information
```

## Community Guidelines

### Code of Conduct

We are committed to providing a welcoming and inclusive environment. Please:

- Be respectful and constructive
- Welcome newcomers and help them learn
- Focus on what is best for the community
- Show empathy towards other community members

### Communication

- Use GitHub issues for bug reports and feature requests
- Use GitHub discussions for general questions
- Be patient with responses
- Provide clear, detailed information when asking for help

### Reviewing Pull Requests

When reviewing PRs:

- Be constructive and respectful
- Focus on code quality and functionality
- Provide specific feedback
- Suggest improvements when possible
- Approve when changes look good

### Getting Help

If you need help:

1. Check the documentation first
2. Search existing issues and discussions
3. Ask in GitHub discussions
4. Join our Discord server (if available)
5. Ask maintainers directly for urgent issues

## Release Process

### Versioning

We follow Semantic Versioning (SemVer):
- `MAJOR.MINOR.PATCH`
- Increment `MAJOR` for breaking changes
- Increment `MINOR` for new features
- Increment `PATCH` for bug fixes

### Release Checklist

1. Update version numbers in all relevant files
2. Update changelog
3. Run all tests
4. Update documentation
5. Create release branch
6. Tag release
7. Create release notes
8. Deploy to production

## Additional Resources

- [GitHub Flow](https://guides.github.com/introduction/flow/)
- [Semantic Versioning](https://semver.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Python Style Guide](https://www.python.org/dev/peps/pep-0008/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Solidity Style Guide](https://docs.soliditylang.org/en/latest/style-guide.html)

---

Thank you for contributing to Tribute Battles! 🎮🏆


