import { describe, expect, it } from 'vitest';
import { LAND_COVER_TYPES } from './constants.ts';
import { createGrid, gridFromRows } from './grid.ts';
import { speciesHabitatScore } from './shs.ts';
import type { Crosswalk, Species } from './types.ts';

function makeCrosswalk(overrides: Partial<Crosswalk>): Crosswalk {
  const base = {} as Crosswalk;
  for (const type of LAND_COVER_TYPES) {
    base[type] = overrides[type] ?? 0;
  }
  return base;
}

const forest: Species = {
  id: 'forest',
  name: 'Forest sp.',
  group: 'forest',
  crosswalk: makeCrosswalk({ forest: 1 }),
};

// Baseline: 3x3 all forest. Current: same but the centre cell became barren.
const baseline = createGrid(3, 3, 'forest');
const current = gridFromRows([
  ['forest', 'forest', 'forest'],
  ['forest', 'barren', 'forest'],
  ['forest', 'forest', 'forest'],
]);

describe('speciesHabitatScore', () => {
  it('with connectivity off, SHS equals the area score', () => {
    const score = speciesHabitatScore(forest, current, baseline, {
      includeConnectivity: false,
    });
    // 8 of 9 forest cells remain -> 100 * 8/9
    expect(score.areaScore).toBeCloseTo((100 * 8) / 9, 10);
    expect(score.connectivityScore).toBeNull();
    expect(score.shs).toBeCloseTo((100 * 8) / 9, 10);
  });

  it('with connectivity on, SHS is the mean of area and connectivity', () => {
    const score = speciesHabitatScore(forest, current, baseline);
    // area = 800/9; baseline gisfrag = 10/9, current gisfrag = 1 -> conn = 90
    const area = (100 * 8) / 9;
    const conn = 90;
    expect(score.areaScore).toBeCloseTo(area, 10);
    expect(score.connectivityScore).toBeCloseTo(conn, 10);
    expect(score.shs).toBeCloseTo((area + conn) / 2, 10);
  });

  it('scores the baseline against itself at 100', () => {
    const score = speciesHabitatScore(forest, baseline, baseline);
    expect(score.areaScore).toBeCloseTo(100, 10);
    expect(score.connectivityScore).toBeCloseTo(100, 10);
    expect(score.shs).toBeCloseTo(100, 10);
  });

  it('returns null SHS when there is no baseline habitat', () => {
    const noHabitat: Species = {
      id: 'none',
      name: 'No habitat',
      group: 'forest',
      crosswalk: makeCrosswalk({ lake: 1 }), // no lake anywhere in the grids
    };
    const score = speciesHabitatScore(noHabitat, current, baseline);
    expect(score.areaScore).toBeNull();
    expect(score.shs).toBeNull();
  });

  it('throws when the grids differ in size', () => {
    const smaller = createGrid(2, 2, 'forest');
    expect(() => speciesHabitatScore(forest, smaller, baseline)).toThrow();
  });
});
