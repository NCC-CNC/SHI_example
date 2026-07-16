/**
 * Settled constants for the SHI model. See docs/design/01_shi_model.md.
 * The engine is pure and framework-free by design; nothing here imports React.
 */

/** The land cover types the app models (simplified crosswalk target for ESA). */
export const LAND_COVER_TYPES = [
  'forest',
  'grassland',
  'wetland',
  'river',
  'lake',
  'developed',
  'barren',
  'shrubs',
  'crops',
] as const;

export type LandCoverType = (typeof LAND_COVER_TYPES)[number];

/** Inclusive year range of the synthetic land cover time series. */
export const YEAR_MIN = 1993;
export const YEAR_MAX = 2025;

/** Default baseline year (the year normalized to SHS = 100). User-selectable. */
export const DEFAULT_BASELINE = 2001;

/**
 * Suitability cutoff that turns the continuous 0..1 suitability grid into a
 * binary "suitable" mask for the connectivity (GISfrag) calculation.
 */
export const SUIT_THRESHOLD = 0.5;
