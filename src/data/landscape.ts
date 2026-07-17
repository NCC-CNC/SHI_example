import type { Grid, LandCoverType } from '../engine/index.ts';
import type { CellChange, ScenarioEvent } from './scenario.ts';

/**
 * Deterministic procedural landscape for the SHI example. Replaces the original
 * hand-authored 10x10 rows with a ~30x30 organic landscape so the maps read more
 * like terrain while staying fully reproducible (a fixed seed, no runtime
 * randomness). The spatial story matches the original teaching scenario:
 *
 *   - Forest upland in the top-left, softening through a shrub ecotone into
 *     grassland on the right.
 *   - A wetland and open water (lake + a meandering river) in the low, wet
 *     bottom-left.
 *   - A patch of existing cropland in the dry bottom-right.
 *
 * The disturbances over 1993..2025 (built in scenario.ts) then act on these
 * regions: a developed corridor fragments the forest, the wetland dries from its
 * edge, and grassland converts to crops on the right.
 */

export const GRID_WIDTH = 30;
export const GRID_HEIGHT = 30;

const SEED = 0x5f3a2c1d;

/** Small, fast, deterministic PRNG (mulberry32). */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const smooth = (t: number): number => t * t * (3 - 2 * t);
const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

/**
 * A value-noise sampler over the unit square. `freq` is the number of lattice
 * cells per side; lower is smoother/blobbier. Returns values in ~[0, 1].
 */
function valueNoise(
  rng: () => number,
  freq: number,
): (nx: number, ny: number) => number {
  const size = freq + 1;
  const grid = new Float64Array(size * size);
  for (let i = 0; i < grid.length; i++) {
    grid[i] = rng();
  }
  return (nx, ny) => {
    const gx = clamp01(nx) * freq;
    const gy = clamp01(ny) * freq;
    const x0 = Math.floor(gx);
    const y0 = Math.floor(gy);
    const x1 = Math.min(x0 + 1, freq);
    const y1 = Math.min(y0 + 1, freq);
    const tx = smooth(gx - x0);
    const ty = smooth(gy - y0);
    const v00 = grid[y0 * size + x0]!;
    const v10 = grid[y0 * size + x1]!;
    const v01 = grid[y1 * size + x0]!;
    const v11 = grid[y1 * size + x1]!;
    return lerp(lerp(v00, v10, tx), lerp(v01, v11, tx), ty);
  };
}

/**
 * Build the base (pre-disturbance, 1993) landscape. Pure and deterministic:
 * the same seed always yields the same grid.
 */
export function buildBaseLandscape(): Grid {
  const w = GRID_WIDTH;
  const h = GRID_HEIGHT;
  const rng = mulberry32(SEED);
  // Independent noise fields (drawn in a fixed order for determinism).
  const forestNoise = valueNoise(rng, 5);
  const wetNoise = valueNoise(rng, 4);
  const patchNoise = valueNoise(rng, 6);
  const riverNoise = valueNoise(rng, 5);

  const cells: LandCoverType[] = new Array<LandCoverType>(w * h).fill('grassland');
  const set = (x: number, y: number, t: LandCoverType) => {
    cells[y * w + x] = t;
  };

  const SQRT2 = Math.SQRT2;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const nx = x / (w - 1);
      const ny = y / (h - 1);
      // Upland tendency: a forest block anchored in the top-left, its extent set
      // by radial distance from that corner and perturbed by low-frequency noise
      // so the forest/grassland edge is organic. A thin shrub ecotone rings it.
      const upland = clamp01(1.15 - 1.35 * (Math.hypot(nx, ny) / SQRT2));
      const forestScore = 0.72 * upland + 0.28 * forestNoise(nx, ny);
      // Lowland/wet tendency: high in the bottom-left.
      const gBL = clamp01(0.5 * (1 - nx) + 0.95 * ny - 0.18);
      const wetScore = 0.55 * gBL + 0.45 * wetNoise(nx, ny);

      let t: LandCoverType = 'grassland';
      if (forestScore > 0.52) {
        t = 'forest';
      } else if (forestScore > 0.4) {
        t = 'shrubs';
      }
      // Water/wetland occupy the lowest, wettest ground and override dry cover.
      if (wetScore > 0.9) {
        t = 'lake';
      } else if (wetScore > 0.62) {
        t = 'wetland';
      }
      // Existing cropland in the dry bottom-right corner (never over water).
      if (
        nx > 0.68 &&
        ny > 0.7 &&
        patchNoise(nx, ny) > 0.52 &&
        (t === 'grassland' || t === 'shrubs')
      ) {
        t = 'crops';
      }
      set(x, y, t);
    }
  }

  // A meandering river descending from the top edge to the bottom-left wetland,
  // tying the water features together. Drawn last so it cuts across other cover.
  for (let y = 0; y < h; y++) {
    const t = y / (h - 1);
    const baseX = lerp(0.6 * (w - 1), 0.16 * (w - 1), t);
    const wobble = (riverNoise(t, 0.5) - 0.5) * 7;
    const cx = Math.round(baseX + wobble);
    for (let dx = 0; dx <= 1; dx++) {
      const x = cx + dx;
      if (x >= 0 && x < w) {
        // Near the mouth the river broadens into the lake/wetland already there.
        set(x, y, y > h - 4 ? 'lake' : 'river');
      }
    }
  }

  return { width: w, height: h, cells };
}

