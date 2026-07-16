# Stack: TypeScript + React + Vite, static deploy to GitHub Pages

## Status

Accepted

## Context

SHI_example is an interactive, client-side teaching tool: a grid of land cover
pixels, a time slider, live recomputation of a species habitat index, pixel
editing, and restoration scenarios. The data is synthetic and small at first.
There is no need for a server, a database, or user accounts.

The owner works in R and Python for analysis, but this is a front-end
interaction problem, and the reference project this repo was modeled on
(Courier-of-the-Borderlands) is a TypeScript + Vite app deployed to GitHub
Pages.

Options considered:
- TypeScript + React + Vite, static site on GitHub Pages.
- Python (Streamlit / Dash): needs a running server; interactivity is a
  round-trip.
- R Shiny: needs a Shiny server; best only if reusing existing R geospatial
  code, which does not exist here.

## Decision

Use TypeScript + React + Vite. Render the grid with a custom canvas/SVG layer
(no geographic map library needed for an abstract grid). Keep the SHI
computation in pure, framework-free TypeScript modules so it is unit-testable
independent of React. Deploy the built static site to GitHub Pages.

## Consequences

Positive:
- Free static hosting on GitHub Pages, matching the existing harness and CI.
- Instant client-side interactivity (no server round-trips) for the slider and
  edits.
- The pure-TS engine is testable with Vitest and reusable if the UI changes.

Negative / tradeoffs:
- Real geospatial/raster ingestion (ESA CCI) is easier in Python/R; when that
  phase comes, land cover will need to be pre-processed to the grid format
  offline (a script) rather than read from rasters in the browser.
- The owner is less fluent in the TS/React ecosystem than in R/Python, so code
  should stay simple and well-commented.
