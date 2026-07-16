# SHI_example

An interactive web app for exploring the concepts behind the **Species Habitat
Index (SHI)** ([Map of Life](https://mapoflife.ai/resources/indicators/shi)).

It shows how the index builds up, from land cover, to a species' Area of
Habitat, to per-species habitat scores, to an aggregated index, and how that
responds to change over time, to editing a pixel's land cover, and to
restoration scenarios. The data is synthetic and small; the SHI math mirrors the
published method. This is a teaching tool, not a real biodiversity indicator.

## Status

Design phase. The project harness and design docs are in place; the app is not
scaffolded yet. See the design docs for what is being built.

## Documentation

- [`docs/design/00_project_brief.md`](docs/design/00_project_brief.md) what and
  why, MVP scope, non-goals
- [`docs/design/01_shi_model.md`](docs/design/01_shi_model.md) the SHI
  computation spec (suitability, area, connectivity, aggregation)
- [`docs/design/02_example_scenarios.md`](docs/design/02_example_scenarios.md)
  example species, crosswalks, and the guided walkthrough
- [`docs/design/03_milestones.md`](docs/design/03_milestones.md) the phased plan
- [`docs/decisions/`](docs/decisions/) architecture decision records
- [`CLAUDE.md`](CLAUDE.md) working rules and durable project context

## Planned stack

TypeScript + React + Vite, deployed as a static site to GitHub Pages. The SHI
engine is pure TypeScript, unit-tested with Vitest.

## Getting started

Install, run, and test instructions will be added when the app is scaffolded
(milestone M0).

## License

Licensed under the GNU General Public License v3.0. See [LICENSE](LICENSE).
