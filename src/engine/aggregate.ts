import type { SpeciesGroup } from './types.ts';

export interface AggregateEntry {
  readonly group: SpeciesGroup;
  readonly shs: number | null;
}

export interface AggregateResult {
  /** Simple-mean SHI across all species with a defined SHS, or null if none. */
  readonly overall: number | null;
  /** Simple-mean SHI within each group, keyed by group. */
  readonly byGroup: Readonly<Record<SpeciesGroup, number>>;
}

function mean(values: readonly number[]): number | null {
  if (values.length === 0) {
    return null;
  }
  let sum = 0;
  for (const value of values) {
    sum += value;
  }
  return sum / values.length;
}

/**
 * Aggregate per-species habitat scores into the overall SHI and a per-group
 * SHI, both as simple means. Species with an undefined (null) SHS are excluded;
 * a group with no defined species is omitted from `byGroup`.
 */
export function aggregateShi(entries: readonly AggregateEntry[]): AggregateResult {
  const definedShs: number[] = [];
  const byGroupValues = new Map<SpeciesGroup, number[]>();

  for (const entry of entries) {
    if (entry.shs === null) {
      continue;
    }
    definedShs.push(entry.shs);
    const bucket = byGroupValues.get(entry.group) ?? [];
    bucket.push(entry.shs);
    byGroupValues.set(entry.group, bucket);
  }

  const byGroup: Record<SpeciesGroup, number> = {};
  for (const [group, values] of byGroupValues) {
    const groupMean = mean(values);
    if (groupMean !== null) {
      byGroup[group] = groupMean;
    }
  }

  return { overall: mean(definedShs), byGroup };
}
