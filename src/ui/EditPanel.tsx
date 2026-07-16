import { LAND_COVER_TYPES } from '../engine/index.ts';
import type { LandCoverType } from '../engine/index.ts';
import { LAND_COVER_INFO } from '../data/land-cover.ts';

interface EditPanelProps {
  /** The land cover type being painted, or null when the edit tool is off. */
  readonly brush: LandCoverType | null;
  /** How many cells currently differ from the scenario. */
  readonly editCount: number;
  readonly onBrushChange: (brush: LandCoverType | null) => void;
  readonly onReset: () => void;
}

/**
 * The pixel-edit tool. Pick a land cover "brush" then click cells on the land
 * cover map to repaint them; the whole app recomputes live. Painting a cell
 * back to its scenario type clears that edit. Reset reverts every edit.
 */
export function EditPanel({
  brush,
  editCount,
  onBrushChange,
  onReset,
}: EditPanelProps) {
  return (
    <div className="edit-panel">
      <div className="edit-row">
        <span className="control-label">Paint land cover</span>
        <div className="brush-palette" role="group" aria-label="Land cover brush">
          {LAND_COVER_TYPES.map((type) => {
            const selected = brush === type;
            return (
              <button
                key={type}
                type="button"
                className={selected ? 'brush brush-selected' : 'brush'}
                aria-pressed={selected}
                onClick={() => onBrushChange(selected ? null : type)}
              >
                <span
                  className="legend-swatch"
                  style={{ backgroundColor: LAND_COVER_INFO[type].color }}
                />
                {LAND_COVER_INFO[type].label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="edit-actions">
        <span className="edit-status">
          {brush === null
            ? 'Pick a type, then click cells on the land cover map to restore or change habitat.'
            : `Painting ${LAND_COVER_INFO[brush].label}. Click cells on the land cover map. Edits overlay the shown year.`}
        </span>
        <button
          type="button"
          className="edit-reset"
          onClick={onReset}
          disabled={editCount === 0}
        >
          Reset edits{editCount > 0 ? ` (${editCount})` : ''}
        </button>
      </div>
    </div>
  );
}
