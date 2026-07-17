import type { LandCoverType } from '../engine/index.ts';

/**
 * The guided concept walkthrough (M5). Each step both explains one idea and
 * puts the app into the state that makes the idea visible: the year, which
 * species are shown, the overlap toggle, and any demo edits. The engine still
 * computes everything live, so the tour drives the real app rather than a set
 * of canned screenshots. See docs/design/02_example_scenarios.md.
 */

/** Which region the step is about; the app highlights and scrolls to it. */
export type TourRegion = 'maps' | 'species' | 'index' | 'edit' | 'restoration';

export interface TourStepState {
  readonly year: number;
  /** A species id to show alone, or null to show all three. */
  readonly focusSpecies: string | null;
  readonly showOverlap: boolean;
  readonly includeConnectivity: boolean;
  /** Demo edits applied for this step (empty for most steps). */
  readonly edits: ReadonlyMap<number, LandCoverType>;
}

export interface TourStep {
  readonly title: string;
  readonly body: string;
  readonly region: TourRegion;
  readonly state: TourStepState;
}

const NO_EDITS: ReadonlyMap<number, LandCoverType> = new Map();

// Demo edits use flat cell indices (y * 10 + x) against the 2025 grid.
// Step 6: one intact forest cell in the top-left corner -> barren.
const PIXEL_EDIT: ReadonlyMap<number, LandCoverType> = new Map([[0, 'barren']]);
// Step 7: the developed corridor (column 3, rows 0-5) that split the forest,
// restored to forest so the two fragments reconnect.
const RESTORE_CORRIDOR: ReadonlyMap<number, LandCoverType> = new Map([
  [3, 'forest'],
  [13, 'forest'],
  [23, 'forest'],
  [33, 'forest'],
  [43, 'forest'],
  [53, 'forest'],
]);

const MARTEN = 'american-marten';

export const TOUR: readonly TourStep[] = [
  {
    title: '1. Area of habitat',
    body: 'Start with land cover, then recolor it by how suitable each cell is for one species, the American Marten (a forest specialist). That suitability map is its Area of Habitat: darker means better habitat. At the 2001 baseline year the score reads 100, the reference every later year is measured against.',
    region: 'species',
    state: {
      year: 2001,
      focusSpecies: MARTEN,
      showOverlap: false,
      includeConnectivity: true,
      edits: NO_EDITS,
    },
  },
  {
    title: '2. Add time',
    body: "Move to 2025. A corridor of development has cut through the forest and split it in two. The Marten's habitat shrinks (area falls) and, more sharply, breaks apart (connectivity falls). Both are indexed to the 2001 baseline = 100, so the drop is easy to read.",
    region: 'species',
    state: {
      year: 2025,
      focusSpecies: MARTEN,
      showOverlap: false,
      includeConnectivity: true,
      edits: NO_EDITS,
    },
  },
  {
    title: '3. Add species',
    body: 'Bring in two more species: the American Bittern (wetland) and the Bobolink (grassland). Each reads the same landscape differently, so their habitat maps and scores move in different directions as the land changes.',
    region: 'species',
    state: {
      year: 2025,
      focusSpecies: null,
      showOverlap: false,
      includeConnectivity: true,
      edits: NO_EDITS,
    },
  },
  {
    title: '4. Overlap and richness',
    body: 'Turn on the combined-habitat layer. It overlays the three habitat maps to show where suitable habitat concentrates spatially. This is a map view, not the index: the index is the average of the per-species scores, not a spatial overlap.',
    region: 'maps',
    state: {
      year: 2025,
      focusSpecies: null,
      showOverlap: true,
      includeConnectivity: true,
      edits: NO_EDITS,
    },
  },
  {
    title: '5. Stack into the index',
    body: 'Each species has a habitat score (SHS). Average the species in a group for a group score, and average across all species for the overall Species Habitat Index. The headline number at the top is that mean.',
    region: 'index',
    state: {
      year: 2025,
      focusSpecies: null,
      showOverlap: false,
      includeConnectivity: true,
      edits: NO_EDITS,
    },
  },
  {
    title: '6. Edit a pixel',
    body: 'Switch one forest cell (top-left corner) to barren. The Marten loses that cell of habitat, its score ticks down, and the overall index follows immediately. Every score recomputes live from the edited landscape.',
    region: 'index',
    state: {
      year: 2025,
      focusSpecies: null,
      showOverlap: false,
      includeConnectivity: true,
      edits: PIXEL_EDIT,
    },
  },
  {
    title: '7. Restoration',
    body: 'Now restore. The development corridor that split the forest is converted back to forest, reconnecting the two fragments. The Marten gains on both area and connectivity and the overall index rises above where it started. Where you restore matters: reconnecting fragments does more than scattered patches. Keep the tour closed and try your own edits, watching some species gain while others lose.',
    region: 'restoration',
    state: {
      year: 2025,
      focusSpecies: null,
      showOverlap: false,
      includeConnectivity: true,
      edits: RESTORE_CORRIDOR,
    },
  },
];
