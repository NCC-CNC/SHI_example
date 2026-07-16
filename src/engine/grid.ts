import type { LandCoverType } from './constants.ts';
import type { Grid } from './types.ts';

/** Create a grid of the given size, filled with one land cover type. */
export function createGrid(width: number, height: number, fill: LandCoverType): Grid {
  if (width <= 0 || height <= 0) {
    throw new Error(`createGrid: width and height must be positive`);
  }
  return { width, height, cells: new Array<LandCoverType>(width * height).fill(fill) };
}

/**
 * Build a grid from rows of land cover types (row 0 is the top). Handy for
 * authoring scenarios and for tests. All rows must have the same length.
 */
export function gridFromRows(rows: readonly (readonly LandCoverType[])[]): Grid {
  const height = rows.length;
  if (height === 0) {
    throw new Error('gridFromRows: at least one row is required');
  }
  const width = rows[0]!.length;
  if (width === 0) {
    throw new Error('gridFromRows: rows must not be empty');
  }
  const cells: LandCoverType[] = [];
  for (const row of rows) {
    if (row.length !== width) {
      throw new Error('gridFromRows: all rows must have the same length');
    }
    cells.push(...row);
  }
  return { width, height, cells };
}

/** Read the land cover type at (x, y), bounds-checked. */
export function cellAt(grid: Grid, x: number, y: number): LandCoverType {
  if (x < 0 || y < 0 || x >= grid.width || y >= grid.height) {
    throw new Error(`cellAt: (${x}, ${y}) out of bounds`);
  }
  return grid.cells[y * grid.width + x]!;
}

/** True when two grids have the same dimensions. */
export function sameDimensions(a: Grid, b: Grid): boolean {
  return a.width === b.width && a.height === b.height;
}
