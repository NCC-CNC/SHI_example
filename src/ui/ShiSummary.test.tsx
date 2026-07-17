import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { AggregateResult } from '../engine/index.ts';
import { ShiSummary } from './ShiSummary.tsx';

const aggregate: AggregateResult = {
  overall: 64.2,
  byGroup: { forest: 62, grassland: 90, wetland: 40 },
};

/**
 * The always-visible edit-impact delta on the index panel: it should appear
 * only when a "before" value is supplied, and read as a signed change so the
 * effect of an edit stays on screen when the full panel is below the map.
 */
describe('ShiSummary edit-impact delta', () => {
  it('shows no delta without a before value', () => {
    const html = renderToStaticMarkup(
      <ShiSummary aggregate={aggregate} year={2025} baseline={2001} />,
    );
    expect(html).not.toContain('before your edits');
  });

  it('shows a signed drop when edits lower the index', () => {
    const html = renderToStaticMarkup(
      <ShiSummary
        aggregate={aggregate}
        year={2025}
        baseline={2001}
        beforeOverall={66.1}
      />,
    );
    expect(html).toContain('-1.9 vs. before your edits');
    expect(html).toContain('delta-down');
  });

  it('shows a signed gain with a plus sign when edits raise the index', () => {
    const html = renderToStaticMarkup(
      <ShiSummary
        aggregate={aggregate}
        year={2025}
        baseline={2001}
        beforeOverall={60}
      />,
    );
    expect(html).toContain('+4.2 vs. before your edits');
    expect(html).toContain('delta-up');
  });
});
