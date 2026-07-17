import type { AggregateResult } from '../engine/index.ts';
import { formatScore } from './format.ts';
import { InfoTip } from './InfoTip.tsx';

interface ShiSummaryProps {
  readonly aggregate: AggregateResult;
  readonly year: number;
  readonly baseline: number;
}

/**
 * The Species Habitat Index: the overall value (simple mean of species scores)
 * plus the per-group means, so the aggregate reads as the sum of its parts.
 */
export function ShiSummary({ aggregate, year, baseline }: ShiSummaryProps) {
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
