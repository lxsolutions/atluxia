

# Contributing to Polyverse Monorepo

Thank you for your interest in contributing to the Polyverse monorepo! This document provides guidelines and instructions for contributing.

## Development Workflow

### 1. Branch Strategy
- Create feature branches from `main`
- Use descriptive branch names: `feat/description`, `fix/description`, `docs/description`
- Keep branches focused on a single purpose

### 2. Commit Guidelines
- Use conventional commit messages
- Format: `type(scope): description`
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
- Example: `feat(opengrid-client): add authentication support`

### 3. Pull Requests
- Create PRs against `main` branch
- Include clear description of changes
- Reference related issues
- Ensure all tests pass
- Update documentation as needed

## Package Development

### JavaScript/TypeScript Packages
```bash
cd packages/package-name
pnpm dev        # Development mode
pnpm build      # Build for production
pnpm test       # Run tests
```

### Python Packages
```bash
cd packages/package-name
pip install -r requirements.txt
python -m pytest  # Run tests
python setup.py develop  # Install in development mode
```

## Testing Requirements

- All new features must include tests
- Maintain test coverage for existing functionality
- Integration tests for cross-package functionality
- End-to-end tests for critical user flows

## Code Style

### JavaScript/TypeScript
- ESLint and Prettier configured
- Run `pnpm lint` before committing
- TypeScript strict mode enabled

### Python
- Follow PEP 8 guidelines
- Use type hints where appropriate
- Include docstrings for public methods

## Documentation

- Update README.md for significant changes
- Document new APIs and features
- Include examples for complex functionality
- Keep migration guides up to date

## Security Considerations

- Never commit secrets or sensitive data
- Use environment variables for configuration
- Validate all user inputs
- Follow security best practices for each language

## Getting Help

- Open an issue for questions or problems
- Check existing documentation first
- Join our community discussions

## Code of Conduct

Please be respectful and inclusive in all interactions. We follow the [Contributor Covenant](https://www.contributor-covenant.org/version/2/1/code_of_conduct/).

