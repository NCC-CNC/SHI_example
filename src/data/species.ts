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

/** Species available in M2 (one; the wetland and grassland species land in M3). */
export const SPECIES: readonly Species[] = [AMERICAN_MARTEN];
