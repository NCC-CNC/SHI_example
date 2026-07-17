import type { AggregateResult } from '../engine/index.ts';
import { formatScore } from './format.ts';
import { InfoTip } from './InfoTip.tsx';

interface ShiSummaryProps {
  readonly aggregate: AggregateResult;
  readonly year: number;
  readonly baseline: number;
  /**
   * The overall index before the current edits, or null when there are none.
   * When set, an always-visible delta is shown so the impact of an edit stays
   * on screen even when the full Change impact panel is scrolled below the map.
   */
  readonly beforeOverall?: number | null;
}

/** Signed, one-decimal edit impact with a direction class (green up, red down). */
function ImpactDelta({ before, after }: { before: number; after: number }) {
  const rounded = Math.round((after - before) * 10) / 10;
  const cls = rounded > 0 ? 'delta-up' : rounded < 0 ? 'delta-down' : 'delta-flat';
  const sign = rounded > 0 ? '+' : '';
  return (
    <span className={`shi-impact ${cls}`}>
      {sign}
      {rounded.toFixed(1)} vs. before your edits
    </span>
  );
}

/**
 * The Species Habitat Index: the overall value (simple mean of species scores)
 * plus the per-group means, so the aggregate reads as the sum of its parts.
 */
export function ShiSummary({
  aggregate,
  year,
  baseline,
  beforeOverall = null,
}: ShiSummaryProps) {
  const groups = Object.keys(aggregate.byGroup).sort();

  return (
    <section className="shi-summary">
      <div className="shi-overall">
        <span className="shi-overall-label">
          Species Habitat Index ({year})
          <InfoTip term="the Species Habitat Index">
            The overall index is the simple mean of the per-species scores, each indexed
            to 100 at the baseline year. The per-group values below break it down by
            habitat.
          </InfoTip>
        </span>
        <span className="shi-overall-value">{formatScore(aggregate.overall)}</span>
        {beforeOverall !== null && aggregate.overall !== null && (
          <ImpactDelta before={beforeOverall} after={aggregate.overall} />
        )}
        <span className="shi-note">
          simple mean of species scores · baseline {baseline} = 100
        </span>
      </div>
      <dl className="shi-groups">
        {groups.map((group) => (
          <div key={group} className="shi-group">
            <dt>{group}</dt>
            <dd>{formatScore(aggregate.byGroup[group] ?? null)}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
