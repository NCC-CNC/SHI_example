import type { Grid, Species, SpeciesScore } from '../engine/index.ts';
import { LAND_COVER_INFO } from '../data/land-cover.ts';
import { formatScore } from './format.ts';
import { GridView } from './GridView.tsx';
import { suitabilityColor } from './suitability-color.ts';

interface SpeciesCardProps {
  readonly species: Species;
  readonly grid: Grid;
  readonly suitability: readonly number[];
  readonly score: SpeciesScore;
  readonly cellSize?: number;
}

/** One species: its AOH (suitability) map with a compact score line beneath. */
export function SpeciesCard({
  species,
  grid,
  suitability,
  score,
  cellSize = 22,
}: SpeciesCardProps) {
  return (
    <figure className="species-card">
      <figcaption>
        {species.name}
        <span className="species-group"> ({species.group})</span>
      </figcaption>
      <GridView
        grid={grid}
        colorOf={(i) => suitabilityColor(suitability[i]!)}
        labelOf={(i) =>
          `${LAND_COVER_INFO[grid.cells[i]!].label}: suitability ${suitability[i]!.toFixed(2)}`
        }
        cellSize={cellSize}
      />
      <div className="species-scores">
        <span className="species-shs">SHS {formatScore(score.shs)}</span>
        <span className="species-sub">
          area {formatScore(score.areaScore)} · conn{' '}
          {formatScore(score.connectivityScore)}
        </span>
      </div>
    </figure>
  );
}
