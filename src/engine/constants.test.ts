import { describe, expect, it } from 'vitest';
import {
  DEFAULT_BASELINE,
  LAND_COVER_TYPES,
  SUIT_THRESHOLD,
  YEAR_MAX,
  YEAR_MIN,
} from './constants.ts';
import { clamp } from './clamp.ts';

describe('constants', () => {
  it('models the nine land cover types with no duplicates', () => {
    expect(LAND_COVER_TYPES).toHaveLength(9);
    expect(new Set(LAND_COVER_TYPES).size).toBe(LAND_COVER_TYPES.length);
  });

  it('has a sane year range and a baseline inside it', () => {
    expect(YEAR_MIN).toBeLessThan(YEAR_MAX);
    expect(DEFAULT_BASELINE).toBeGreaterThanOrEqual(YEAR_MIN);
    expect(DEFAULT_BASELINE).toBeLessThanOrEqual(YEAR_MAX);
  });

  it('has a suitability threshold in (0, 1)', () => {
    expect(SUIT_THRESHOLD).toBeGreaterThan(0);
    expect(SUIT_THRESHOLD).toBeLessThan(1);
  });
});

describe('clamp', () => {
  it('returns the value when already in range', () => {
    expect(clamp(0.5, 0, 1)).toBe(0.5);
  });

  it('clamps below min and above max', () => {
    expect(clamp(-1, 0, 1)).toBe(0);
    expect(clamp(2, 0, 1)).toBe(1);
  });

  it('throws when min exceeds max', () => {
    expect(() => clamp(0, 1, 0)).toThrow();
  });
});
