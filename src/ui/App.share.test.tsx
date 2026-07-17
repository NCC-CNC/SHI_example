import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Restore-from-URL test. The App reads the hash once at module load, so we set
 * the hash, reset the module registry, and import App fresh inside each test.
 */

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
});

afterEach(() => {
  if (root) {
    act(() => root.unmount());
  }
  container.remove();
  window.location.hash = '';
  vi.resetModules();
});

async function renderFreshApp() {
  vi.resetModules();
  const { App } = await import('./App.tsx');
  act(() => {
    root = createRoot(container);
    root.render(<App />);
  });
}

describe('scenario restore from URL', () => {
  it('seeds the year and edits from the hash', async () => {
    window.location.hash = '#y=2010&e=D3';
    await renderFreshApp();

    const landCover = container.querySelector('.map figcaption')?.textContent;
    expect(landCover).toContain('Land cover (2010)');
    expect(landCover).toContain('edited');
    // An edit is present, so the change-impact panel renders for the same year.
    expect(container.textContent).toContain('Change impact (2010)');
  });

  it('drops an out-of-range shared edit instead of crashing', async () => {
    // Cell 4000 does not exist on the 10x10 grid; it must be ignored.
    window.location.hash = '#e=D4000';
    await renderFreshApp();

    expect(container.querySelector('.map figcaption')?.textContent).not.toContain(
      'edited',
    );
    expect(container.textContent).not.toContain('Change impact');
  });
});
