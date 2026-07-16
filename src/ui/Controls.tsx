interface ControlsProps {
  readonly year: number;
  readonly baseline: number;
  readonly minYear: number;
  readonly maxYear: number;
  readonly onYearChange: (year: number) => void;
  readonly onBaselineChange: (year: number) => void;
}

/** Year slider and baseline-year selector. */
export function Controls({
  year,
  baseline,
  minYear,
  maxYear,
  onYearChange,
  onBaselineChange,
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
    </div>
  );
}
