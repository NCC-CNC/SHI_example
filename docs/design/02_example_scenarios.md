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

## The synthetic land cover story (~30x30, 1993 to 2025)

A single narrative that exercises all three species in different directions, so
the aggregate SHI tells a richer story than any one species. The base landscape
and the dated disturbances are generated procedurally from a fixed seed (no
runtime randomness) in `src/data/landscape.ts`, then applied by `scenario.ts`.
This replaced the original hand-authored 10x10 rows so the maps read more like
terrain (issue #38); the teaching story is unchanged.

Starting layout (1993), an organic landscape rather than blocks:
- A **forest** upland anchored in the top-left, softening through a shrub
  ecotone into **grassland** across the right.
- A **wetland** band in the low, wet bottom-left, with a small **lake** and a
  **river** meandering down to it.
- A patch of existing **crops** in the dry bottom-right.

The generator lays these down with value noise so the region boundaries are
irregular. The disturbances below then act on the regions as they advance.

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
7. **Restoration.** In 2025, restore forest by reconnecting the fragmented
   block, and show SHI before vs after. The overall index rises, the forest
   species gains most (area and connectivity), and the step closes by inviting
   free editing to see the trade-offs.

Implementation note (M5): the tour restores the **developed corridor** that
split the forest over time back to forest, rather than "grassland to forest" as
first sketched. The forest upland is fragmented by a developed corridor that
wanders down through it (computed by `forestCorridorCells`), and the grassland
sits on the far right separated from the forest by shrubs, so it is not adjacent
to the forest. The
corridor is therefore the natural way to bridge the two fragments, it is
unambiguously positive (no species loses), and it directly demonstrates the
connectivity payoff and the "where you restore matters" point below. The
grassland-to-forest trade-off (forest up, grassland down) is left for the user
to try in free editing.

## Restoration example (concrete)

Starting from 2025, restore forest by converting the developed corridor that
wandered down through and split the forest block back to forest, reconnecting the
two fragments.

Expected qualitative outcome (matches the app):
- Forest species: area up, connectivity up (reconnecting fragmented forest), SHS
  rises.
- Wetland and grassland species: small gains or little change, never a loss. The
  corridor was developed (zero suitability for all three species), and forest
  has low but nonzero suitability for the wetland and grassland species, so those
  cells can only add habitat, not remove it.
- Overall SHI: rises. Placing the restored cells to bridge two forest fragments
  raises the forest connectivity score more than an isolated block would, which
  is itself a teaching point (where you restore matters, not just how much).

An alternative restoration to explore by hand is converting a block of grassland
to forest: the forest species gains but the grassland species loses, so the net
effect on the overall index can be slightly negative. That illustrates that
restoration is a trade-off between species, not a free gain.
