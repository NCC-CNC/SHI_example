/**
 * Area score: the current summed suitability as a percentage of the baseline
 * year's. Baseline scores 100; a 6% loss scores 94.
 *
 * Returns null when the baseline habitat is zero (the score is undefined and
 * the species should be excluded from the aggregate rather than dividing by
 * zero).
 */
export function areaScore(currentSum: number, baselineSum: number): number | null {
  if (baselineSum <= 0) {
    return null;
  }
  return (100 * currentSum) / baselineSum;
}
