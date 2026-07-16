import { LAND_COVER_TYPES } from '../engine/index.ts';
import type { Crosswalk, LandCoverType, Species } from '../engine/index.ts';

/**
 * Build a complete crosswalk from a partial one; any land cover type not listed
 * gets suitability 0. Keeps the species data readable (list only what matters).
 */
function crosswalk(overrides: Partial<Record<LandCoverType, number>>): Crosswalk {
  const table = {} as Crosswalk;
  for (const type of LAND_COVER_TYPES) {
    table[type] = overrides[type] ?? 0;
  }
  return table;
}

/**
 * American Marten: a boreal/mixedwood forest specialist that needs large,
 * contiguous mature forest and is sensitive to fragmentation. Suitability
 * values are illustrative (see docs/design/02_example_scenarios.md).
 */
export const AMERICAN_MARTEN: Species = {
  id: 'american-marten',
  name: 'American Marten',
  group: 'forest',
  crosswalk: crosswalk({
    forest: 1,
    shrubs: 0.4,
    wetland: 0.2,
    river: 0.1,
    grassland: 0.05,
  }),
};

/**
 * American Bittern: a secretive marsh bird tied to emergent wetland vegetation.
 * Draining or converting wetland collapses its habitat quickly.
 */
export const AMERICAN_BITTERN: Species = {
  id: 'american-bittern',
  name: 'American Bittern',
  group: 'wetland',
  crosswalk: crosswalk({
    wetland: 1,
    river: 0.6,
    lake: 0.5,
    shrubs: 0.3,
    grassland: 0.2,
    forest: 0.15,
    crops: 0.1,
  }),
};

/**
 * Bobolink: a grassland songbird (a Canadian species at risk) that breeds in
 * native grassland but also uses hayfields and pasture, so its partial use of
 * crops makes grassland-to-crop conversion a gentle decline.
 */
export const BOBOLINK: Species = {
  id: 'bobolink',
  name: 'Bobolink',
  group: 'grassland',
  crosswalk: crosswalk({
    grassland: 1,
    crops: 0.5,
    shrubs: 0.4,
    wetland: 0.2,
    barren: 0.15,
    forest: 0.05,
    river: 0.05,
  }),
};

/** The three example species, grouped by the ecosystem they associate with. */
export const SPECIES: readonly Species[] = [
  AMERICAN_MARTEN,
  AMERICAN_BITTERN,
  BOBOLINK,
];
