












# PolyVerse Contribution Guidelines

Thank you for your interest in contributing to PolyVerse! This document outlines the processes and norms for contributing to our decentralized social + AI + payments super-app.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Contribution Workflow](#contribution-workflow)
  - [1. Fork and Clone](#1-fork-and-clone)
  - [2. Create a Branch](#2-create-a-branch)
  - [3. Make Changes](#3-make-changes)
  - [4. Write Tests](#4-write-tests)
  - [5. Update Documentation](#5-update-documentation)
  - [6. Commit Your Changes](#6-commit-your-changes)
  - [7. Create a Pull Request](#7-create-a-pull-request)
- [Protocol Changes (RFC Process)](#protocol-changes-rfc-process)
- [Coding Standards](#coding-standards)
  - [JavaScript/TypeScript](#javascripttypescript)
  - [Go](#go)
  - [Python](#python)
- [Testing Guidelines](#testing-guidelines)
- [Security Best Practices](#security-best-practices)

## Code of Conduct

Please read and follow our [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) which outlines the expectations for behavior in all PolyVerse community spaces, including code contributions.

## Contribution Workflow

### 1. Fork and Clone

Fork the repository to your GitHub account and clone it locally:

```bash
git clone https://github.com/YOUR_USERNAME/polyverse.git
cd polyverse
```

### 2. Create a Branch

Create a new branch for your work:

```bash
git checkout -b feature/your-feature-name
```

### 3. Make Changes

Implement your changes following our coding standards below.

### 4. Write Tests

All contributions should include appropriate tests:
- Unit tests for core functionality
- Integration tests for API endpoints
- Contract tests between components

### 5. Update Documentation

Update relevant documentation files, including:
- README.md for user-facing changes
- ARCHITECTURE.md for system design updates
- PROTOCOL.md for event schema changes
- Any other affected documentation files

### 6. Commit Your Changes

Write clear commit messages following conventional commits format:

```
feat(web): add algorithm bundle selection UI
```

or

```
fix(indexer): resolve event retrieval race condition
```

### 7. Create a Pull Request

Push your branch and create a pull request against the main repository:

```bash
git push origin feature/your-feature-name
```

Then go to GitHub and create a PR with:
- Clear title describing the change
- Detailed description of what was changed and why
- Screenshots if applicable (for UI changes)
- Reference to any related issues

## Protocol Changes (RFC Process)

For protocol-level changes, follow this process:

1. **Create RFC**: Add a new file in `/docs/rfcs/` with your proposal
2. **Discuss**: Open an issue for community feedback
3. **Iterate**: Refine based on input from maintainers and users
4. **Implement**: Once approved, implement the changes

RFCs should include:
- Problem statement
- Proposed solution
- Backward compatibility considerations
- Implementation plan

## Coding Standards

### JavaScript/TypeScript

- Use ESLint with our configured rules (`.eslintrc.js`)
- Prefer TypeScript for new code
- Follow React best practices in the web client

### Go

- Use golangci-lint for code quality
- Follow standard Go project layout
- Write idiomatic Go code

### Python

- Use Black and Flake8 for formatting/linting
- Follow PEP 8 guidelines
- Type hints are encouraged

## Testing Guidelines

1. **Unit Tests**: Test individual components in isolation
2. **Integration Tests**: Verify API endpoints work together
3. **Contract Tests**: Ensure compatibility between services
4. **End-to-End Tests**: For critical user flows (login, posting)

All tests should be placed in appropriate `tests/` or `__tests__` directories.

## Security Best Practices

1. **Never commit credentials**: Use environment variables for secrets
2. **Input validation**: Validate all user inputs server-side
3. **Secure defaults**: Enable security features by default
4. **Dependency management**: Keep dependencies up to date
5. **Audit logs**: Log security-relevant events without sensitive data

Please review our [SECURITY.md](SECURITY.md) for more detailed security guidance.

Thank you for contributing to PolyVerse! Your efforts help build a decentralized future that respects user sovereignty and algorithmic choice.



