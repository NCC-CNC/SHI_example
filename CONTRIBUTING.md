# Contributing

Feedback, bug reports, and ideas are welcome through GitHub issues.

The workflow is:

1. Branch from `main` (one short-lived branch per change).
2. Keep changes small and focused.
3. Run the project checks locally before pushing (lint / typecheck / tests, once
   the stack is in place).
4. Open a pull request into `main`. CI must pass before merge.

## Conventions

- Conventional Commits (for example `feat: ...`, `fix: ...`, `chore: ...`,
  `docs: ...`).
- No em dashes in code, comments, docs, commit messages, or user-facing text.
- See `CLAUDE.md` for the full working rules and `docs/` for design notes and
  decision records.
