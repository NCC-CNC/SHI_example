# 00 Project Brief

## What this is

SHI_example is an interactive web app for exploring the concepts behind the
**Species Habitat Index (SHI)** as described by Map of Life
(https://mapoflife.ai/resources/indicators/shi).

It is a teaching and exploration tool, not a production biodiversity indicator.
The goal is to let a user *see* how the SHI is built up: from land cover, to a
single species' area of habitat, to per-species habitat scores, to an aggregated
index, and to watch all of that change over time and under user edits.

## Who it is for

- People learning what the SHI is and how it responds to habitat change.
- Conservation and restoration audiences who want to reason about "what happens
  to the index if we change this land cover here."

## The core idea (one screen)

A grid of land cover pixels, a set of species each with habitat preferences, a
time slider, and a live SHI readout. Change the year, edit a pixel, or run a
restoration scenario, and every downstream number and map updates.

## MVP scope

1. A small grid (start 10x10) of land cover pixels, each one of a fixed set of
   land cover types.
2. A synthetic land cover time series spanning 1993 to 2025.
3. Three example species, one each for forest, wetland, and grassland, each with
   a habitat-suitability crosswalk over the land cover types.
4. Per-species Area-of-Habitat (AOH) maps derived from land cover + preferences.
5. Per-species habitat score (Area + Connectivity), aggregated into an SHI, with
   a user-selectable baseline year (default 2001).
6. A time slider (1993 to 2025) that recomputes everything per year.
7. Visuals: land cover map, per-species AOH maps, a species-overlap/richness
   map, and the SHI (overall and by group) with its sub-scores.
8. A pixel edit tool (change a pixel's land cover type) that updates the index
   live.
9. A restoration mode: edit land cover in the current year and compare the SHI
   before and after (for example, grassland to forest).

## Explicit non-goals (for now)

- Real ESA CCI rasters or any real geospatial data (synthetic only at first).
- Species geographic range clipping and elevation limits (whole grid is treated
  as in-range; see the model doc).
- Within-class habitat "quality" as a separate layer (folded into suitability
  for now).
- A backend or database. The app is fully client-side and deploys as a static
  site.
- Real species identities with authoritative preference data. Example species
  are illustrative archetypes.

## Design principles

1. Faithful to the SHI concepts, simplified in the data. The math mirrors the
   published index; the inputs are synthetic and small.
2. Everything is a pure function of (land cover grid over time + species
   preferences + baseline year). No hidden state.
3. Data-driven content: species, crosswalks, and land cover scenarios live in
   typed data modules, not code branches.
4. Small grid first, but nothing hard-codes 10x10. The engine must scale to at
   least 100x100.
5. Show the concept before polishing the visuals.

## Scale targets

- Grid: 10x10 at first; architecture must support up to ~100x100.
- Species: start with 1 to 3; design to reach ~100.
- Species grouped by associated ecosystem/habitat type (forest, grassland,
  wetland, freshwater, ...).

## Land cover types (initial set)

forest, grassland, wetland, river, lake, developed, barren land, shrubs, crops.

This set is adjustable as the project evolves. It is a simplified, teaching-
oriented crosswalk target for ESA land cover, not an exact ESA class list.

## Related references

- Map of Life SHI: https://mapoflife.ai/resources/indicators/shi
- ESA CCI land cover viewer: https://maps.elie.ucl.ac.be/CCI/viewer/
- Area of Habitat approach (example):
  https://www.nature.com/articles/s41597-022-01838-w
