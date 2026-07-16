import { describe, expect, it } from 'vitest';
import { connectivityScore, distanceToEdgeField, gisfrag } from './connectivity.ts';

/** Build a mask over a width x height grid from a predicate on (x, y). */
function mask(
  width: number,
  height: number,
  suitable: (x: number, y: number) => boolean,
): boolean[] {
  const cells: boolean[] = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      cells.push(suitable(x, y));
    }
  }
  return cells;
}

describe('distanceToEdgeField', () => {
  it('on a fully-suitable 3x3, interior is 2 and the ring is 1', () => {
    const full = new Array<boolean>(9).fill(true);
    const dist = Array.from(distanceToEdgeField(full, 3, 3));
    expect(dist).toEqual([1, 1, 1, 1, 2, 1, 1, 1, 1]);
  });

  it('marks non-suitable cells as 0 and their suitable neighbours as 1', () => {
    // 3x3 with only the centre non-suitable.
    const m = mask(3, 3, (x, y) => !(x === 1 && y === 1));
    const dist = Array.from(distanceToEdgeField(m, 3, 3));
    expect(dist[4]).toBe(0); // centre, non-suitable
    // every suitable cell touches the centre or the boundary => 1
    expect(dist.filter((_, i) => i !== 4)).toEqual([1, 1, 1, 1, 1, 1, 1, 1]);
  });
});

describe('gisfrag', () => {
  it('returns null when nothing is suitable', () => {
    expect(gisfrag(new Array<boolean>(9).fill(false), 3, 3)).toBeNull();
  });

  it('averages distance-to-edge over suitable cells (3x3 full = 10/9)', () => {
    const full = new Array<boolean>(9).fill(true);
    expect(gisfrag(full, 3, 3)).toBeCloseTo(10 / 9, 10);
  });

  it('rewards a contiguous block over the same area scattered', () => {
    // Same 9 suitable cells in a 5x5 grid, arranged two ways.
    const contiguous = mask(5, 5, (x, y) => x >= 1 && x <= 3 && y >= 1 && y <= 3);
    const scattered = mask(5, 5, (x, y) => x % 2 === 0 && y % 2 === 0);

    const contiguousGisfrag = gisfrag(contiguous, 5, 5);
    const scatteredGisfrag = gisfrag(scattered, 5, 5);

    expect(contiguousGisfrag).toBeCloseTo(10 / 9, 10); // centre 2, ring 1
    expect(scatteredGisfrag).toBeCloseTo(1, 10); // every fragment is isolated
    expect(contiguousGisfrag!).toBeGreaterThan(scatteredGisfrag!);
  });
});

describe('connectivityScore', () => {
  it('indexes current GISfrag against baseline', () => {
    expect(connectivityScore(1, 10 / 9)).toBeCloseTo(90, 10);
    expect(connectivityScore(10 / 9, 10 / 9)).toBeCloseTo(100, 10);
  });

  it('returns null when either value is undefined or baseline is zero', () => {
    expect(connectivityScore(null, 1)).toBeNull();
    expect(connectivityScore(1, null)).toBeNull();
    expect(connectivityScore(1, 0)).toBeNull();
  });
});
