import type { Grid } from '../engine/index.ts';

interface GridViewProps {
  readonly grid: Grid;
  /** Fill color for the cell at a given flat index. */
  readonly colorOf: (index: number) => string;
  /** Native hover tooltip text for a cell (identity, not color-alone). */
  readonly labelOf: (index: number) => string;
  readonly cellSize?: number;
}

/**
 * Renders a land cover / suitability grid as SVG cells. A 2px surface gap
 * between cells keeps adjacent fills legible. Each cell carries a <title> so
 * hovering names it, so identity never depends on color alone.
 */
export function GridView({ grid, colorOf, labelOf, cellSize = 30 }: GridViewProps) {
  const width = grid.width * cellSize;
  const height = grid.height * cellSize;
  const gap = 2;

  return (
    <svg
      className="grid-view"
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
            rx={2}
            fill={colorOf(index)}
          >
            <title>{labelOf(index)}</title>
          </rect>
        );
      })}
    </svg>
  );
}
