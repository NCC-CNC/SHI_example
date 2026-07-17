import { useEffect, useRef } from 'react';

interface AboutModalProps {
  readonly onClose: () => void;
}

/**
 * A modal "About" panel: a standing reference for what the app is, how to read
 * it, and where the SHI method comes from. Complements the guided tour (a
 * one-time walkthrough) by staying reachable at any time, which matters for a
 * visitor who lands mid-scenario via a shared link.
 *
 * Custom overlay rather than the native <dialog> so it renders predictably
 * under jsdom in the Vitest suite. Escape closes it, a backdrop click closes
 * it, and focus moves to the close button on open.
 */
export function AboutModal({ onClose }: AboutModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="about-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <h2 id="about-title">About this app</h2>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close"
            ref={closeRef}
          >
            &times;
          </button>
        </div>

        <div className="modal-body">
          <p>
            This is an interactive teaching tool for the{' '}
            <a
              href="https://mapoflife.ai/resources/indicators/shi"
              target="_blank"
              rel="noreferrer"
            >
              Species Habitat Index (SHI)
            </a>{' '}
            from Map of Life. It shows how the index is built up: from land cover, to
            each species&apos; Area of Habitat, to a per-species habitat score, to an
            aggregated index, and how all of that responds to change over time and to
            your edits.
          </p>

          <h3>How to read it</h3>
          <ul>
            <li>
              <strong>Land cover map:</strong> the synthetic landscape for the selected
              year. Drag the year slider to watch it change from 1993 to 2025.
            </li>
            <li>
              <strong>Habitat by species:</strong> the land cover recolored by how
              suitable each cell is for that species. Darker means better habitat.
            </li>
            <li>
              <strong>Species Habitat Index:</strong> each score is indexed to 100 at
              the baseline year, so it reads as a percentage of baseline habitat. The
              overall index is the mean of the per-species scores.
            </li>
            <li>
              <strong>Set land cover:</strong> pick a cover type and click cells to test
              a scenario. The change-impact panel then compares the index before and
              after your edits.
            </li>
          </ul>

          <h3>Important</h3>
          <p className="modal-caveat">
            The data is synthetic and the landscape is a small abstract grid. The SHI
            math mirrors the published method, but this is a teaching and exploration
            tool, not a real biodiversity indicator or a source of authoritative species
            or habitat data.
          </p>

          <p className="modal-links">
            <a
              href="https://github.com/NCC-CNC/SHI_example"
              target="_blank"
              rel="noreferrer"
            >
              Source on GitHub
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
