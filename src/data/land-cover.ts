import type { LandCoverType } from '../engine/index.ts';

/**
 * Display metadata for each land cover type.
 *
 * This is a THEMATIC map palette: colors are conventional/mnemonic (forest
 * green, water blue, crops pale gold, developed grey) rather than an abstract
 * categorical series palette. A 9-class thematic palette cannot separate every
 * pair to the categorical CVD/normal-vision target, and real land cover maps
 * (ESA, NLCD) do not either. Identity is therefore never carried by color
 * alone: an always-on legend and per-cell hover labels are the required
 * secondary encoding. See the dataviz notes in the M2 PR.
 */
export interface LandCoverInfo {
  readonly label: string;
  readonly color: string;
}

export const LAND_COVER_INFO: Record<LandCoverType, LandCoverInfo> = {
  forest: { label: 'Forest', color: '#1b7837' },
  grassland: { label: 'Grassland', color: '#addd8e' },
  shrubs: { label: 'Shrubs', color: '#bf812d' },
  wetland: { label: 'Wetland', color: '#66c2a4' },
  river: { label: 'River', color: '#2b8cbe' },
  lake: { label: 'Lake', color: '#084081' },
  crops: { label: 'Crops', color: '#fee391' },
  developed: { label: 'Developed', color: '#737373' },
  barren: { label: 'Barren', color: '#d9b98c' },
};

/**
 * Single-character codes for authoring land cover grids compactly in scenario
 * data (row strings). One letter per type.
 */
export const LAND_COVER_BY_CHAR: Record<string, LandCoverType> = {
  F: 'forest',
  G: 'grassland',
  S: 'shrubs',
  W: 'wetland',
  R: 'river',
  L: 'lake',
  C: 'crops',
  D: 'developed',
  B: 'barren',
};
