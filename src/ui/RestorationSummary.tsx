import { formatScore } from './format.ts';
import { InfoTip } from './InfoTip.tsx';

/** One before/after comparison line (overall index or a single species). */
export interface CompareRow {
  readonly label: string;
  readonly before: number | null;
  readonly after: number | null;
}

interface RestorationSummaryProps {
  readonly overall: CompareRow;
  readonly species: readonly CompareRow[];
  readonly year: number;
  readonly editCount: number;
}

/** Signed, one-decimal delta with a direction class, or "n/a" when undefined. */
function Delta({ before, after }: { before: number | null; after: number | null }) {
  if (before === null || after === null) {
    return <span className="delta delta-flat">n/a</span>;
  }
  const diff = after - before;
  const rounded = Math.round(diff * 10) / 10;
  const cls =
    rounded > 0
      ? 'delta delta-up'
      : rounded < 0
        ? 'delta delta-down'
        : 'delta delta-flat';
  const sign = rounded > 0 ? '+' : '';
  return (
    <span className={cls}>
      {sign}
      {rounded.toFixed(1)}
    </span>
  );
}

function CompareLine({ row }: { row: CompareRow }) {
  return (
    <div className="compare-row">
      <span className="compare-label">{row.label}</span>
      <span className="compare-values">
        <span className="compare-before">{formatScore(row.before)}</span>
        <span className="compare-arrow" aria-hidden="true">
          &rarr;
        </span>
        <span className="compare-after">{formatScore(row.after)}</span>
        <Delta before={row.before} after={row.after} />
      </span>
    </div>
  );
}

/**
 * Change impact (before/after): the Species Habitat Index and each species
 * scored on the scenario landscape ("before") versus the same landscape with the
 * user's edits applied ("after"), both indexed to the same baseline. Covers any
 * edit, gain or loss (restoration is one case). Only shown once there is at least
 * one edit.
 */
export function RestorationSummary({
  overall,
  species,
  year,
  editCount,
}: RestorationSummaryProps) {
  return (
    <section className="restoration">
      <div className="restoration-heading">
        <h2>
          Change impact ({year})
          <InfoTip term="change impact">
            Compares the index before and after your edits, both scored against the same
            baseline. Positive deltas are gains, negative are losses.
          </InfoTip>
        </h2>
        <span className="restoration-note">
          {editCount} cell{editCount === 1 ? '' : 's'} edited · before &rarr; after,
          same baseline
        </span>
      </div>
      <div className="compare-overall">
        <CompareLine row={overall} />
      </div>
      <div className="compare-species">
        {species.map((row) => (
          <CompareLine key={row.label} row={row} />
        ))}
      </div>
    </section>
  );
}
