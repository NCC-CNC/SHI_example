import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Grid, LandCoverType } from '../engine/index.ts';
import { GridView } from './GridView.tsx';

/**
 * Roving-tabindex behaviour for the editable grid (#41): the whole grid is one
 * tab stop, arrow keys move the active cell, and Enter/Space paints it.
 */

// A 3x2 grid (indices 0..5) is enough to exercise horizontal and vertical moves.
const grid: Grid = {
  width: 3,
  height: 2,
  cells: Array.from({ length: 6 }, () => 'forest' as LandCoverType),
};

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

function render(onCellClick?: (index: number) => void) {
  act(() => {
    root = createRoot(container);
    root.render(
      <GridView
        grid={grid}
        colorOf={() => '#000'}
        labelOf={(i) => `cell ${i}`}
        onCellClick={onCellClick}
      />,
    );
  });
}

function svg() {
  return container.querySelector('svg')!;
}

function key(k: string) {
  act(() => {
    svg().dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));
  });
}

describe('GridView roving tabindex', () => {
  it('is a single tab stop, not one per cell', () => {
    render(() => {});
    expect(svg().getAttribute('tabindex')).toBe('0');
    expect(svg().getAttribute('role')).toBe('grid');
    const focusableCells = container.querySelectorAll('rect[tabindex]');
    expect(focusableCells.length).toBe(0);
  });

  it('paints the active cell on Enter and tracks it via aria-activedescendant', () => {
    const onCellClick = vi.fn();
    render(onCellClick);
    // Starts at index 0.
    expect(svg().getAttribute('aria-activedescendant')).toMatch(/-0$/);
    key('ArrowRight'); // -> 1
    key('ArrowDown'); // -> 4
    key('Enter');
    expect(onCellClick).toHaveBeenCalledWith(4);
    expect(svg().getAttribute('aria-activedescendant')).toMatch(/-4$/);
  });

  it('clamps movement at the grid edges', () => {
    const onCellClick = vi.fn();
    render(onCellClick);
    key('ArrowLeft'); // already at 0, stays
    key('ArrowUp'); // top row, stays
    key(' '); // Space paints
    expect(onCellClick).toHaveBeenCalledWith(0);
  });

  it('does nothing keyboard-wise when not editable', () => {
    render(undefined);
    expect(svg().getAttribute('role')).toBe('img');
    expect(svg().getAttribute('tabindex')).toBeNull();
  });
});
