import { describe, expect, it } from 'vitest';
import { aggregateShi } from './aggregate.ts';

describe('aggregateShi', () => {
  it('averages defined SHS overall and within each group', () => {
    const result = aggregateShi([
      { group: 'forest', shs: 90 },
      { group: 'forest', shs: 80 },
      { group: 'wetland', shs: 70 },
    ]);
    expect(result.overall).toBeCloseTo(80, 10); // (90+80+70)/3
    expect(result.byGroup['forest']).toBeCloseTo(85, 10);
    expect(result.byGroup['wetland']).toBeCloseTo(70, 10);
  });

  it('excludes species with an undefined SHS', () => {
    const result = aggregateShi([
      { group: 'forest', shs: 90 },
      { group: 'grassland', shs: null },
    ]);
    expect(result.overall).toBeCloseTo(90, 10);
    // a group with only undefined species is omitted
    expect(result.byGroup['grassland']).toBeUndefined();
    expect(result.byGroup['forest']).toBeCloseTo(90, 10);
  });

  it('returns null overall and no groups when nothing is defined', () => {
    const result = aggregateShi([
      { group: 'forest', shs: null },
      { group: 'wetland', shs: null },
    ]);
    expect(result.overall).toBeNull();
    expect(Object.keys(result.byGroup)).toHaveLength(0);
  });

  it('returns null overall for an empty input', () => {
    const result = aggregateShi([]);
    expect(result.overall).toBeNull();
    expect(Object.keys(result.byGroup)).toHaveLength(0);
  });
});
