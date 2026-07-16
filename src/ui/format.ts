/** Format a score for display: one decimal, or "n/a" when undefined. */
export function formatScore(value: number | null): string {
  return value === null ? 'n/a' : value.toFixed(1);
}
