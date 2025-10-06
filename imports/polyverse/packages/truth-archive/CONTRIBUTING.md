


# Contributing to TRUTHFOUNDRY

Thank you for considering contributing to TRUTHFOUNDRY! This document outlines the process for contributing.

## Development Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/truthfoundry/truthfoundry.git
   cd truthfoundry
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up pre-commit hooks** (optional but recommended):
   ```bash
   pip install pre-commit
   pre-commit install
   ```

## Code Structure

- `src/truthfoundry/`: Core Python package
- `data/`: Data storage (raw, snapshots, processed)
- `schemas/`: JSON Schema validation files
- `tests/`: Unit and integration tests

## Development Workflow

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/new-feature
   ```

2. **Make your changes** following the existing code style.

3. **Run tests**:
   ```bash
   pytest tests/
   ```

4. **Commit your changes**:
   ```bash
   git add .
   git commit -m "Add new feature with detailed description"
   ```

5. **Push and create a pull request**.

## Coding Standards

- Follow PEP 8 style guidelines
- Use type hints for all functions
- Write docstrings for all public modules, classes, and methods
- Keep functions small and focused (max ~30 lines)
- Use descriptive variable names

## Testing

All new features must include unit tests. Place test files in the `tests/` directory.

## Documentation

Update README.md and other documentation as needed when adding new features or making significant changes.

## License

By contributing, you agree that your contributions will be licensed under the Apache 2.0 license.


