import { useEffect, useMemo, useRef, useState } from 'react';
import {
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
import { ShareLink } from './ShareLink.tsx';
import {
  decodeState,
  encodeState,
  sanitizeEdits,
  SHARE_DEFAULTS,
} from './share-state.ts';
import { TourPanel } from './TourPanel.tsx';
import { AboutModal } from './AboutModal.tsx';
import { InfoTip } from './InfoTip.tsx';
import { TOUR } from './tour.ts';
import type { TourRegion } from './tour.ts';

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

/** Cell count of the synthetic grid, used to drop out-of-range shared edits. */
const CELL_COUNT = landCoverForYear(YEAR_MAX).cells.length;

/** Read the URL hash (without '#'), guarded for non-browser (SSR/test) render. */
function readHash(): string {
  if (typeof window === 'undefined') {
    return '';
  }
  return window.location.hash.replace(/^#/, '');
}

// Scenario state decoded from the URL once at load, merged over the defaults.
// Shared edits are clamped to the current grid so a stale link cannot crash the
// engine (applyCellEdits throws on an out-of-range index).
const INITIAL = (() => {
  const parsed = decodeState(readHash());
  return {
    ...SHARE_DEFAULTS,
    ...parsed,
    edits: sanitizeEdits(parsed.edits ?? SHARE_DEFAULTS.edits, CELL_COUNT),
  };
})();

/**
 * M5: the full explorer plus a guided concept walkthrough. Land cover map, one
 * Area-of-Habitat map per species with its score, an optional combined-habitat
 * overlap, the aggregated Species Habitat Index, live land cover editing, and a
 * before/after change-impact panel. The guided tour drives this same app: each
 * step sets the year, focus, overlap, and demo edits so a new user watches the
 * real engine build the index up and respond to change.
 */
export function App() {
  const [year, setYear] = useState(INITIAL.year);
  const [baseline, setBaseline] = useState(INITIAL.baseline);
  const [includeConnectivity, setIncludeConnectivity] = useState(
    INITIAL.includeConnectivity,
  );
  const [showOverlap, setShowOverlap] = useState(INITIAL.showOverlap);
  const [brush, setBrush] = useState<LandCoverType | null>(null);
  const [edits, setEdits] = useState<ReadonlyMap<number, LandCoverType>>(INITIAL.edits);
  const [focusSpecies, setFocusSpecies] = useState<string | null>(null);
  const [tourStep, setTourStep] = useState<number | null>(null);
  const [aboutOpen, setAboutOpen] = useState(false);

  const regionRefs = useRef<Partial<Record<TourRegion, HTMLElement | null>>>({});
  const setRegionRef = (region: TourRegion) => (el: HTMLElement | null) => {
    regionRefs.current[region] = el;
  };
  const activeRegion = tourStep === null ? null : TOUR[tourStep]!.region;

  // Entering or advancing a tour step applies that step's prescribed state and
  // scrolls its region into view. Closing the tour clears the demo focus/edits.
  // A ref tracks the previous step so the clear only fires on an actual close
  // (step -> null), not on the initial mount, which would wipe URL-seeded edits.
  const prevTourStep = useRef<number | null>(tourStep);
  useEffect(() => {
    const closing = tourStep === null && prevTourStep.current !== null;
    prevTourStep.current = tourStep;
    if (tourStep === null) {
      if (closing) {
        setFocusSpecies(null);
        setEdits(new Map());
      }
      return;
    }
    const { state, region } = TOUR[tourStep]!;
    setYear(state.year);
    setShowOverlap(state.showOverlap);
    setIncludeConnectivity(state.includeConnectivity);
    setFocusSpecies(state.focusSpecies);
    setEdits(state.edits);
    // Defer the scroll a frame so newly shown regions (e.g. restoration) exist.
    requestAnimationFrame(() => {
      regionRefs.current[region]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    });
  }, [tourStep]);

  // Keep the URL in sync with the scenario so it is shareable and survives a
  // reload. Suspended during the tour, whose steps drive transient demo state we
  // do not want to persist. replaceState avoids new history entries and scroll.
  useEffect(() => {
    if (tourStep !== null || typeof window === 'undefined') {
      return;
    }
    const query = encodeState({
      year,
      baseline,
      includeConnectivity,
      showOverlap,
      edits,
    });
    const { pathname, search } = window.location;
    const url = query ? `${pathname}${search}#${query}` : `${pathname}${search}`;
    window.history.replaceState(null, '', url);
  }, [year, baseline, includeConnectivity, showOverlap, edits, tourStep]);

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

  // During the tour's single-species steps, show just that species' card; the
  // index and overlap still use all three species.
  const displayedSpecies = focusSpecies
    ? perSpecies.filter((p) => p.species.id === focusSpecies)
    : perSpecies;

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

  const regionClass = (region: TourRegion, base: string) =>
    activeRegion === region ? `${base} tour-highlight` : base;

  const closeTour = () => setTourStep(null);
  const backStep = () => setTourStep((s) => (s === null ? s : Math.max(0, s - 1)));
  const nextStep = () =>
    setTourStep((s) => (s === null || s >= TOUR.length - 1 ? null : s + 1));

  return (
    <main className={tourStep === null ? 'app' : 'app tour-active'}>
      <header>
        <div className="title-row">
          <h1>Species Habitat Index Explorer</h1>
          {tourStep === null && (
            <div className="header-actions">
              <button
                type="button"
                className="about-start"
                onClick={() => setAboutOpen(true)}
              >
                About
              </button>
              <button
                type="button"
                className="tour-start"
                onClick={() => setTourStep(0)}
              >
                Start guided tour
              </button>
            </div>
          )}
        </div>
        <p className="tagline">
          Three species, each tied to a different habitat. Drag the year to watch the
          landscape change, change any cell&apos;s land cover to test a scenario, and
          see how each species&apos; habitat score, and the overall index, respond.
        </p>
      </header>

      <div className="layout">
        <aside className="sidebar">
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

          <div
            ref={setRegionRef('edit')}
            className={regionClass('edit', 'tour-region')}
          >
            <EditPanel
              brush={brush}
              editCount={edits.size}
              onBrushChange={setBrush}
              onReset={() => setEdits(new Map())}
            />
          </div>

          <ShareLink />
        </aside>

        <div className="results">
          <div
            ref={setRegionRef('index')}
            className={regionClass('index', 'tour-region')}
          >
            <ShiSummary aggregate={aggregate} year={year} baseline={baseline} />
          </div>

          {hasEdits && (
            <div
              ref={setRegionRef('restoration')}
              className={regionClass('restoration', 'tour-region')}
            >
              <RestorationSummary
                overall={overallRow}
                species={speciesRows}
                year={year}
                editCount={edits.size}
              />
            </div>
          )}

          <div ref={setRegionRef('maps')} className={regionClass('maps', 'maps')}>
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
                  labelOf={(i) =>
                    `combined suitability (mean): ${overlap[i]!.toFixed(2)}`
                  }
                />
                <p className="overlap-note">
                  Mean habitat suitability across all species: where habitat
                  concentrates spatially. This is a map overlay, not the index (which is
                  the mean of the indexed scores below).
                </p>
              </figure>
            )}
          </div>

          <div
            ref={setRegionRef('species')}
            className={regionClass('species', 'species-section')}
          >
            <div className="species-heading">
              <h2>
                Habitat by species
                <InfoTip term="Area of Habitat">
                  Each map recolors the land cover by how suitable every cell is for
                  that one species. The suitable cells make up its Area of Habitat;
                  darker means better habitat.
                </InfoTip>
              </h2>
              <SuitabilityLegend />
            </div>
            <div className="species-grid">
              {displayedSpecies.map(({ species, suitability, score }) => (
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
        </div>
      </div>

      <footer className="app-footer">
        <p>
          A teaching tool for the{' '}
          <a
            href="https://mapoflife.ai/resources/indicators/shi"
            target="_blank"
            rel="noreferrer"
          >
            Species Habitat Index
          </a>{' '}
          from Map of Life. Synthetic data, not a real biodiversity indicator.
        </p>
        <p>
          <a
            href="https://github.com/NCC-CNC/SHI_example"
            target="_blank"
            rel="noreferrer"
          >
            Source on GitHub
          </a>{' '}
          · Licensed under GPL-3.0
        </p>
      </footer>

      {tourStep !== null && (
        <TourPanel
          step={tourStep}
          onBack={backStep}
          onNext={nextStep}
          onClose={closeTour}
        />
      )}

      {aboutOpen && <AboutModal onClose={() => setAboutOpen(false)} />}
    </main>
  );
}
