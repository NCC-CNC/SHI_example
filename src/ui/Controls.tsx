interface ControlsProps {
  readonly year: number;
  readonly baseline: number;
  readonly minYear: number;
  readonly maxYear: number;
  readonly includeConnectivity: boolean;
  readonly showOverlap: boolean;
  readonly onYearChange: (year: number) => void;
  readonly onBaselineChange: (year: number) => void;
  readonly onIncludeConnectivityChange: (value: boolean) => void;
  readonly onShowOverlapChange: (value: boolean) => void;
}

/** Year slider, baseline selector, and the connectivity / overlap toggles. */
export function Controls({
  year,
  baseline,
  minYear,
  maxYear,
  includeConnectivity,
  showOverlap,
  onYearChange,
  onBaselineChange,
  onIncludeConnectivityChange,
  onShowOverlapChange,
}: ControlsProps) {
  const years: number[] = [];
  for (let y = minYear; y <= maxYear; y++) {
    years.push(y);
  }

  return (
    <div className="controls">
      <label className="control">
        <span className="control-label">
          Year: <strong>{year}</strong>
        </span>
        <input
          type="range"
          min={minYear}
          max={maxYear}
          step={1}
          value={year}
          onChange={(e) => onYearChange(Number(e.target.value))}
        />
      </label>

      <label className="control">
        <span className="control-label">Baseline (= 100)</span>
        <select
          value={baseline}
          onChange={(e) => onBaselineChange(Number(e.target.value))}
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </label>

      <label className="control control-check">
        <input
          type="checkbox"
          checked={includeConnectivity}
          onChange={(e) => onIncludeConnectivityChange(e.target.checked)}
        />
        <span>Include connectivity in the score</span>
      </label>

      <label className="control control-check">
        <input
          type="checkbox"
          checked={showOverlap}
          onChange={(e) => onShowOverlapChange(e.target.checked)}
        />
        <span>Show combined-habitat overlap</span>
      </label>
    </div>
  );
}
