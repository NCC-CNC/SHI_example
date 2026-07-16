# 01 SHI Model

This is the computational spec for the app. It mirrors the published Species
Habitat Index (SHI) methodology, simplified for a small synthetic grid. The real
methodology is summarized at
https://mapoflife.ai/resources/indicators/shi.

## Pipeline

```
land cover grid (per year)  +  species preferences
        |
        v
  suitability grid (per species, per year)      == the AOH map
        |
        +--> Area Score (indexed to baseline)
        +--> Connectivity Score (indexed to baseline)
        |
        v
  Species Habitat Score (SHS) = mean(Area, Connectivity)   [Area only if toggle off]
        |
        v
  SHI = mean SHS across species        (also computed per species group)
```

Everything below is a pure function of the land cover time series, the species
preference tables, and the chosen baseline year.

## Inputs

- **Grid**: `W x H` cells. Each cell has a land cover type from the fixed set
  (forest, grassland, wetland, river, lake, developed, barren, shrubs, crops).
- **Land cover time series**: one grid per year, 1993..2025 (synthetic).
- **Species**: each species has a `group` (forest / wetland / grassland / ...)
  and a **suitability crosswalk**: a map from land cover type to a suitability
  value in `[0, 1]`.
- **Baseline year**: user-selectable (default 2001). The year whose SHS is
  normalized to 100.

## Step 1: Suitability grid (the AOH map)

For species `s`, year `t`, cell `c`:

```
suitability[s,t,c] = crosswalk[s][ landcover[t,c] ]
```

This continuous 0..1 grid is the species' Area of Habitat map for that year. In
the real method, AOH is `range ∩ suitable habitat ∩ elevation`; here range is
the whole grid and elevation is omitted (see Simplifications).

## Step 2: Area Score

The habitat "amount" is the summed suitability across cells (each cell has equal
area on the grid, so area = cell count weighting is uniform):

```
area[s,t]      = sum over c of suitability[s,t,c]
areaScore[s,t] = 100 * area[s,t] / area[s, baseline]
```

So a 6% drop in summed suitability versus baseline gives an area score of 94,
matching the published example. Baseline year always scores 100.

Guard: if `area[s, baseline] == 0`, the species has no baseline habitat and its
scores are undefined; such a species is excluded from the aggregate and flagged
in the UI rather than dividing by zero.

## Step 3: Connectivity Score (GISfrag)

Connectivity uses the GISfrag metric: the average distance from each suitable
cell to the nearest edge of the suitable area. Larger, more contiguous blocks
have higher average distance-to-edge; the same area scattered into fragments
has a lower one.

Because GISfrag needs an edge, we threshold suitability into a binary "suitable"
mask:

```
suitableMask[s,t,c] = suitability[s,t,c] >= SUIT_THRESHOLD   (default 0.5)
```

Then, on that mask:

```
For each suitable cell, dist = chessboard/Euclidean distance transform to the
nearest non-suitable cell (grid edge counts as non-suitable).
gisfrag[s,t]        = mean(dist) over suitable cells
connScore[s,t]      = 100 * gisfrag[s,t] / gisfrag[s, baseline]
```

Notes:
- The distance transform is O(cells) with a two-pass algorithm, so it is cheap
  even at 100x100.
- Treating the grid edge as non-suitable is a modeling choice (habitat is
  bounded by the study area). Documented here so it is not a surprise.
- `SUIT_THRESHOLD` is a named constant, adjustable, exposed in the UI later if
  useful.

Guard: if `gisfrag[s, baseline]` is 0 or there are no suitable cells at
baseline, connectivity is undefined for that species and handled like the area
guard.

## Step 4: Species Habitat Score (SHS)

```
SHS[s,t] = mean(areaScore[s,t], connScore[s,t])
```

**Connectivity toggle**: when the user turns connectivity off (area-only mode):

```
SHS[s,t] = areaScore[s,t]
```

The toggle is global (applies to all species and the aggregate) so the user can
isolate the extent story from the fragmentation story.

## Step 5: Aggregate to SHI

```
SHI[t]          = mean over species s of SHS[s,t]           (simple mean)
groupSHI[g,t]   = mean over species s in group g of SHS[s,t]
```

This is the "National SHI" (simple mean) form. The population-weighted
"Steward's SHI" is out of scope until species carry population data; noted as a
later option.

## Baseline handling

- The baseline year is a single global setting, default 2001.
- Changing it reindexes all area and connectivity scores (every score is
  relative to the baseline year's value). This makes the "the index is relative
  to a reference year" idea explicit and explorable.
- The baseline must be within the available year range (1993..2025).

## Edits and restoration

Editing a cell's land cover type is just a mutation of the land cover grid for
the affected year(s). The whole pipeline is recomputed from the edited grid.

- **Pixel edit**: change one cell's type in the viewed year; the index updates
  live.
- **Restoration**: a named edit session, typically in the latest year (2025),
  that records the change (for example, N grassland cells to forest) and shows
  SHI before vs after, per species and overall. Mechanically identical to a
  pixel edit plus a before/after snapshot.

Open question for later: whether an edit applies to a single year or propagates
forward through the time series. Default plan: edits apply to the single viewed
year (and restoration to 2025), with propagation as a later option.

## Simplifications versus the published SHI

1. **No species range or elevation clipping.** AOH = suitable habitat only; the
   whole grid is in-range. Add an elevation layer and per-species elevation
   bands later for the full `range ∩ habitat ∩ elevation` intersection.
2. **No separate quality layer.** The published index also tracks within-class
   degradation (Hansen forest change). Here, quality is folded into the
   suitability crosswalk. A per-cell quality 0..1 multiplier can be added later.
3. **Synthetic land cover**, not ESA CCI rasters. The crosswalk targets a
   simplified 9-type land cover set, not exact ESA classes.
4. **Uniform cell area.** All grid cells are equal area, so area weighting is
   just cell counts.

## Named constants (initial)

- `SUIT_THRESHOLD = 0.5` (suitable/unsuitable cutoff for connectivity)
- `YEAR_MIN = 1993`, `YEAR_MAX = 2025`
- `DEFAULT_BASELINE = 2001`
- Land cover set as in the project brief.

## Testable units (pure logic)

- suitability grid generation from a crosswalk
- area score, including the baseline=100 and area-loss cases
- distance transform correctness on hand-checked small grids
- GISfrag / connectivity score, including contiguous-vs-scattered same-area case
- SHS with connectivity on and off
- aggregation (overall and per group), including exclusion of undefined species
