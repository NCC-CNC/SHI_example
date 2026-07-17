import { describe, expect, it } from 'vitest';
import {
  GRID_HEIGHT,
  GRID_WIDTH,
  buildBaseLandscape,
  buildLandscapeEvents,
  forestCorridorCells,
} from './landscape.ts';
import { YEAR_MAX, YEAR_MIN } from '../engine/index.ts';

describe('buildBaseLandscape', () => {
  it('is deterministic (same seed, same grid)', () => {
    expect(buildBaseLandscape().cells).toEqual(buildBaseLandscape().cells);
  });

  it('has the expected dimensions', () => {
    const grid = buildBaseLandscape();
    expect(grid.width).toBe(GRID_WIDTH);
    expect(grid.height).toBe(GRID_HEIGHT);
    expect(grid.cells).toHaveLength(GRID_WIDTH * GRID_HEIGHT);
  });

  it('contains the full range of landscape cover types', () => {
    const present = new Set<string>(buildBaseLandscape().cells);
    for (const type of ['forest', 'grassland', 'wetland', 'river', 'lake', 'crops']) {
      expect(present.has(type)).toBe(true);
    }
  });
});

describe('forestCorridorCells', () => {
  it('returns forest cells ordered top to bottom', () => {
    const base = buildBaseLandscape();
    const corridor = forestCorridorCells(base);
    expect(corridor.length).toBeGreaterThan(5);
    let prevY = -1;
    for (const idx of corridor) {
      expect(base.cells[idx]).toBe('forest');
      const y = Math.floor(idx / GRID_WIDTH);
      expect(y).toBeGreaterThanOrEqual(prevY);
      prevY = y;
    }
  });

  it('wanders horizontally rather than holding one column', () => {
    const base = buildBaseLandscape();
    const xs = forestCorridorCells(base).map((idx) => idx % GRID_WIDTH);
    expect(new Set(xs).size).toBeGreaterThan(2);
  });
});

describe('buildLandscapeEvents', () => {
  it('produces sorted events within the scenario year range', () => {
    const events = buildLandscapeEvents(buildBaseLandscape());
    expect(events.length).toBeGreaterThan(0);
    let prevYear = YEAR_MIN - 1;
    for (const event of events) {
      expect(event.year).toBeGreaterThanOrEqual(YEAR_MIN);
      expect(event.year).toBeLessThanOrEqual(YEAR_MAX);
      expect(event.year).toBeGreaterThanOrEqual(prevYear);
      expect(event.changes.length).toBeGreaterThan(0);
      prevYear = event.year;
    }
  });
});
