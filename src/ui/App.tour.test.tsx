import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from './App.tsx';

/**
 * Interaction test for the guided tour: it renders the real App into jsdom and
 * clicks through the steps, checking that the tour drives focus, the overlap,
 * and the restoration panel. jsdom lacks scrollIntoView / rAF, so we stub them.
 */

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn();
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
    cb(0);
    return 0;
  });
  container = document.createElement('div');
  document.body.appendChild(container);
  act(() => {
    root = createRoot(container);
    root.render(<App />);
  });
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});

function click(text: string) {
  const button = [...container.querySelectorAll('button')].find(
    (b) => b.textContent?.trim() === text,
  );
  if (!button) {
    throw new Error(`no button labelled "${text}"`);
  }
  act(() => {
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
}

const speciesShown = () =>
  [...container.querySelectorAll('.species-card figcaption')].map((el) =>
    el.textContent?.split('(')[0]?.trim(),
  );

describe('guided tour', () => {
  it('is off until started, then steps through and finishes', () => {
    expect(container.querySelector('.tour-panel')).toBeNull();
    expect(speciesShown()).toEqual(['American Marten', 'American Bittern', 'Bobolink']);

    // Step 1: focuses the American Marten alone.
    click('Start guided tour');
    expect(container.querySelector('.tour-panel')?.textContent).toContain(
      '1. Area of habitat',
    );
    expect(speciesShown()).toEqual(['American Marten']);

    // Step 3: all three species are back.
    click('Next');
    click('Next');
    expect(container.querySelector('.tour-panel')?.textContent).toContain(
      '3. Add species',
    );
    expect(speciesShown()).toEqual(['American Marten', 'American Bittern', 'Bobolink']);

    // Step 4: overlap layer turns on.
    click('Next');
    expect(container.textContent).toContain('Combined habitat');

    // Step 7: restoration panel appears and the last button says Done.
    click('Next');
    click('Next');
    click('Next');
    expect(container.querySelector('.tour-panel')?.textContent).toContain(
      '7. Restoration',
    );
    expect(container.querySelector('.restoration')).not.toBeNull();

    // Done closes the tour and clears the demo edits.
    click('Done');
    expect(container.querySelector('.tour-panel')).toBeNull();
    expect(container.querySelector('.restoration')).toBeNull();
    expect(speciesShown()).toEqual(['American Marten', 'American Bittern', 'Bobolink']);
  });
});