// --- Disturbance regions -------------------------------------------------

/** Flat indices of every cell of a given cover type in the base grid. */
function cellsOfType(base: Grid, type: LandCoverType): number[] {
  const out: number[] = [];
  for (let i = 0; i < base.cells.length; i++) {
    if (base.cells[i] === type) {
      out.push(i);
    }
  }
  return out;
}

const xOf = (index: number): number => index % GRID_WIDTH;
const yOf = (index: number): number => Math.floor(index / GRID_WIDTH);
const change = (index: number, to: LandCoverType): CellChange => ({
  x: xOf(index),
  y: yOf(index),
  to,
});

/**
 * The developed corridor that fragments the forest: a ~2-cell-wide band that
 * wanders down through the forest block, advancing downward year by year.
 * Returned as the ordered list of forest cells it will consume, top to bottom,
 * so the scenario can reveal it progressively and the tour can restore it. The
 * wander is a fixed sum of sines, so it is deterministic and organic rather than
 * a straight line.
 */
export function forestCorridorCells(base: Grid): number[] {
  const baseX = GRID_WIDTH * 0.26;
  const cells: number[] = [];
  for (let y = 0; y < GRID_HEIGHT; y++) {
    const wander = 2.6 * Math.sin(y * 0.34 + 0.6) + 1.3 * Math.sin(y * 0.85 + 2.1);
    const cx = Math.round(baseX + wander);
    for (const x of [cx, cx + 1]) {
      if (x < 0 || x >= GRID_WIDTH) {
        continue;
      }
      const idx = y * GRID_WIDTH + x;
      if (base.cells[idx] === 'forest') {
        cells.push(idx);
      }
    }
  }
  return cells;
}

/**
 * Build the dated disturbance events over 1993..2025 from the base landscape.
 * Each process (forest fragmentation, wetland drainage, grassland conversion)
 * advances as a growing fraction of its region across a set of milestone years.
 */
export function buildLandscapeEvents(base: Grid): ScenarioEvent[] {
  const events: ScenarioEvent[] = [];

  // 1. Forest fragmentation: the developed corridor advances top-to-bottom.
  const corridor = forestCorridorCells(base);
  const corridorYears = [2003, 2006, 2009, 2013, 2017];
  corridorYears.forEach((year, i) => {
    const from = Math.floor((corridor.length * i) / corridorYears.length);
    const to = Math.floor((corridor.length * (i + 1)) / corridorYears.length);
    const changes = corridor.slice(from, to).map((idx) => change(idx, 'developed'));
    if (changes.length > 0) {
      events.push({ year, changes });
    }
  });

  // 2. Wetland drainage: wetland dries to barren from its driest (upper/right)
  // edge inward. Order wetland cells by y then x so higher, drier cells go first.
  const wetland = cellsOfType(base, 'wetland').sort(
    (a, b) => yOf(a) - yOf(b) || xOf(a) - xOf(b),
  );
  const wetYears = [2007, 2010, 2013, 2016, 2020];
  const wetFractions = [0.15, 0.35, 0.55, 0.75, 0.9];
  let wetDone = 0;
  wetYears.forEach((year, i) => {
    const target = Math.floor(wetland.length * wetFractions[i]!);
    const changes = wetland.slice(wetDone, target).map((idx) => change(idx, 'barren'));
    wetDone = target;
    if (changes.length > 0) {
      events.push({ year, changes });
    }
  });

  // 3. Grassland conversion to cropland, spreading from the right edge leftward.
  const grassland = cellsOfType(base, 'grassland').sort(
    (a, b) => xOf(b) - xOf(a) || yOf(a) - yOf(b),
  );
  const cropYears = [2016, 2019, 2022, 2024];
  const cropFractions = [0.12, 0.24, 0.36, 0.45];
  let cropDone = 0;
  cropYears.forEach((year, i) => {
    const target = Math.floor(grassland.length * cropFractions[i]!);
    const changes = grassland
      .slice(cropDone, target)
      .map((idx) => change(idx, 'crops'));
    cropDone = target;
    if (changes.length > 0) {
      events.push({ year, changes });
    }
  });

  return events.sort((a, b) => a.year - b.year);
}
