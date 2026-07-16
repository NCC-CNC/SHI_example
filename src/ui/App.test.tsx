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

  it('renders the title and the species name', () => {
    expect(html).toContain('Species Habitat Index Explorer');
    expect(html).toContain('American Marten');
  });

  it('renders both 10x10 grids (200 cells)', () => {
    const rectCount = (html.match(/<rect/g) ?? []).length;
    expect(rectCount).toBe(200);
  });

  it('shows a habitat score value', () => {
    // Default view is 2025 vs baseline 2001; the panel shows a numeric SHS.
    expect(html).toContain('Habitat score (SHS)');
  });
});
