import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { InfoTip } from './InfoTip.tsx';

/**
 * Interaction test for the inline help tooltip: render it into jsdom and check
 * that the bubble is hidden until the button is clicked, and that Escape and an
 * outside click both dismiss it.
 */

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  act(() => {
    root = createRoot(container);
    root.render(<InfoTip term="connectivity">Explanation text.</InfoTip>);
  });
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

function button() {
  return container.querySelector<HTMLButtonElement>('.infotip-btn')!;
}

function bubble() {
  return container.querySelector('[role="tooltip"]');
}

describe('InfoTip', () => {
  it('labels the button with the term', () => {
    expect(button().getAttribute('aria-label')).toBe('What is connectivity?');
  });

  it('is closed until clicked, then shows the explanation', () => {
    expect(bubble()).toBeNull();
    expect(button().getAttribute('aria-expanded')).toBe('false');
    act(() => button().click());
    expect(bubble()?.textContent).toContain('Explanation text.');
    expect(button().getAttribute('aria-expanded')).toBe('true');
  });

  it('closes on Escape', () => {
    act(() => button().click());
    expect(bubble()).not.toBeNull();
    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
    expect(bubble()).toBeNull();
  });

  it('closes on an outside click', () => {
    act(() => button().click());
    expect(bubble()).not.toBeNull();
    act(() => {
      document.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    });
    expect(bubble()).toBeNull();
  });
});
