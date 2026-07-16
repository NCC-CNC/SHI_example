import { SUIT_THRESHOLD } from './constants.ts';
import { sameDimensions } from './grid.ts';
import { areaScore } from './area.ts';
import { connectivityScore, gisfrag } from './connectivity.ts';
import { suitabilityField, suitableMask, summedSuitability } from './suitability.ts';
import type { Grid, ScoreOptions, Species, SpeciesScore } from './types.ts';

/**
 * The Species Habitat Score (SHS) for one species in a given year, relative to
 * a baseline year. SHS is the mean of the area and connectivity scores, or the
 * area score alone when connectivity is turned off.
 *
 * When connectivity is requested but undefined (for example, no suitable cells
 * at baseline), SHS is null so the species is excluded from the aggregate.
 */
export function speciesHabitatScore(
  species: Species,
  currentGrid: Grid,
  baselineGrid: Grid,
  options: ScoreOptions = {},
): SpeciesScore {
  if (!sameDimensions(currentGrid, baselineGrid)) {
    throw new Error('speciesHabitatScore: current and baseline grids differ in size');
  }
  const includeConnectivity = options.includeConnectivity ?? true;
  const threshold = options.threshold ?? SUIT_THRESHOLD;

  const currentField = suitabilityField(species, currentGrid);
  const baselineField = suitabilityField(species, baselineGrid);

  const area = areaScore(
    summedSuitability(currentField),
    summedSuitability(baselineField),
  );

  let connectivity: number | null = null;
  if (includeConnectivity) {
    const currentGisfrag = gisfrag(
      suitableMask(currentField, threshold),
      currentGrid.width,
      currentGrid.height,
    );
    const baselineGisfrag = gisfrag(
      suitableMask(baselineField, threshold),
      baselineGrid.width,
      baselineGrid.height,
    );
    connectivity = connectivityScore(currentGisfrag, baselineGisfrag);
  }

  let shs: number | null;
  if (area === null) {
    shs = null;
  } else if (!includeConnectivity) {
    shs = area;
  } else if (connectivity === null) {
    shs = null;
  } else {
    shs = (area + connectivity) / 2;
  }

  return { areaScore: area, connectivityScore: connectivity, shs };
}
