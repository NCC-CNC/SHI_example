import { describe, expect, it } from 'vitest';
import {
  applyCellEdits,
  cellAt,
  createGrid,
  gridFromRows,
  sameDimensions,
} from './grid.ts';

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

describe('applyCellEdits', () => {
  const base = gridFromRows([
    ['forest', 'grassland'],
    ['wetland', 'lake'],
  ]);

  it('returns the same grid instance when there are no edits', () => {
    expect(applyCellEdits(base, new Map())).toBe(base);
  });

  it('overlays edits by flat index without mutating the input', () => {
    const edited = applyCellEdits(
      base,
      new Map([
        [1, 'forest'],
        [2, 'developed'],
      ]),
    );
    expect(edited.cells).toEqual(['forest', 'forest', 'developed', 'lake']);
    // Original grid is untouched.
    expect(base.cells).toEqual(['forest', 'grassland', 'wetland', 'lake']);
  });

  it('throws on an out-of-bounds index', () => {
    expect(() => applyCellEdits(base, new Map([[4, 'forest']]))).toThrow();
    expect(() => applyCellEdits(base, new Map([[-1, 'forest']]))).toThrow();
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
