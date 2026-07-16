import { describe, expect, it } from 'vitest';
import { cellAt, createGrid, gridFromRows, sameDimensions } from './grid.ts';

describe('createGrid', () => {
  it('creates a grid of the right size filled with one type', () => {
    const g = createGrid(3, 2, 'forest');
    expect(g.width).toBe(3);
    expect(g.height).toBe(2);
    expect(g.cells).toHaveLength(6);
    expect(g.cells.every((c) => c === 'forest')).toBe(true);
  });

  it('rejects non-positive dimensions', () => {
    expect(() => createGrid(0, 2, 'forest')).toThrow();
    expect(() => createGrid(2, -1, 'forest')).toThrow();
  });
});

describe('gridFromRows', () => {
  it('builds cells row-major from rows', () => {
    const g = gridFromRows([
      ['forest', 'grassland'],
      ['wetland', 'lake'],
    ]);
    expect(g.width).toBe(2);
    expect(g.height).toBe(2);
    expect(g.cells).toEqual(['forest', 'grassland', 'wetland', 'lake']);
  });

  it('rejects ragged rows and empty input', () => {
    expect(() => gridFromRows([['forest'], ['wetland', 'lake']])).toThrow();
    expect(() => gridFromRows([])).toThrow();
    expect(() => gridFromRows([[]])).toThrow();
  });
});

describe('cellAt', () => {
  const g = gridFromRows([
    ['forest', 'grassland'],
    ['wetland', 'lake'],
  ]);

  it('reads by coordinate', () => {
    expect(cellAt(g, 0, 0)).toBe('forest');
    expect(cellAt(g, 1, 0)).toBe('grassland');
    expect(cellAt(g, 0, 1)).toBe('wetland');
    expect(cellAt(g, 1, 1)).toBe('lake');
  });

  it('throws out of bounds', () => {
    expect(() => cellAt(g, 2, 0)).toThrow();
    expect(() => cellAt(g, 0, -1)).toThrow();
  });
});

describe('sameDimensions', () => {
  it('compares width and height', () => {
    expect(sameDimensions(createGrid(2, 3, 'forest'), createGrid(2, 3, 'lake'))).toBe(
      true,
    );
    expect(sameDimensions(createGrid(2, 3, 'forest'), createGrid(3, 2, 'forest'))).toBe(
      false,
    );
  });
});
