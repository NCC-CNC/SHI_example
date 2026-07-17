import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from './App.tsx';

/**
 * Interaction test for the About modal: render the real App into jsdom, open
 * the modal from the header, and confirm it opens and closes. jsdom lacks
 * scrollIntoView / rAF, so we stub them as the other App tests do.
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
  act(() => button.click());
}

function dialog() {
  return container.querySelector('[role="dialog"]');
}

describe('About modal', () => {
  it('is closed until the About button is clicked', () => {
    expect(dialog()).toBeNull();
    click('About');
    expect(dialog()).not.toBeNull();
    expect(dialog()?.textContent).toContain('Species Habitat Index');
  });

  it('closes on the close button', () => {
    click('About');
    expect(dialog()).not.toBeNull();
    const close = container.querySelector<HTMLButtonElement>('.modal-close');
    act(() => close?.click());
    expect(dialog()).toBeNull();
  });

  it('closes on Escape', () => {
    click('About');
    expect(dialog()).not.toBeNull();
    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
    expect(dialog()).toBeNull();
  });
});
