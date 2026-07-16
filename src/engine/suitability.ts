import { SUIT_THRESHOLD } from './constants.ts';
import type { Grid, Species } from './types.ts';

/**
 * The species' suitability grid for a land cover grid: each cell's land cover
 * type mapped through the species crosswalk to a 0..1 value. This continuous
 * grid is the species' Area of Habitat (AOH) map. Same row-major layout as the
 * input grid.
 */
export function suitabilityField(species: Species, grid: Grid): number[] {
  return grid.cells.map((landCover) => species.crosswalk[landCover]);
}

/** Total habitat "amount": the sum of suitability across all cells. */
export function summedSuitability(field: readonly number[]): number {
  let sum = 0;
  for (const value of field) {
    sum += value;
  }
  return sum;
}

/**
 * Threshold a suitability field into a binary "suitable" mask, which the
 * connectivity metric needs so the suitable area has an edge.
 */
export function suitableMask(
  field: readonly number[],
  threshold: number = SUIT_THRESHOLD,
): boolean[] {
  return field.map((value) => value >= threshold);
}
