import { describe, expect, it } from 'vitest';
import { LAND_COVER_TYPES } from './constants.ts';
import { gridFromRows } from './grid.ts';
import { suitabilityField, suitableMask, summedSuitability } from './suitability.ts';
import type { Crosswalk, Species } from './types.ts';

function makeCrosswalk(overrides: Partial<Crosswalk>): Crosswalk {
  const base = {} as Crosswalk;
  for (const type of LAND_COVER_TYPES) {
    base[type] = overrides[type] ?? 0;
  }
  return base;
}

const forestSpecies: Species = {
  id: 'test-forest',
  name: 'Test Forest Species',
  group: 'forest',
  crosswalk: makeCrosswalk({ forest: 1, shrubs: 0.5, grassland: 0.1 }),
};

describe('suitabilityField', () => {
  it('maps each cell through the crosswalk', () => {
    const grid = gridFromRows([
      ['forest', 'shrubs'],
      ['grassland', 'developed'],
    ]);
    expect(suitabilityField(forestSpecies, grid)).toEqual([1, 0.5, 0.1, 0]);
  });
});

describe('summedSuitability', () => {
  it('sums the field', () => {
    expect(summedSuitability([1, 0.5, 0.1, 0])).toBeCloseTo(1.6, 10);
  });

  it('is zero for an empty field', () => {
    expect(summedSuitability([])).toBe(0);
  });
});

describe('suitableMask', () => {
  it('marks cells at or above the threshold', () => {
    expect(suitableMask([1, 0.5, 0.49, 0], 0.5)).toEqual([true, true, false, false]);
  });

  it('defaults to the model threshold of 0.5', () => {
    expect(suitableMask([0.5, 0.4])).toEqual([true, false]);
  });
});
