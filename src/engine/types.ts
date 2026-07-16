import type { LandCoverType } from './constants.ts';

/**
 * A land cover grid. Row-major: cell (x, y) lives at index `y * width + x`.
 * Cells are equal area, so "area" is just a cell count (see the model doc).
 */
export interface Grid {
  readonly width: number;
  readonly height: number;
  readonly cells: readonly LandCoverType[];
}

/** A per-land-cover suitability table for a species; 0..1 for every type. */
export type Crosswalk = Record<LandCoverType, number>;

/** Ecosystem/habitat group a species associates with (forest, wetland, ...). */
export type SpeciesGroup = string;

export interface Species {
  readonly id: string;
  readonly name: string;
  readonly group: SpeciesGroup;
  readonly crosswalk: Crosswalk;
}

export interface ScoreOptions {
  /** Include the connectivity sub-score. Default true. */
  readonly includeConnectivity?: boolean;
  /** Suitability cutoff for the "suitable" mask. Default SUIT_THRESHOLD. */
  readonly threshold?: number;
}

/**
 * A species' scores for one year against a baseline. Any field is `null` when
 * it is undefined (for example, no baseline habitat), so the aggregate can
 * exclude it rather than divide by zero.
 */
export interface SpeciesScore {
  /** Indexed area score (baseline year = 100), or null if undefined. */
  readonly areaScore: number | null;
  /** Indexed connectivity score, or null if excluded or undefined. */
  readonly connectivityScore: number | null;
  /** mean(area, connectivity), or area alone if connectivity is off; null if undefined. */
  readonly shs: number | null;
}
