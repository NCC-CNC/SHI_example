import { useMemo, useState } from 'react';
import {
  DEFAULT_BASELINE,
  YEAR_MAX,
  YEAR_MIN,
  speciesHabitatScore,
  suitabilityField,
} from '../engine/index.ts';
import { AMERICAN_MARTEN } from '../data/species.ts';
import { LAND_COVER_INFO } from '../data/land-cover.ts';
import { landCoverForYear } from '../data/scenario.ts';
import { Controls } from './Controls.tsx';
import { GridView } from './GridView.tsx';
import { LandCoverLegend, SuitabilityLegend } from './Legend.tsx';
import { ScorePanel } from './ScorePanel.tsx';
import { suitabilityColor } from './suitability-color.ts';

/**
 * M2: one species (American Marten) over time. Land cover map, the species'
 * Area-of-Habitat (suitability) map, a year slider, a baseline selector, and
 * the habitat scores, all recomputed live from the pure engine.
 */
export function App() {
  const [year, setYear] = useState(YEAR_MAX);
  const [baseline, setBaseline] = useState(DEFAULT_BASELINE);

  const currentGrid = useMemo(() => landCoverForYear(year), [year]);
  const baselineGrid = useMemo(() => landCoverForYear(baseline), [baseline]);

  const suitability = useMemo(
    () => suitabilityField(AMERICAN_MARTEN, currentGrid),
    [currentGrid],
  );

  const score = useMemo(
    () => speciesHabitatScore(AMERICAN_MARTEN, currentGrid, baselineGrid),
    [currentGrid, baselineGrid],
  );

  return (
    <main className="app">
      <header>
        <h1>Species Habitat Index Explorer</h1>
        <p className="tagline">
          How one species&apos; habitat, and its habitat score, change as the landscape
          changes. Drag the year to watch the forest fragment.
        </p>
      </header>

      <Controls
        year={year}
        baseline={baseline}
        minYear={YEAR_MIN}
        maxYear={YEAR_MAX}
        onYearChange={setYear}
        onBaselineChange={setBaseline}
      />

      <div className="maps">
        <figure className="map">
          <figcaption>Land cover ({year})</figcaption>
          <GridView
            grid={currentGrid}
            colorOf={(i) => LAND_COVER_INFO[currentGrid.cells[i]!].color}
            labelOf={(i) => LAND_COVER_INFO[currentGrid.cells[i]!].label}
          />
          <LandCoverLegend />
        </figure>

        <figure className="map">
          <figcaption>
            {AMERICAN_MARTEN.name} habitat ({year})
          </figcaption>
          <GridView
            grid={currentGrid}
            colorOf={(i) => suitabilityColor(suitability[i]!)}
            labelOf={(i) =>
              `${LAND_COVER_INFO[currentGrid.cells[i]!].label}: suitability ${suitability[i]!.toFixed(2)}`
            }
          />
          <SuitabilityLegend />
        </figure>
      </div>

      <ScorePanel
        speciesName={AMERICAN_MARTEN.name}
        score={score}
        year={year}
        baseline={baseline}
      />
    </main>
  );
}
