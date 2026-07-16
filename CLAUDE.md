# CLAUDE.md

Working rules and durable context for this project. This file is loaded into
context automatically, so keep it to direction and rules, not a task list.

## Project name

SHI_example

## Project purpose

SHI_example is an interactive web app for exploring the concepts behind the
**Species Habitat Index (SHI)** (Map of Life:
https://mapoflife.ai/resources/indicators/shi). It is a teaching and exploration
tool that shows how the index is built up from land cover, to per-species Area
of Habitat, to per-species habitat scores, to an aggregated index, and how all
of that responds to change over time and to user edits (including restoration
scenarios).

The immediate goal is an MVP on a small synthetic grid (10x10) with three
example species (forest, wetland, grassland), a time slider (1993..2025), a live
SHI readout, pixel editing, and a before/after restoration comparison.

See `docs/design/00_project_brief.md` for the full brief.

## Project status

Early build. The harness, design docs, and ADRs are in place. M0 (scaffold) and
M1 (the pure SHI engine in `src/engine/`, fully unit-tested) are done. Next is
M2 (render one species: grid, AOH map, time slider) per
`docs/design/03_milestones.md`. Open GitHub issues are the live roadmap.

## Scope

An interactive, client-side teaching app for the SHI concepts, on synthetic
data. It is deliberately NOT: a real biodiversity indicator, a geospatial/GIS
application with real ESA rasters (at first), a backend service, or a source of
authoritative species or habitat data. Do not expand scope without a design note
in `docs/design/` or an ADR in `docs/decisions/`.

The SHI math is kept faithful to the published method; the data is simplified.
See `docs/design/01_shi_model.md` and the two ADRs dated 2026-07-16.

## Stack

- TypeScript (strict), React, Vite.
- Vitest for unit tests.
- Custom canvas/SVG grid rendering (no geographic map library for the abstract
  grid).
- Pure, framework-free TypeScript for the SHI engine so it is unit-testable
  independent of React.
- GitHub Pages for static deployment.

The SHI computation must stay out of React components, in pure modules under
`src/engine/`. Rationale and alternatives are in
`docs/decisions/2026-07-16_stack-typescript-react-vite.md`.

## Repo structure

Planned layout once code exists (explore the tree rather than trusting this; it
drifts):

- `src/engine/` pure, testable SHI logic (suitability, area, connectivity/
  GISfrag, aggregation). No React imports.
- `src/data/` typed content modules: land cover types, species + crosswalks,
  synthetic land cover scenarios.
- `src/ui/` React components: grid renderer, slider, score panels, edit tools.
- `tests/` or co-located `*.test.ts` Vitest suites for the engine.

Already in place:

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

## Command style

Run shell commands as single, atomic invocations so they match the allowlist in
`.claude/settings.json` and do not trigger extra permission prompts.

1. Avoid compound commands. Command substitution `$(...)`, heredocs, pipes,
   `for`/`while`/`if` cannot be statically matched, so they always prompt even
   when the inner command is allowlisted.
2. Pass long text through a file, never `$(printf ...)` or a heredoc. Write the
   text with the file tools first, then `git commit -F <file>`,
   `gh pr create --body-file <file>`, and `gh issue create --body-file <file>`.
3. To wait for CI, use `gh pr checks <n> --watch` (one blocking command), not a
   hand-rolled polling loop.
4. Prefer many small allowlisted commands over one bundled script.

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
