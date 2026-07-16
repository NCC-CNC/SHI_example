import { describe, expect, it } from 'vitest';
import { cellAt, speciesHabitatScore } from '../engine/index.ts';
import {
  SCENARIO_YEARS,
  buildGridForYear,
  landCoverForYear,
  parseGrid,
} from './scenario.ts';
import { AMERICAN_MARTEN } from './species.ts';

describe('parseGrid', () => {
  it('maps character codes to land cover types', () => {
    const grid = parseGrid(['FG', 'WR']);
    expect(grid.cells).toEqual(['forest', 'grassland', 'wetland', 'river']);
  });

  it('throws on an unknown character', () => {
    expect(() => parseGrid(['FX'])).toThrow();
  });
});

describe('buildGridForYear', () => {
  const base = parseGrid(['FF', 'FF']);
  const events = [
    { year: 2000, changes: [{ x: 0, y: 0, to: 'crops' as const }] },
    { year: 2010, changes: [{ x: 0, y: 0, to: 'developed' as const }] },
  ];

  it('returns the base grid before any event', () => {
    expect(buildGridForYear(base, events, 1999).cells).toEqual([
      'forest',
      'forest',
      'forest',
      'forest',
    ]);
  });

  it('applies events cumulatively, later overwriting earlier', () => {
    expect(cellAt(buildGridForYear(base, events, 2005), 0, 0)).toBe('crops');
    expect(cellAt(buildGridForYear(base, events, 2010), 0, 0)).toBe('developed');
  });

  it('throws on an out-of-bounds change', () => {
    const bad = [{ year: 2000, changes: [{ x: 5, y: 0, to: 'crops' as const }] }];
    expect(() => buildGridForYear(base, bad, 2000)).toThrow();
  });
});

describe('forest-fragmentation scenario', () => {
  it('spans 1993..2025 inclusive', () => {
    expect(SCENARIO_YEARS[0]).toBe(1993);
    expect(SCENARIO_YEARS.at(-1)).toBe(2025);
    expect(SCENARIO_YEARS).toHaveLength(33);
  });

  it('starts as a forest block and gains a crop corridor over time', () => {
    expect(cellAt(landCoverForYear(1993), 0, 0)).toBe('forest');
    expect(cellAt(landCoverForYear(1993), 3, 0)).toBe('forest');
    // the corridor cell has turned to crops by 2003
    expect(cellAt(landCoverForYear(2003), 3, 0)).toBe('crops');
  });

  it("drives the Marten's habitat score below baseline as forest is lost", () => {
    const baseline = landCoverForYear(2001);
    const current = landCoverForYear(2025);
    const score = speciesHabitatScore(AMERICAN_MARTEN, current, baseline);
    expect(score.areaScore).not.toBeNull();
    expect(score.areaScore!).toBeLessThan(100);
    expect(score.connectivityScore!).toBeLessThan(100);
    expect(score.shs!).toBeLessThan(100);
  });
});
