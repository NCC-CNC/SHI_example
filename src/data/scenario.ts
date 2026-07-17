import { YEAR_MAX, YEAR_MIN, gridFromRows } from '../engine/index.ts';
import type { Grid, LandCoverType } from '../engine/index.ts';
import { LAND_COVER_BY_CHAR } from './land-cover.ts';
import { buildBaseLandscape, buildLandscapeEvents } from './landscape.ts';

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

// --- The synthetic landscape scenario (~30x30, 1993..2025) ----------------
//
// The base landscape and the dated disturbances are generated procedurally (a
// fixed seed, no runtime randomness) in landscape.ts. The teaching story is
// unchanged, each species declines for a different reason (see
// docs/design/02_example_scenarios.md):
//   1. Forest fragmentation (a developed corridor splits the forest upland) hits
//      the American Marten: area falls gradually, connectivity sharply.
//   2. Wetland drainage (the bottom-left marsh dries to barren) hits the
//      American Bittern.
//   3. Grassland conversion (right side to crops) hits the Bobolink, but gently,
//      since it still half-uses crops.

const BASE_1993 = buildBaseLandscape();

const EVENTS: readonly ScenarioEvent[] = buildLandscapeEvents(BASE_1993);

/** Every year in the scenario, inclusive. */
export const SCENARIO_YEARS: readonly number[] = Array.from(
  { length: YEAR_MAX - YEAR_MIN + 1 },
  (_, i) => YEAR_MIN + i,
);

/** The land cover grid for a given year in the forest-fragmentation scenario. */
export function landCoverForYear(year: number): Grid {
  return buildGridForYear(BASE_1993, EVENTS, year);
}
