import { describe, expect, it } from 'vitest';
import { areaScore } from './area.ts';

describe('areaScore', () => {
  it('scores the baseline year at 100', () => {
    expect(areaScore(100, 100)).toBe(100);
  });

  it('scores a 6% area loss at 94 (matching the SHI example)', () => {
    expect(areaScore(94, 100)).toBeCloseTo(94, 10);
  });

  it('scores a gain above 100', () => {
    expect(areaScore(110, 100)).toBeCloseTo(110, 10);
  });

  it('returns null when there is no baseline habitat', () => {
    expect(areaScore(0, 0)).toBeNull();
    expect(areaScore(5, 0)).toBeNull();
  });
});
