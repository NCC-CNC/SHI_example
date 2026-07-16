# CLAUDE.md

Working rules and durable context for this project. This file is loaded into
context automatically, so keep it to direction and rules, not a task list.

## Project name

SHI_example

## Project purpose

<!-- TBD: filled in after the project kickoff discussion. One or two paragraphs
on what this project is, who it is for, and the immediate goal. -->

## Project status

<!-- TBD: current state in a few lines. Open GitHub issues are the live roadmap;
this file is direction and working rules, not a task list. -->

## Scope

<!-- TBD: what this project is and, just as importantly, what it deliberately is
not. Do not expand scope without an explicit design note or ADR. -->

## Stack

<!-- TBD: chosen language, frameworks, and tooling. Once set, mirror the choice
into .github/workflows/ci.yml, .github/dependabot.yml, and CONTRIBUTING.md. Add
an ADR in docs/decisions/ recording the choice. -->

## Repo structure

<!-- TBD: the directory layout once code exists. Explore the tree rather than
trusting a static diagram; this list drifts. -->

Baseline (already in place):

- `docs/design/` design notes, `docs/decisions/` ADRs, `docs/handoffs/` session
  handoffs.
- `.github/` issue and PR templates, workflows, Dependabot.
- `.claude/` Claude Code settings and any repo-local skills.

## Style rules

1. Do not use em dashes in docs, comments, commit messages, or user-facing text.
2. Keep writing concise and direct.
3. Use bullets and numbered lists where helpful.
4. Prefer plain language over jargon.
5. Label assumptions clearly.

## Git and commit expectations

Use Git from day one.

- Use concise Conventional Commit style (`feat:`, `fix:`, `chore:`, `docs:`,
  `refactor:`, `test:`).
- Keep commits small and meaningful.
- PR flow: work one feature or slice per branch and PR. Reference the issue in
  the PR body with `Closes #N` so the merge auto-closes it. Verify before
  opening the PR (the checks the change warrants).

## Issue workflow

GitHub issues are the durable, cross-session tracker. Split work by lifecycle:
anything that gets opened and later closed (features, bugs, tech debt) belongs in
an issue; the narrative of a session belongs in a handoff.

1. Open an issue when starting a feature or a slice of work. Reference it in the
   PR with `Closes #N`. Open issues are the live roadmap: open = todo,
   closed = shipped.
2. Do not retroactively open and close issues for already-shipped work.
3. Labels, kept minimal: `bug`, `enhancement`, `documentation`, `question`,
   `tech-debt`, `design-call` (needs an owner decision first).

## Where durable context lives

The owner works across more than one machine, so any Claude-local personal memory
is NOT shared and MUST NOT be the home for durable project context. The repository
is the single source of truth, because it travels through git to every machine:

1. Trackable, open-then-closed work -> GitHub issues.
2. Owner direction and working preferences -> this file (CLAUDE.md).
3. Design threads and decisions -> `docs/design/` and `docs/decisions/` (ADRs).
4. Session narrative -> `docs/handoffs/`.

If a fact is worth remembering, write it to one of the four homes above.

## Session handoff format

When creating a handoff, write `docs/handoffs/<YYYY-MM-DD>_Handoff_vNN.md` with:

```markdown
# Session Handoff: YYYY-MM-DD

## Summary

Brief summary of what changed.

## Completed

- Item

## Current state

- What works
- What is incomplete
- Known issues

## Next actions

1. Next action

## Risks or decisions needed

- Risk or decision
```

## Documentation expectations

- `README.md`: what the project is, how to install, run, and test.
- `docs/design/`: design notes.
- `docs/decisions/`: ADRs for significant technical or design choices.
- `docs/handoffs/`: session handoffs when useful.

When adding a major feature or mechanic, update the relevant design doc.

## Dependency rules

1. Explain why a dependency is needed before adding it.
2. Prefer built-in language and framework capabilities first.
3. Add a short ADR in `docs/decisions/` for major dependencies or stack choices.

## Claude Code operating mode

Act as an autonomous coding agent, but keep the owner in control of design
direction.

1. Make the smallest useful change.
2. Keep the project runnable.
3. Write or update tests for logic that warrants them.
4. Update docs when design or behaviour changes.
5. Do not expand scope without noting the tradeoff.
6. Flag risks clearly.
7. Keep outputs concise.
8. Do not use em dashes.

When uncertain, choose the simplest option that supports the goal.
