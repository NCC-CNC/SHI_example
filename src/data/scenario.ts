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

// --- The forest-fragmentation scenario (10x10, 1993..2025) ---------------
//
// A contiguous forest block in the top-left is progressively split by a corridor
// of crops/developed land and nibbled at its edges. The American Marten's area
// declines gradually while its connectivity drops sharply when the block splits.
// See docs/design/02_example_scenarios.md.

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

const EVENTS: readonly ScenarioEvent[] = [
  // Edge softening: the forest starts giving way to shrubs at its margin.
  { year: 1998, changes: [c(6, 0, 'shrubs'), c(6, 1, 'shrubs'), c(6, 2, 'shrubs')] },
  // A crop corridor begins cutting down through the block.
  { year: 2003, changes: [c(3, 0, 'crops'), c(3, 1, 'crops')] },
  { year: 2006, changes: [c(3, 2, 'crops'), c(3, 3, 'crops')] },
  // The corridor reaches the bottom: the block is now split in two.
  { year: 2009, changes: [c(3, 4, 'crops'), c(3, 5, 'crops')] },
  // The corridor widens and the split deepens.
  {
    year: 2013,
    changes: [c(2, 3, 'developed'), c(4, 2, 'developed'), c(5, 5, 'shrubs')],
  },
  // Further nibbling at the fragments.
  {
    year: 2017,
    changes: [c(0, 5, 'grassland'), c(1, 5, 'grassland'), c(6, 5, 'shrubs')],
  },
  { year: 2021, changes: [c(2, 0, 'crops'), c(4, 0, 'crops')] },
  { year: 2024, changes: [c(5, 0, 'shrubs'), c(0, 4, 'shrubs')] },
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
