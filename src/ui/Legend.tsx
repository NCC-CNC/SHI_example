import { LAND_COVER_INFO } from '../data/land-cover.ts';
import { LAND_COVER_TYPES } from '../engine/index.ts';
import { suitabilityColor } from './suitability-color.ts';

/** Land cover legend: a swatch and label per type (identity, not color-alone). */
export function LandCoverLegend() {
  return (
    <ul className="legend">
      {LAND_COVER_TYPES.map((type) => (
        <li key={type} className="legend-item">
          <span
            className="legend-swatch"
            style={{ backgroundColor: LAND_COVER_INFO[type].color }}
          />
          {LAND_COVER_INFO[type].label}
        </li>
      ))}
    </ul>
  );
}

/** Continuous suitability legend: a gradient bar from 0 to 1. */
export function SuitabilityLegend() {
  const stops = [0, 0.25, 0.5, 0.75, 1]
    .map((v) => `${suitabilityColor(v)} ${v * 100}%`)
    .join(', ');
  return (
    <div className="suitability-legend">
      <span>0</span>
      <span
        className="suitability-bar"
        style={{ background: `linear-gradient(to right, ${stops})` }}
      />
      <span>1</span>
      <span className="suitability-caption">habitat suitability</span>
    </div>
  );
}
