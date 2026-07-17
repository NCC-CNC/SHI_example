import { DEFAULT_BASELINE, YEAR_MAX, YEAR_MIN } from '../engine/index.ts';
import type { LandCoverType } from '../engine/index.ts';
import { LAND_COVER_BY_CHAR } from '../data/land-cover.ts';

/**
 * Shareable scenario state: the parts of the app that define "what you are
 * looking at" and should survive a reload or travel in a link. Transient UI
 * (the active brush, the guided tour, single-species focus) is deliberately
 * excluded.
 */
export interface ShareState {
  readonly year: number;
  readonly baseline: number;
  readonly includeConnectivity: boolean;
  readonly showOverlap: boolean;
  readonly edits: ReadonlyMap<number, LandCoverType>;
}

/** The app's starting state. Values equal to these are omitted from the URL. */
export const SHARE_DEFAULTS: ShareState = {
  year: YEAR_MAX,
  baseline: DEFAULT_BASELINE,
  includeConnectivity: true,
  showOverlap: true,
  edits: new Map(),
};

// Inverse of LAND_COVER_BY_CHAR: land cover type -> its single-char code. Every
// modelled type has a code, so a lookup here is always defined.
const CHAR_BY_LAND_COVER = Object.fromEntries(
  Object.entries(LAND_COVER_BY_CHAR).map(([char, type]) => [type, char]),
) as Record<LandCoverType, string>;

/** Parse a year param: an integer inside the modelled range, else null. */
function parseYear(raw: string | null): number | null {
  if (raw === null) {
    return null;
  }
  const n = Number(raw);
  if (!Number.isInteger(n) || n < YEAR_MIN || n > YEAR_MAX) {
    return null;
  }
  return n;
}

/**
 * Parse the edits param, e.g. "D3-B45": each token is a land cover char code
 * followed by a non-negative flat cell index. Unknown codes or malformed
 * indices are skipped so a stale or hand-edited link degrades gracefully. Index
 * bounds against the current grid are enforced by the caller, not here.
 */
function parseEdits(raw: string): Map<number, LandCoverType> {
  const edits = new Map<number, LandCoverType>();
  for (const token of raw.split('-')) {
    if (token.length < 2) {
      continue;
    }
    const type = LAND_COVER_BY_CHAR[token[0]!];
    const index = Number(token.slice(1));
    if (type === undefined || !Number.isInteger(index) || index < 0) {
      continue;
    }
    edits.set(index, type);
  }
  return edits;
}

/**
 * Encode scenario state into a compact URL query string (no leading '#').
 * Fields equal to the defaults are omitted, so a fresh view encodes to "" and a
 * single edit stays short (e.g. "e=B45").
 */
export function encodeState(state: ShareState): string {
  const params = new URLSearchParams();
  if (state.year !== SHARE_DEFAULTS.year) {
    params.set('y', String(state.year));
  }
  if (state.baseline !== SHARE_DEFAULTS.baseline) {
    params.set('b', String(state.baseline));
  }
  if (state.includeConnectivity !== SHARE_DEFAULTS.includeConnectivity) {
    params.set('c', state.includeConnectivity ? '1' : '0');
  }
  if (state.showOverlap !== SHARE_DEFAULTS.showOverlap) {
    params.set('o', state.showOverlap ? '1' : '0');
  }
  if (state.edits.size > 0) {
    const tokens = [...state.edits.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([index, type]) => `${CHAR_BY_LAND_COVER[type]}${index}`);
    params.set('e', tokens.join('-'));
  }
  return params.toString();
}

/**
 * Decode a URL query string (no leading '#') into whatever scenario fields it
 * validly carries. Missing or invalid fields are simply absent from the result,
 * so callers merge it over SHARE_DEFAULTS.
 */
export function decodeState(raw: string): Partial<ShareState> {
  const params = new URLSearchParams(raw);
  const out: {
    year?: number;
    baseline?: number;
    includeConnectivity?: boolean;
    showOverlap?: boolean;
    edits?: ReadonlyMap<number, LandCoverType>;
  } = {};

  const year = parseYear(params.get('y'));
  if (year !== null) {
    out.year = year;
  }
  const baseline = parseYear(params.get('b'));
  if (baseline !== null) {
    out.baseline = baseline;
  }
  if (params.get('c') !== null) {
    out.includeConnectivity = params.get('c') === '1';
  }
  if (params.get('o') !== null) {
    out.showOverlap = params.get('o') === '1';
  }
  const rawEdits = params.get('e');
  if (rawEdits !== null) {
    const edits = parseEdits(rawEdits);
    if (edits.size > 0) {
      out.edits = edits;
    }
  }
  return out;
}

/** Drop edits whose cell index falls outside a grid of `cellCount` cells. */
export function sanitizeEdits(
  edits: ReadonlyMap<number, LandCoverType>,
  cellCount: number,
): ReadonlyMap<number, LandCoverType> {
  const kept = new Map<number, LandCoverType>();
  for (const [index, type] of edits) {
    if (index >= 0 && index < cellCount) {
      kept.set(index, type);
    }
  }
  return kept;
}
