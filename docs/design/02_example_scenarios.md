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

Real Canadian species, one per group, chosen so their AOH maps look different
and their scores move in different directions under the same land cover change.
The suitability values (0..1 per land cover type) are illustrative and tuned for
teaching, not authoritative habitat data; adjust freely while building.

### Forest species (group: forest) - American Marten (*Martes americana*)

A boreal/mixedwood forest specialist that needs large, contiguous mature forest
and is sensitive to fragmentation. This makes it the clearest species for the
connectivity lesson: cutting a corridor through forest hurts its connectivity
score more than its area score.

| land cover | suitability |
|------------|-------------|
| forest     | 1.0         |
| shrubs     | 0.4         |
| wetland    | 0.2         |
| river      | 0.1         |
| grassland  | 0.05        |
| crops      | 0.0         |
| lake       | 0.0         |
| developed  | 0.0         |
| barren     | 0.0         |

### Wetland species (group: wetland) - American Bittern (*Botaurus lentiginosus*)

A secretive marsh bird tied to emergent wetland vegetation. Draining or
converting wetland collapses its habitat quickly.

| land cover | suitability |
|------------|-------------|
| wetland    | 1.0         |
| river      | 0.6         |
| lake       | 0.5         |
| shrubs     | 0.3         |
| grassland  | 0.2         |
| forest     | 0.15        |
| crops      | 0.1         |
| developed  | 0.0         |
| barren     | 0.0         |

### Grassland species (group: grassland) - Bobolink (*Dolichonyx oryzivorus*)

A grassland songbird (a Canadian species at risk) that breeds in native
grassland but also uses hayfields and pasture. Its partial use of crops means
grassland-to-crop conversion is a gentler decline than an outright loss, which
illustrates partial-suitability effects.

| land cover | suitability |
|------------|-------------|
| grassland  | 1.0         |
| crops      | 0.5         |
| shrubs     | 0.4         |
| wetland    | 0.2         |
| barren     | 0.15        |
| forest     | 0.05        |
| river      | 0.05        |
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
4. **Overlap / richness.** A **toggleable** layer that overlays the three AOH
   maps into a richness surface (sum or max of suitabilities) to show where
   habitat concentrates spatially. It is a view the user turns on, not a
   permanent side panel, so it does not consume screen space by default.
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
