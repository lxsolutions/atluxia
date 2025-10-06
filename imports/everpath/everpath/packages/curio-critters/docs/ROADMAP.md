


# Curio Critters Development Roadmap

This roadmap outlines phased development to achieve the full vision: A Fluvsies-inspired pet RPG with Diablo II progression powered by stealth education. Phases build iteratively; track via GitHub Projects board (issues/PRs linked). Use milestones for releases.

## Phase 1: Core Foundation (Completed - v1.0)
- Implement base Fluvsies mechanics: Egg hatching, pet care (feed/play/train), merging.
- Add initial RPG elements: Basic leveling via mini-games.
- Stealth education: Integrate math/science questions into activities.
- Tech: React frontend, Express backend, PWA/APK support, tests.
- Status: Done (commit e2fd131); all features passing tests.

## Phase 2: RPG Integration and Education Depth (In Progress - v1.1, Target: Q4 2025)
- Expand Diablo II elements: Skill trees for critters (e.g., "math branch" unlocks abilities), gear/loot system (educational rewards).
  - **Status**: Implementing skill tree components and XP progression
- More subjects: Add history/language quests; dynamic generation via AI microagent.
  - **Status**: Adding history JSON data, integrating with question generator
- Enhancements: Offline sync improvements, parental dashboard expansions (curriculum reports).
  - **Status**: Updating IndexedDB schema for new educational data types
- Testing: E2E with Cypress; kid QA on Fire Tablet APK.
  - **Status**: Pending implementation completion
- Milestones:
  - #1 - RPG mechanics ✓ (In progress)
  - #2 - New subjects ✓ (History content added)

## Phase 3: Polish and Expansion (v2.0, Target: Q1 2026)
- Advanced features: Multi-critter parties ✓, co-op modes via WebSockets ✓
- Community: Open for contributions (new quests via PRs); integrate feedback.
- Homeschooling tools: Certification exports (PDF) ✓, adaptive curricula based on standards (e.g., Common Core).
- Deployment: App stores submission; web version scaling.

## Phase 4: Long-Term Evolution (Ongoing)
- AI-driven personalization (e.g., Grok API for quests). ✓
- Global features: More languages, accessibility (voice commands). ✓
- Metrics: Track impact (e.g., learning gains); partnerships with schools.

## Best Practices for Continuous Development
- **Iteration**: Weekly sprints via GitHub Projects; review PRs promptly.
- **Collaboration**: Use issues for ideas (label: education-feature); encourage forks.
- **Quality**: CI/CD for tests; semantic commits.
- **Updates**: Revise this roadmap quarterly; changelog for releases.

## Development Tracking

The development process is tracked using GitHub Projects with the following workflow:

1. **Issue Creation**: New features and enhancements are created as issues in the repository
2. **Sprint Planning**: Weekly planning sessions to assign tasks to sprints
3. **Development**: Features implemented via feature branches (e.g., `feature-rpg-education`)
4. **Code Review**: PR reviews with focus on education impact, code quality, and accessibility
5. **Testing**: Automated tests + manual QA before merging to main

