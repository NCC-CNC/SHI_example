# SHI_example

An interactive web app for exploring the concepts behind the **Species Habitat
Index (SHI)** ([Map of Life](https://mapoflife.ai/resources/indicators/shi)).

It shows how the index builds up, from land cover, to a species' Area of
Habitat, to per-species habitat scores, to an aggregated index, and how that
responds to change over time, to editing a cell's land cover, and to restoration
scenarios. The data is synthetic and small; the SHI math mirrors the published
method. This is a teaching tool, not a real biodiversity indicator.

**Live demo: https://ncc-cnc.github.io/SHI_example/**

![The SHI explorer: sidebar controls on the left, the index readout, land cover
map, and combined-habitat overlay on the right.](docs/images/app-screenshot.png)

## What it does

- **Time slider (1993 to 2025):** scrub the year and watch the synthetic
  landscape change.
- **Three example species,** each tied to a different habitat (forest, wetland,
  grassland), with a live Area-of-Habitat map and habitat score for each.
- **Aggregated Species Habitat Index,** overall and per habitat group, indexed
  to 100 at a selectable baseline year.
- **Combined-habitat overlap** layer showing where habitat concentrates
  spatially, and a **connectivity** toggle that folds fragmentation into the
  score.
- **Set land cover:** pick a cover type and click cells to test a scenario.
- **Change impact:** a before/after comparison of the index against your edits.
- **Shareable scenarios:** copy a URL that restores the year, baseline, toggles,
  and edits.
- **Guided tour:** a seven-step walkthrough that drives the real app to explain
  each concept, plus an in-app About panel for reference.

## How the SHI is computed

For each species, each cell gets a suitability score from its land cover, the
suitable cells make up the Area of Habitat, and (optionally) a connectivity
adjustment penalizes fragmentation. The per-species habitat score is that area
indexed to 100 at the baseline year, and the overall index is the mean of the
per-species scores. The full spec, including the simplifications this app makes,
is in [`docs/design/01_shi_model.md`](docs/design/01_shi_model.md).

The math is kept faithful to the published method; the data is deliberately
synthetic. This is not a real biodiversity indicator, a GIS application with real
rasters, or a source of authoritative species or habitat data.

## Status

MVP complete (milestones M0 through M5) and deployed: the pure SHI engine, three
species with aggregation, the map visualizations, land cover editing with a
before/after comparison, and the guided tour are all live and interactive. The
post-MVP backlog (more species, real ESA land cover, elevation, Steward's SHI,
forward edit propagation) is tracked in the GitHub issues, which are the live
roadmap.

## Documentation

- [`docs/design/00_project_brief.md`](docs/design/00_project_brief.md) what and
  why, MVP scope, non-goals
- [`docs/design/01_shi_model.md`](docs/design/01_shi_model.md) the SHI
  computation spec (suitability, area, connectivity, aggregation)
- [`docs/design/02_example_scenarios.md`](docs/design/02_example_scenarios.md)
  example species, crosswalks, and the guided walkthrough
- [`docs/design/03_milestones.md`](docs/design/03_milestones.md) the phased plan
- [`docs/design/04_share_state.md`](docs/design/04_share_state.md) URL scenario
  sharing
- [`docs/decisions/`](docs/decisions/) architecture decision records
- [`docs/handoffs/`](docs/handoffs/) session handoffs
- [`CLAUDE.md`](CLAUDE.md) working rules and durable project context

## Stack

TypeScript (strict) + React + Vite, deployed as a static site to GitHub Pages.
The SHI engine is pure, framework-free TypeScript under `src/engine/`, unit
tested with Vitest so the computation stays testable independent of React.

## Getting started

Node version is pinned in `.nvmrc`.

```bash
npm ci             # install dependencies
npm run dev        # start the dev server
npm run build      # production build (into dist/)
npm run test       # unit tests (Vitest)
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
```

Pushing to `main` builds and deploys the site to GitHub Pages automatically.

## License

Licensed under the GNU General Public License v3.0. See [LICENSE](LICENSE).
