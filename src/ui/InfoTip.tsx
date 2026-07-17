import { useEffect, useId, useRef, useState, type ReactNode } from 'react';

interface InfoTipProps {
  /** The term this explains, used in the button's accessible label. */
  readonly term: string;
  readonly children: ReactNode;
}

/**
 * A small inline help affordance: a "?" button that toggles a short definition
 * for a term already on screen. Complements the About modal (full reference)
 * and the tour (walkthrough) by explaining a single term in place.
 *
 * Click toggles it; Escape or an outside click closes it. The button carries an
 * accessible label and points at the bubble via aria-describedby while open, so
 * the definition is reachable without a mouse. stopPropagation keeps a click on
 * the button from also toggling a surrounding label's control.
 */
export function InfoTip({ term, children }: InfoTipProps) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    const onPointer = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onPointer);
    };
  }, [open]);

  return (
    <span className="infotip" ref={ref}>
      <button
        type="button"
        className="infotip-btn"
        aria-label={`What is ${term}?`}
        aria-expanded={open}
        aria-describedby={open ? id : undefined}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setOpen((v) => !v);
        }}
      >
        ?
      </button>
      {open && (
        <span role="tooltip" id={id} className="infotip-bubble">
          {children}
        </span>
      )}
    </span>
  );
}
