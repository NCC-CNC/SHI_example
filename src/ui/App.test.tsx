import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { App } from './App.tsx';

/**
 * A server-render smoke test: it exercises the whole component tree once and
 * fails if anything throws during render. Not a substitute for looking at the
 * deployed app, but it catches wiring crashes in CI.
 */
describe('App', () => {
  const html = renderToStaticMarkup(<App />);

  it('renders the title and all three species', () => {
    expect(html).toContain('Species Habitat Index Explorer');
    expect(html).toContain('American Marten');
    expect(html).toContain('American Bittern');
    expect(html).toContain('Bobolink');
  });

  it('renders the land cover map plus one map per species (400 cells)', () => {
    // Overlap is off by default: land cover (100) + 3 species (300).
    const rectCount = (html.match(/<rect/g) ?? []).length;
    expect(rectCount).toBe(400);
  });

  it('shows the aggregated Species Habitat Index', () => {
    expect(html).toContain('Species Habitat Index (2025)');
  });
});
