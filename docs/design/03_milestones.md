# 03 Milestones

Phased plan. Each milestone should end with something runnable and, where there
is logic, tested. Open GitHub issues are the live task tracker; this doc is the
shape of the plan.

## M0: Scaffold

- Vite + React + TypeScript project, strict mode.
- Vitest for unit tests, one trivial passing test.
- ESLint + Prettier + typecheck wired into the CI workflow (fill in the CI
  TODO).
- GitHub Pages deploy workflow (build on push to main, publish `dist/`).
- Repo structure per CLAUDE.md (`src/engine`, `src/data`, `src/ui`).

Done when: the empty app builds, deploys to Pages, and `npm test` runs.

## M1: SHI engine (pure, headless)

- Types: land cover types, species + crosswalk, grid, year range.
- Suitability grid generation (the AOH map).
- Area score with baseline indexing.
- Distance transform + GISfrag connectivity score.
- SHS with connectivity on/off toggle.
- Aggregation: overall SHI and per-group SHI.
- Full unit test suite for the model doc's "testable units".

Done when: given a synthetic grid + one species, the engine returns correct
area/connectivity/SHS/SHI, verified against hand-checked cases.

## M2: One species, visualized

- Render the land cover grid (custom canvas/SVG).
- Render one species' AOH map (suitability shading).
- Year slider (1993..2025) driving recompute.
- SHS + sub-scores readout with baseline selector (default 2001).
- The first synthetic scenario (forest fragmentation) authored as data.

Done when: a user can scrub time and watch one species' AOH and scores change.

## M3: Three species + aggregation + overlap

- Add the wetland and grassland species and their scenario beats.
- Multi-species view: per-species AOH, per-species SHS.
- Toggleable species overlap / richness layer (off by default; not a permanent
  side panel).
- Group SHIs and overall SHI, shown as the mean of the parts.
- Connectivity on/off toggle in the UI.

Done when: the full three-species story from the scenarios doc plays through the
slider and the aggregation is visible.

## M4: Edit + restoration

- Pixel edit tool: click a cell, change its land cover type, live recompute.
- Restoration mode: edit in 2025, before/after SHI comparison per species and
  overall.
- Reset / revert edits.

Done when: a user can convert grassland to forest in 2025 and see the SHI
before/after diff.

## M5: Guided walkthrough

- The 7-step concept tour from the scenarios doc, as in-app guided steps.
- Short explanatory text at each step.

Done when: a new user can click through and understand area -> connectivity ->
species -> overlap -> index -> edit -> restoration.

## Later / backlog (post-MVP, needs its own design + ADR)

- Scale grid to 100x100 and species toward 100 (performance pass).
- Real ESA CCI land cover ingestion (crosswalk, resampling to grid).
- Elevation layer and per-species elevation bands (full AOH intersection).
- Separate per-cell quality layer (Hansen-style degradation).
- Population-weighted "Steward's SHI".
- Edit propagation forward through the time series.
- Save/share a scenario (URL-encoded state).
