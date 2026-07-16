# 02 Example Scenarios

The walkthrough content for the app. Three illustrative species, one per group,
plus a synthetic land cover story that makes each concept visible. All numbers
are illustrative and meant to be tuned while building; they are starting values,
not authoritative data.

## Land cover types and colors (starting palette)

| Type       | Suggested color | Notes                          |
|------------|-----------------|--------------------------------|
| forest     | dark green      |                                |
| shrubs     | olive           | transitional / partial habitat |
| grassland  | light green      |                                |
| wetland    | teal            |                                |
| river      | blue            | linear water                   |
| lake       | dark blue       | open water                     |
| crops      | tan             | agriculture                    |
| developed  | grey            | built-up                       |
| barren     | light brown     | bare ground                    |

Colors are a starting point; finalize against the dataviz guidance when the UI
is built.

## Example species and suitability crosswalks

Suitability is 0..1 per land cover type. These archetypes are deliberately
distinct so their AOH maps look different and their scores move in different
directions under the same land cover change.

### Forest species (group: forest) - "Woodland Thrush" (illustrative)

| land cover | suitability |
|------------|-------------|
| forest     | 1.0         |
| shrubs     | 0.5         |
| wetland    | 0.2         |
| river      | 0.1         |
| grassland  | 0.1         |
| crops      | 0.05        |
| lake       | 0.0         |
| developed  | 0.0         |
| barren     | 0.0         |

### Wetland species (group: wetland) - "Marsh Heron" (illustrative)

| land cover | suitability |
|------------|-------------|
| wetland    | 1.0         |
| river      | 0.7         |
| lake       | 0.6         |
| shrubs     | 0.3         |
| grassland  | 0.2         |
| forest     | 0.2         |
| crops      | 0.1         |
| developed  | 0.0         |
| barren     | 0.0         |

### Grassland species (group: grassland) - "Prairie Lark" (illustrative)

| land cover | suitability |
|------------|-------------|
| grassland  | 1.0         |
| shrubs     | 0.6         |
| crops      | 0.4         |
| barren     | 0.2         |
| wetland    | 0.2         |
| forest     | 0.1         |
| river      | 0.1         |
| lake       | 0.0         |
| developed  | 0.0         |

## The synthetic land cover story (10x10, 1993 to 2025)

A single hand-authored narrative that exercises all three species in different
directions, so the aggregate SHI tells a richer story than any one species.

Rough starting layout (1993):
- A block of **forest** in one corner.
- A **wetland** patch fed by a **river** running across the grid, with a small
  **lake**.
- An expanse of **grassland** with some **shrubs**.
- A few **crops** and one small **developed** cell.

Narrative beats over time (illustrative, tune while building):
- **1993 to ~2005: forest fragmentation.** The forest block is progressively
  cut by a corridor of crops/developed, splitting it into two. Forest species:
  area falls modestly, connectivity falls sharply (this is the fragmentation
  lesson, and why connectivity is its own sub-score).
- **~2005 to ~2015: wetland drainage.** Part of the wetland is converted to
  crops and the river narrows. Wetland species: steep area decline. Forest and
  grassland species: little change. Shows how a group-specific pressure shows up
  in the group SHI but is diluted in the overall SHI.
- **~2015 to 2025: grassland conversion.** Grassland is partly converted to
  crops and shrubs encroach. Grassland species: gradual area decline; because
  crops (0.4) and shrubs (0.6) retain partial suitability, the drop is gentler
  than the wetland case, illustrating partial-suitability effects.

With baseline 2001, the user can watch each group's SHS diverge from 100 as its
pressure hits, and see the overall SHI as the average.

## Concept walkthrough (the guided tour)

Ordered steps the app should be able to walk a user through:

1. **One species, one year.** Show land cover, then the forest species' AOH map
   (land cover recolored by suitability). "This is area of habitat."
2. **Add time.** Move the slider; watch the forest AOH fragment and the area and
   connectivity scores fall. Introduce the baseline = 100 idea.
3. **Add species.** Bring in wetland and grassland species; show all three AOH
   maps. Each responds to different land cover.
4. **Overlap / richness.** Overlay the three AOH maps into a richness surface
   (sum or max of suitabilities) to show where habitat concentrates spatially.
   Contrast this spatial overlay with the SHI, which is the mean of the indexed
   per-species scores, not a spatial overlap.
5. **Stack into the index.** Show SHS per species, then the group SHIs, then the
   overall SHI as their mean. This is the "how the values stack" step.
6. **Edit a pixel.** Switch a forest cell to barren; watch the forest species'
   AOH, its SHS, and the overall SHI drop immediately.
7. **Restoration.** In 2025, convert a block of grassland to forest; show SHI
   before vs after. Discuss which species benefit (forest up) and which lose
   (grassland down), and the net effect on the overall index.

## Restoration example (concrete)

Starting from 2025, restore forest by converting a contiguous block of grassland
cells adjacent to the existing forest to forest.

Expected qualitative outcome:
- Forest species: area up, connectivity up (reconnecting fragmented forest), SHS
  rises.
- Grassland species: area down, SHS falls.
- Wetland species: little change.
- Overall SHI: net change depends on the block size and placement; placing the
  restored block to bridge two forest fragments should raise the forest
  connectivity score more than an isolated block, which is itself a teaching
  point (where you restore matters, not just how much).
