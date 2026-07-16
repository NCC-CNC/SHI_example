import { describe, expect, it } from 'vitest';
import { aggregateShi, cellAt, speciesHabitatScore } from '../engine/index.ts';
import {
  SCENARIO_YEARS,
  buildGridForYear,
  landCoverForYear,
  parseGrid,
} from './scenario.ts';
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

  it('starts as a forest block and is cut by a development corridor over time', () => {
    expect(cellAt(landCoverForYear(1993), 0, 0)).toBe('forest');
    expect(cellAt(landCoverForYear(1993), 3, 0)).toBe('forest');
    // the corridor cell has been developed by 2003
    expect(cellAt(landCoverForYear(2003), 3, 0)).toBe('developed');
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
