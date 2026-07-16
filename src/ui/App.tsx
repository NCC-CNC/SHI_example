import { useMemo, useState } from 'react';
import {
  DEFAULT_BASELINE,
  YEAR_MAX,
  YEAR_MIN,
  aggregateShi,
  speciesHabitatScore,
  suitabilityField,
} from '../engine/index.ts';
import { SPECIES } from '../data/species.ts';
import { LAND_COVER_INFO } from '../data/land-cover.ts';
import { landCoverForYear } from '../data/scenario.ts';
import { Controls } from './Controls.tsx';
import { GridView } from './GridView.tsx';
import { LandCoverLegend, SuitabilityLegend } from './Legend.tsx';
import { ShiSummary } from './ShiSummary.tsx';
import { SpeciesCard } from './SpeciesCard.tsx';
import { suitabilityColor } from './suitability-color.ts';

/**
 * M3: three species over time. Land cover map, one Area-of-Habitat map per
 * species with its score, an optional combined-habitat overlap, and the
 * aggregated Species Habitat Index (overall and by group). Everything is
 * recomputed live from the pure engine.
 */
export function App() {
  const [year, setYear] = useState(YEAR_MAX);
  const [baseline, setBaseline] = useState(DEFAULT_BASELINE);
  const [includeConnectivity, setIncludeConnectivity] = useState(true);
  const [showOverlap, setShowOverlap] = useState(false);

  const currentGrid = useMemo(() => landCoverForYear(year), [year]);
  const baselineGrid = useMemo(() => landCoverForYear(baseline), [baseline]);

  const perSpecies = useMemo(
    () =>
      SPECIES.map((species) => ({
        species,
        suitability: suitabilityField(species, currentGrid),
        score: speciesHabitatScore(species, currentGrid, baselineGrid, {
          includeConnectivity,
        }),
      })),
    [currentGrid, baselineGrid, includeConnectivity],
  );

  const aggregate = useMemo(
    () =>
      aggregateShi(
        perSpecies.map((p) => ({ group: p.species.group, shs: p.score.shs })),
      ),
    [perSpecies],
  );

  // Combined-habitat overlap: mean suitability across species per cell.
  const overlap = useMemo(() => {
    const cellCount = currentGrid.cells.length;
    const combined = new Array<number>(cellCount).fill(0);
    for (const { suitability } of perSpecies) {
      for (let i = 0; i < cellCount; i++) {
        combined[i]! += suitability[i]!;
      }
    }
    return combined.map((sum) => sum / perSpecies.length);
  }, [perSpecies, currentGrid]);

  return (
    <main className="app">
      <header>
        <h1>Species Habitat Index Explorer</h1>
        <p className="tagline">
          Three species, each tied to a different habitat. Drag the year to watch the
          landscape change, and see how each species&apos; habitat score, and the
          overall index, respond.
        </p>
      </header>

      <Controls
        year={year}
        baseline={baseline}
        minYear={YEAR_MIN}
        maxYear={YEAR_MAX}
        includeConnectivity={includeConnectivity}
        showOverlap={showOverlap}
        onYearChange={setYear}
        onBaselineChange={setBaseline}
        onIncludeConnectivityChange={setIncludeConnectivity}
        onShowOverlapChange={setShowOverlap}
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

        {showOverlap && (
          <figure className="map">
            <figcaption>Combined habitat ({year})</figcaption>
            <GridView
              grid={currentGrid}
              colorOf={(i) => suitabilityColor(overlap[i]!)}
              labelOf={(i) => `combined suitability (mean): ${overlap[i]!.toFixed(2)}`}
            />
            <p className="overlap-note">
              Mean habitat suitability across all species: where habitat concentrates
              spatially. This is a map overlay, not the index (which is the mean of the
              indexed scores below).
            </p>
          </figure>
        )}
      </div>

      <div className="species-section">
        <div className="species-heading">
          <h2>Habitat by species</h2>
          <SuitabilityLegend />
        </div>
        <div className="species-grid">
          {perSpecies.map(({ species, suitability, score }) => (
            <SpeciesCard
              key={species.id}
              species={species}
              grid={currentGrid}
              suitability={suitability}
              score={score}
            />
          ))}
        </div>
      </div>

      <ShiSummary aggregate={aggregate} year={year} baseline={baseline} />
    </main>
  );
}
