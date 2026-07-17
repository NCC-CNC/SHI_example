import { describe, expect, it } from 'vitest';
import { aggregateShi, cellAt, speciesHabitatScore } from '../engine/index.ts';
import {
  SCENARIO_YEARS,
  buildGridForYear,
  landCoverForYear,
  parseGrid,
} from './scenario.ts';
import {
  GRID_HEIGHT,
  GRID_WIDTH,
  buildBaseLandscape,
  forestCorridorCells,
} from './landscape.ts';
import { AMERICAN_MARTEN, SPECIES } from './species.ts';

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

  it('generates a ~30x30 grid with a forest upland in the top-left', () => {
    const grid = landCoverForYear(1993);
    expect(grid.width).toBe(GRID_WIDTH);
    expect(grid.height).toBe(GRID_HEIGHT);
    expect(cellAt(grid, 0, 0)).toBe('forest');
    const forestCells = grid.cells.filter((c) => c === 'forest').length;
    expect(forestCells).toBeGreaterThan(50);
  });

  it('cuts the forest with a development corridor over time', () => {
    const corridor = forestCorridorCells(buildBaseLandscape());
    expect(corridor.length).toBeGreaterThan(5);
    const base = landCoverForYear(1993);
    const later = landCoverForYear(2025);
    for (const idx of corridor) {
      // Every corridor cell starts as forest and is developed by 2025.
      expect(base.cells[idx]).toBe('forest');
      expect(later.cells[idx]).toBe('developed');
    }
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

  it('lowers every species and the overall index by 2025 (baseline 2001)', () => {
    const baseline = landCoverForYear(2001);
    const current = landCoverForYear(2025);
    const entries = SPECIES.map((species) => ({
      group: species.group,
      shs: speciesHabitatScore(species, current, baseline).shs,
    }));
    for (const entry of entries) {
      expect(entry.shs).not.toBeNull();
      expect(entry.shs!).toBeLessThan(100);
    }
    const aggregate = aggregateShi(entries);
    expect(aggregate.overall).not.toBeNull();
    expect(aggregate.overall!).toBeLessThan(100);
    // one group per species here
    expect(Object.keys(aggregate.byGroup).sort()).toEqual([
      'forest',
      'grassland',
      'wetland',
    ]);
  });

  it('scores the baseline year at 100 for the whole index', () => {
    const baseline = landCoverForYear(2001);
    const entries = SPECIES.map((species) => ({
      group: species.group,
      shs: speciesHabitatScore(species, baseline, baseline).shs,
    }));
    expect(aggregateShi(entries).overall).toBeCloseTo(100, 10);
  });

  it('connectivity toggle changes a fragmented species score', () => {
    const baseline = landCoverForYear(2001);
    const current = landCoverForYear(2025);
    const withConn = speciesHabitatScore(AMERICAN_MARTEN, current, baseline, {
      includeConnectivity: true,
    });
    const areaOnly = speciesHabitatScore(AMERICAN_MARTEN, current, baseline, {
      includeConnectivity: false,
    });
    expect(areaOnly.connectivityScore).toBeNull();
    expect(areaOnly.shs).toBeCloseTo(areaOnly.areaScore!, 10);
    expect(withConn.shs).not.toBeCloseTo(areaOnly.shs!, 5);
  });
});
