


# Contributing to Curio Critters

Thanks for your interest in contributing! We welcome contributions to make this educational RPG even better.

## Code of Conduct
Be kind and respectful. Report issues via GitHub.

## How to Contribute
1. Fork the repo and create a feature branch (e.g., `git checkout -b feature/add-history-quests`).
2. Install dependencies: `cd src/frontend && npm install; cd ../backend && npm install`.
3. Make changes: Follow code style (ESLint for JS), add tests if modifying components.
4. Test: Run `npm test` in frontend; start servers and verify features.
5. Commit: Use conventional commits (e.g., "feat: add new math questions").
6. Push and open a PR against main.

## Adding New Content
- Questions: Edit `public/data/questions/[subject].json` (e.g., add to math.json).
- Components: Modify React files in `src/frontend/components/`; ensure ARIA compliance.
- Backend: Add routes in `src/backend/routes/`; update db.js schema if needed.

## Reporting Bugs
Open an issue with steps to reproduce, expected/actual behavior, and environment details.

Happy contributing!


