import { TOUR } from './tour.ts';

interface TourPanelProps {
  /** Zero-based index of the current step. */
  readonly step: number;
  readonly onBack: () => void;
  readonly onNext: () => void;
  readonly onClose: () => void;
}

/**
 * The guided-tour bar, pinned to the bottom of the viewport while the tour is
 * running. Shows the current step's text, a progress indicator, and Back /
 * Next / Close controls. The last step's Next button closes the tour.
 */
export function TourPanel({ step, onBack, onNext, onClose }: TourPanelProps) {
  const current = TOUR[step]!;
  const isFirst = step === 0;
  const isLast = step === TOUR.length - 1;

  return (
    <aside className="tour-panel" role="region" aria-label="Guided tour">
      <div className="tour-content">
        <div className="tour-progress">
          <span className="tour-count">
            Step {step + 1} of {TOUR.length}
          </span>
          <ol className="tour-dots" aria-hidden="true">
            {TOUR.map((s, i) => (
              <li
                key={s.title}
                className={i === step ? 'tour-dot tour-dot-active' : 'tour-dot'}
              />
            ))}
          </ol>
        </div>
        <h2 className="tour-title">{current.title}</h2>
        <p className="tour-body">{current.body}</p>
      </div>
      <div className="tour-actions">
        <button type="button" className="tour-btn" onClick={onClose}>
          Close
        </button>
        <button type="button" className="tour-btn" onClick={onBack} disabled={isFirst}>
          Back
        </button>
        <button type="button" className="tour-btn tour-btn-primary" onClick={onNext}>
          {isLast ? 'Done' : 'Next'}
        </button>
      </div>
    </aside>
  );
}
