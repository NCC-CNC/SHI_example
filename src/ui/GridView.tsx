import type { Grid } from '../engine/index.ts';

interface GridViewProps {
  readonly grid: Grid;
  /** Fill color for the cell at a given flat index. */
  readonly colorOf: (index: number) => string;
  /** Native hover tooltip text for a cell (identity, not color-alone). */
  readonly labelOf: (index: number) => string;
  readonly cellSize?: number;
  /** When set, cells become clickable (paint tool); called with the flat index. */
  readonly onCellClick?: ((index: number) => void) | undefined;
}

/**
 * Renders a land cover / suitability grid as SVG cells. A hairline surface gap
 * between cells keeps the grid faintly visible while the fills read as a
 * continuous landscape. Each cell carries a <title> so hovering names it, so
 * identity never depends on color alone. When `onCellClick` is provided the grid
 * is an editable surface: cells respond to click and to keyboard (Enter/Space).
 */
export function GridView({
  grid,
  colorOf,
  labelOf,
  cellSize = 16,
  onCellClick,
}: GridViewProps) {
  const width = grid.width * cellSize;
  const height = grid.height * cellSize;
  // A hairline gap that scales with the cell so it stays faint at any density.
  const gap = cellSize <= 10 ? 0.5 : 1;
  const editable = onCellClick !== undefined;

  return (
    <svg
      className={editable ? 'grid-view grid-view-editable' : 'grid-view'}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
    >
      {grid.cells.map((_, index) => {
        const x = (index % grid.width) * cellSize;
        const y = Math.floor(index / grid.width) * cellSize;
        return (
          <rect
            key={index}
            x={x + gap / 2}
            y={y + gap / 2}
            width={cellSize - gap}
            height={cellSize - gap}
            fill={colorOf(index)}
            className={editable ? 'grid-cell-editable' : undefined}
            tabIndex={editable ? 0 : undefined}
            onClick={editable ? () => onCellClick(index) : undefined}
            onKeyDown={
              editable
                ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onCellClick(index);
                    }
                  }
                : undefined
            }
          >
            <title>{labelOf(index)}</title>
          </rect>
        );
      })}
    </svg>
  );
}
