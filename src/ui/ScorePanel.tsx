import type { SpeciesScore } from '../engine/index.ts';

interface ScorePanelProps {
  readonly speciesName: string;
  readonly score: SpeciesScore;
  readonly year: number;
  readonly baseline: number;
}

function format(value: number | null): string {
  return value === null ? 'n/a' : value.toFixed(1);
}

/** Shows a species' area, connectivity, and habitat scores for the current year. */
export function ScorePanel({ speciesName, score, year, baseline }: ScorePanelProps) {
  return (
    <section className="score-panel">
      <h2>
        {speciesName} in {year}
      </h2>
      <p className="score-note">Baseline year {baseline} = 100</p>
      <dl className="scores">
        <div className="score">
          <dt>Area</dt>
          <dd>{format(score.areaScore)}</dd>
        </div>
        <div className="score">
          <dt>Connectivity</dt>
          <dd>{format(score.connectivityScore)}</dd>
        </div>
        <div className="score score-total">
          <dt>Habitat score (SHS)</dt>
          <dd>{format(score.shs)}</dd>
        </div>
      </dl>
    </section>
  );
}
