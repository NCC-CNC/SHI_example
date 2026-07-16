import { YEAR_MAX, YEAR_MIN, gridFromRows } from '../engine/index.ts';
import type { Grid, LandCoverType } from '../engine/index.ts';
import { LAND_COVER_BY_CHAR } from './land-cover.ts';

/** A single cell change applied from a given year onward. */
export interface CellChange {
  readonly x: number;
  readonly y: number;
  readonly to: LandCoverType;
}

/** A dated set of cell changes (cumulative from that year forward). */
export interface ScenarioEvent {
  readonly year: number;
  readonly changes: readonly CellChange[];
}

/** Parse a land cover grid from single-character row strings. */
export function parseGrid(rows: readonly string[]): Grid {
  return gridFromRows(
    rows.map((row) =>
      [...row].map((char) => {
        const type = LAND_COVER_BY_CHAR[char];
        if (type === undefined) {
          throw new Error(`parseGrid: unknown land cover char "${char}"`);
        }
        return type;
      }),
    ),
  );
}

/**
 * Build the land cover grid for a given year by applying, in year order, every
 * event whose year is <= the requested year, on top of the base grid. Edits are
 * cumulative; a later event can overwrite an earlier one on the same cell.
 */
export function buildGridForYear(
  base: Grid,
  events: readonly ScenarioEvent[],
  year: number,
): Grid {
  const cells = [...base.cells];
  const applicable = events
    .filter((event) => event.year <= year)
    .sort((a, b) => a.year - b.year);
  for (const event of applicable) {
    for (const change of event.changes) {
      if (
        change.x < 0 ||
        change.y < 0 ||
        change.x >= base.width ||
        change.y >= base.height
      ) {
        throw new Error(
          `buildGridForYear: change out of bounds (${change.x}, ${change.y})`,
        );
      }
      cells[change.y * base.width + change.x] = change.to;
    }
  }
  return { width: base.width, height: base.height, cells };
}

// --- The synthetic landscape scenario (10x10, 1993..2025) ----------------
//
// A three-part story so each species declines for a different reason (see
// docs/design/02_example_scenarios.md):
//   1. Forest fragmentation (top-left block split by a crop corridor) hits the
//      American Marten: area falls gradually, connectivity sharply.
//   2. Wetland drainage (bottom-left marsh converted to grass/crops) hits the
//      American Bittern.
//   3. Grassland conversion (right side to crops/shrubs) hits the Bobolink, but
//      gently, since it still uses crops.

const BASE_1993 = parseGrid([
  'FFFFFFFSGG',
  'FFFFFFFSGG',
  'FFFFFFFSGG',
  'FFFFFFFSGG',
  'FFFFFFFSGG',
  'FFFFFFFSGG',
  'SSSSSSSSGG',
  'WWWSSGGGGG',
  'LWWSSGGGCC',
  'LLWSSGGRCC',
]);

const c = (x: number, y: number, to: LandCoverType): CellChange => ({ x, y, to });

// Forest and wetland losses convert to developed/barren (roads, clearing, dried
// mud), which is unsuitable for all three species, so those losses do not
// incidentally feed the grassland generalist. Grassland converts to crops,
// which the Bobolink still half-uses, so its decline is real but gentle.
const EVENTS: readonly ScenarioEvent[] = [
  // Forest: edge softening to shrubs at the margin (before the baseline year).
  { year: 1998, changes: [c(6, 0, 'shrubs'), c(6, 1, 'shrubs'), c(6, 2, 'shrubs')] },
  // Forest: a corridor of development begins cutting down through the block.
  { year: 2003, changes: [c(3, 0, 'developed'), c(3, 1, 'developed')] },
  { year: 2006, changes: [c(3, 2, 'developed'), c(3, 3, 'developed')] },
  // Wetland: the marsh starts drying at its edge.
  { year: 2007, changes: [c(0, 7, 'barren')] },
  // Forest: the corridor reaches the bottom; the block is split in two.
  { year: 2009, changes: [c(3, 4, 'developed'), c(3, 5, 'developed')] },
  // Wetland: drainage continues.
  { year: 2010, changes: [c(1, 7, 'barren'), c(2, 9, 'barren')] },
  // Forest widens/deepens the split; wetland dries further.
  {
    year: 2013,
    changes: [
      c(2, 3, 'developed'),
      c(4, 2, 'developed'),
      c(5, 5, 'developed'),
      c(2, 7, 'barren'),
      c(1, 8, 'barren'),
    ],
  },
  // Wetland nearly gone; grassland conversion to cropland begins on the right.
  { year: 2016, changes: [c(2, 8, 'barren'), c(8, 6, 'crops'), c(9, 6, 'crops')] },
  // Forest: further nibbling at the fragments.
  {
    year: 2017,
    changes: [c(0, 5, 'developed'), c(1, 5, 'developed'), c(6, 5, 'developed')],
  },
  // Grassland to cropland.
  { year: 2019, changes: [c(5, 7, 'crops'), c(6, 7, 'crops')] },
  { year: 2021, changes: [c(2, 0, 'developed'), c(4, 0, 'developed')] },
  { year: 2022, changes: [c(7, 7, 'crops'), c(8, 7, 'crops')] },
  {
    year: 2024,
    changes: [
      c(5, 0, 'developed'),
      c(0, 4, 'developed'),
      c(5, 8, 'crops'),
      c(8, 0, 'crops'),
    ],
  },
];

/** Every year in the scenario, inclusive. */
export const SCENARIO_YEARS: readonly number[] = Array.from(
  { length: YEAR_MAX - YEAR_MIN + 1 },
  (_, i) => YEAR_MIN + i,
);

/** The land cover grid for a given year in the forest-fragmentation scenario. */
export function landCoverForYear(year: number): Grid {
  return buildGridForYear(BASE_1993, EVENTS, year);
}
