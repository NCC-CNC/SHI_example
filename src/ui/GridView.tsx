import { useId, useState, type KeyboardEvent } from 'react';
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
 * identity never depends on color alone.
 *
 * When `onCellClick` is provided the grid is an editable surface. It uses the
 * roving-tabindex grid pattern: the whole grid is a single tab stop
 * (`role="grid"`), arrow keys move a cursor between cells (tracked with
 * `aria-activedescendant`), and Enter/Space paints the active cell. This keeps
 * keyboard and screen-reader users out of ~900 individual tab stops at 30x30.
 * Mouse users click any cell as before.
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
  const baseId = useId();
  const [active, setActive] = useState(0);

  const cellId = (index: number) => `${baseId}-${index}`;
  const clamp = (index: number) => Math.max(0, Math.min(grid.cells.length - 1, index));

  const handleKeyDown = (e: KeyboardEvent<SVGSVGElement>) => {
    if (!editable) {
      return;
    }
    const col = active % grid.width;
    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        setActive((i) => clamp(i + 1));
        break;
      case 'ArrowLeft':
        e.preventDefault();
        setActive((i) => clamp(i - 1));
        break;
      case 'ArrowDown':
        e.preventDefault();
        setActive((i) => clamp(i + grid.width));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActive((i) => clamp(i - grid.width));
        break;
      case 'Home':
        e.preventDefault();
        setActive(active - col);
        break;
      case 'End':
        e.preventDefault();
        setActive(active - col + grid.width - 1);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        onCellClick(active);
        break;
      default:
        break;
    }
  };

  return (
    <svg
      className={editable ? 'grid-view grid-view-editable' : 'grid-view'}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role={editable ? 'grid' : 'img'}
      aria-label={
        editable
          ? 'Editable land cover grid. Use the arrow keys to move and Enter or Space to set the selected land cover on the highlighted cell.'
          : undefined
      }
      tabIndex={editable ? 0 : undefined}
      aria-activedescendant={editable ? cellId(active) : undefined}
      onKeyDown={editable ? handleKeyDown : undefined}
    >
      {Array.from({ length: grid.height }, (_, row) => (
        <g key={row} role={editable ? 'row' : undefined}>
          {Array.from({ length: grid.width }, (_, col) => {
            const index = row * grid.width + col;
            const isActive = editable && index === active;
            return (
              <rect
                key={index}
                id={editable ? cellId(index) : undefined}
                role={editable ? 'gridcell' : undefined}
                aria-label={editable ? labelOf(index) : undefined}
                x={col * cellSize + gap / 2}
                y={row * cellSize + gap / 2}
                width={cellSize - gap}
                height={cellSize - gap}
                fill={colorOf(index)}
                className={
                  editable
                    ? isActive
                      ? 'grid-cell-editable grid-cell-active'
                      : 'grid-cell-editable'
                    : undefined
                }
                onClick={
                  editable
                    ? () => {
                        setActive(index);
                        onCellClick(index);
                      }
                    : undefined
                }
              >
                <title>{labelOf(index)}</title>
              </rect>
            );
          })}
        </g>
      ))}
    </svg>
  );
}
