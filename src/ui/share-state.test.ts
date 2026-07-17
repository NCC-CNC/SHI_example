import { describe, expect, it } from 'vitest';
import type { LandCoverType } from '../engine/index.ts';
import {
  decodeState,
  encodeState,
  sanitizeEdits,
  SHARE_DEFAULTS,
} from './share-state.ts';

const base = () => ({
  year: SHARE_DEFAULTS.year,
  baseline: SHARE_DEFAULTS.baseline,
  includeConnectivity: SHARE_DEFAULTS.includeConnectivity,
  showOverlap: SHARE_DEFAULTS.showOverlap,
  edits: new Map<number, LandCoverType>(),
});

describe('encodeState', () => {
  it('encodes the default state as an empty string', () => {
    expect(encodeState(base())).toBe('');
  });

  it('omits fields equal to the defaults and encodes only what differs', () => {
    expect(encodeState({ ...base(), year: 2010 })).toBe('y=2010');
    expect(encodeState({ ...base(), includeConnectivity: false })).toBe('c=0');
    expect(encodeState({ ...base(), showOverlap: false })).toBe('o=0');
  });

  it('encodes edits compactly, sorted by cell index', () => {
    const edits = new Map<number, LandCoverType>([
      [45, 'barren'],
      [3, 'developed'],
    ]);
    expect(encodeState({ ...base(), edits })).toBe('e=D3-B45');
  });
});

describe('decodeState', () => {
  it('returns nothing for an empty string', () => {
    expect(decodeState('')).toEqual({});
  });

  it('round-trips a full non-default scenario', () => {
    const state = {
      year: 2015,
      baseline: 1997,
      includeConnectivity: false,
      showOverlap: false,
      edits: new Map<number, LandCoverType>([
        [3, 'developed'],
        [45, 'barren'],
      ]),
    };
    const decoded = decodeState(encodeState(state));
    expect(decoded.year).toBe(2015);
    expect(decoded.baseline).toBe(1997);
    expect(decoded.includeConnectivity).toBe(false);
    expect(decoded.showOverlap).toBe(false);
    expect([...(decoded.edits ?? [])]).toEqual([
      [3, 'developed'],
      [45, 'barren'],
    ]);
  });

  it('ignores out-of-range years and malformed edit tokens', () => {
    expect(decodeState('y=1800')).toEqual({});
    expect(decodeState('y=abc')).toEqual({});
    // "Z9" (bad code) and "D" (no index) are skipped; "F7" survives.
    const decoded = decodeState('e=Z9-D-F7');
    expect([...(decoded.edits ?? [])]).toEqual([[7, 'forest']]);
  });

  it('treats any c/o value other than "1" as false', () => {
    expect(decodeState('c=0').includeConnectivity).toBe(false);
    expect(decodeState('c=1').includeConnectivity).toBe(true);
    expect(decodeState('o=x').showOverlap).toBe(false);
  });
});

describe('sanitizeEdits', () => {
  it('drops edits whose index falls outside the grid', () => {
    const edits = new Map<number, LandCoverType>([
      [5, 'forest'],
      [99, 'barren'],
      [100, 'developed'],
      [-1, 'wetland'],
    ]);
    expect([...sanitizeEdits(edits, 100)]).toEqual([
      [5, 'forest'],
      [99, 'barren'],
    ]);
  });
});
