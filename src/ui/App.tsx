import { useMemo, useState } from 'react';
import {
  DEFAULT_BASELINE,
  YEAR_MAX,
  YEAR_MIN,
  aggregateShi,
  applyCellEdits,
  speciesHabitatScore,
  suitabilityField,
} from '../engine/index.ts';
import type { Grid, LandCoverType, Species } from '../engine/index.ts';
import { SPECIES } from '../data/species.ts';
import { LAND_COVER_INFO } from '../data/land-cover.ts';
import { landCoverForYear } from '../data/scenario.ts';
import { Controls } from './Controls.tsx';
import { EditPanel } from './EditPanel.tsx';
import { GridView } from './GridView.tsx';
import { LandCoverLegend, SuitabilityLegend } from './Legend.tsx';
import { ShiSummary } from './ShiSummary.tsx';
import { SpeciesCard } from './SpeciesCard.tsx';
import { RestorationSummary } from './RestorationSummary.tsx';
import type { CompareRow } from './RestorationSummary.tsx';
import { suitabilityColor } from './suitability-color.ts';

interface SpeciesScored {
  readonly species: Species;
  readonly suitability: readonly number[];
  readonly score: ReturnType<typeof speciesHabitatScore>;
}

/** Score every species on one grid against the baseline, plus the aggregate. */
function scoreSpecies(
  grid: Grid,
  baselineGrid: Grid,
  includeConnectivity: boolean,
): { perSpecies: SpeciesScored[]; aggregate: ReturnType<typeof aggregateShi> } {
  const perSpecies = SPECIES.map((species) => ({
    species,
    suitability: suitabilityField(species, grid),
    score: speciesHabitatScore(species, grid, baselineGrid, { includeConnectivity }),
  }));
  const aggregate = aggregateShi(
    perSpecies.map((p) => ({ group: p.species.group, shs: p.score.shs })),
  );
  return { perSpecies, aggregate };
}

/**
 * M4: three species over time, now editable. Land cover map, one Area-of-Habitat
 * map per species with its score, an optional combined-habitat overlap, and the
 * aggregated Species Habitat Index. Painting cells on the land cover map edits
 * the landscape and recomputes everything live; a restoration panel shows the
 * index before and after the edits. Everything comes from the pure engine.
 */
export function App() {
  const [year, setYear] = useState(YEAR_MAX);
  const [baseline, setBaseline] = useState(DEFAULT_BASELINE);
  const [includeConnectivity, setIncludeConnectivity] = useState(true);
  const [showOverlap, setShowOverlap] = useState(false);
  const [brush, setBrush] = useState<LandCoverType | null>(null);
  const [edits, setEdits] = useState<ReadonlyMap<number, LandCoverType>>(new Map());

  const scenarioGrid = useMemo(() => landCoverForYear(year), [year]);
  const baselineGrid = useMemo(() => landCoverForYear(baseline), [baseline]);
  const editedGrid = useMemo(
    () => applyCellEdits(scenarioGrid, edits),
    [scenarioGrid, edits],
  );

  // "After" scores drive every map and readout; they reflect the current edits.
  const after = useMemo(
    () => scoreSpecies(editedGrid, baselineGrid, includeConnectivity),
    [editedGrid, baselineGrid, includeConnectivity],
  );
  const { perSpecies, aggregate } = after;

  // "Before" (scenario, no edits) is only needed for the restoration comparison.
  const hasEdits = edits.size > 0;
  const before = useMemo(
    () =>
      hasEdits ? scoreSpecies(scenarioGrid, baselineGrid, includeConnectivity) : null,
    [hasEdits, scenarioGrid, baselineGrid, includeConnectivity],
  );

  // Combined-habitat overlap: mean suitability across species per cell.
  const overlap = useMemo(() => {
    const cellCount = editedGrid.cells.length;
    const combined = new Array<number>(cellCount).fill(0);
    for (const { suitability } of perSpecies) {
      for (let i = 0; i < cellCount; i++) {
        combined[i]! += suitability[i]!;
      }
    }
    return combined.map((sum) => sum / perSpecies.length);
  }, [perSpecies, editedGrid]);

  // Paint a cell with the current brush; painting back to the scenario type
  // clears the edit so the edit count stays meaningful.
  const paintCell = (index: number) => {
    if (brush === null) {
      return;
    }
    setEdits((prev) => {
      const next = new Map(prev);
      if (scenarioGrid.cells[index] === brush) {
        next.delete(index);
      } else {
        next.set(index, brush);
      }
      return next;
    });
  };

  const overallRow: CompareRow = {
    label: 'Species Habitat Index',
    before: before?.aggregate.overall ?? null,
    after: aggregate.overall,
  };
  const speciesRows: CompareRow[] = perSpecies.map(({ species, score }, i) => ({
    label: species.name,
    before: before?.perSpecies[i]?.score.shs ?? null,
    after: score.shs,
  }));

  return (
    <main className="app">
      <header>
        <h1>Species Habitat Index Explorer</h1>
        <p className="tagline">
          Three species, each tied to a different habitat. Drag the year to watch the
          landscape change, paint the land cover map to test a restoration, and see how
          each species&apos; habitat score, and the overall index, respond.
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

      <EditPanel
        brush={brush}
        editCount={edits.size}
        onBrushChange={setBrush}
        onReset={() => setEdits(new Map())}
      />

      <ShiSummary aggregate={aggregate} year={year} baseline={baseline} />

      <div className="maps">
        <figure className="map">
          <figcaption>
            Land cover ({year}){hasEdits ? ' · edited' : ''}
          </figcaption>
          <GridView
            grid={editedGrid}
            colorOf={(i) => LAND_COVER_INFO[editedGrid.cells[i]!].color}
            labelOf={(i) =>
              `${LAND_COVER_INFO[editedGrid.cells[i]!].label}${
                edits.has(i) ? ' (edited)' : ''
              }`
            }
            onCellClick={brush === null ? undefined : paintCell}
          />
          <LandCoverLegend />
        </figure>

        {showOverlap && (
          <figure className="map">
            <figcaption>Combined habitat ({year})</figcaption>
            <GridView
              grid={editedGrid}
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
              grid={editedGrid}
              suitability={suitability}
              score={score}
            />
          ))}
        </div>
      </div>

      {hasEdits && (
        <RestorationSummary
          overall={overallRow}
          species={speciesRows}
          year={year}
          editCount={edits.size}
        />
      )}
    </main>
  );
}
