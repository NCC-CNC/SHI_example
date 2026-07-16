# SHI model simplifications for the teaching app

## Status

Accepted

## Context

The app should be faithful to the published Species Habitat Index (SHI) concepts
while remaining a small, synthetic, client-side teaching tool. The full method
(Map of Life) uses ESA land cover, elevation, and Hansen forest change at 1 km,
intersects species range with suitable habitat and elevation to build Area of
Habitat (AOH), and derives area and connectivity scores indexed to a 2001
baseline. Reproducing all of that exactly is out of scope for a teaching demo.

See `docs/design/01_shi_model.md` for the full spec.

## Decision

Keep the SHI math faithful, simplify the inputs:

1. **Two sub-scores, faithful math.** Area Score = summed per-cell suitability
   indexed to baseline; Connectivity Score = GISfrag (mean distance-to-edge of
   the suitable area) indexed to baseline; SHS = mean of the two.
2. **Connectivity toggle.** SHS can be computed as Area only, via a global UI
   toggle, so users can isolate extent from fragmentation.
3. **User-selectable baseline year**, default 2001 (the published baseline).
   Changing it reindexes all scores; this makes the "relative to a reference
   year" property explorable.
4. **Synthetic land cover** on a small grid (10x10 first), not ESA rasters.
5. **Drop species range and elevation clipping** initially: AOH = suitable
   habitat only, whole grid in-range.
6. **Fold quality into suitability** initially: no separate degradation layer.
7. **Simple-mean aggregation** ("National SHI" form); population-weighted
   "Steward's SHI" deferred.

## Consequences

Positive:
- Numbers match the published examples (6% area loss -> area score 94) and the
  two-part structure, so the teaching is accurate.
- The engine is a pure function of (land cover series, preferences, baseline),
  making edits, restoration, and tests straightforward.

Negative / tradeoffs:
- Results are illustrative, not comparable to the real SHI for any real place.
  The app must say so.
- Range, elevation, quality, and population weighting are real parts of the
  method that are absent at first; each is listed as a later milestone and will
  need its own follow-up when added.
- Connectivity requires a suitability threshold (`SUIT_THRESHOLD`, default 0.5)
  to define an edge; that constant is a modeling choice, documented in the model
  spec.
