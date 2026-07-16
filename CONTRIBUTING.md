# Contributing

Feedback, bug reports, and ideas are welcome through GitHub issues.

The workflow is:

1. Branch from `main` (one short-lived branch per change).
2. Keep changes small and focused.
3. Run the project checks locally before pushing:
   - `npm run format:check`
   - `npm run lint`
   - `npm run typecheck`
   - `npm run test` (or `npm run test:coverage`)
   - `npm run build`
4. Open a pull request into `main`. CI must pass before merge.

## Setup

- Node version is pinned in `.nvmrc`.
- `npm ci` to install, `npm run dev` to run locally.

## Conventions

- Conventional Commits (for example `feat: ...`, `fix: ...`, `chore: ...`,
  `docs: ...`).
- No em dashes in code, comments, docs, commit messages, or user-facing text.
- See `CLAUDE.md` for the full working rules and `docs/` for design notes and
  decision records.
