# Design note: shareable scenario state in the URL

Status: implemented (issue #22).

## Goal

Let a user save or share a scenario by copying a link. Reloading or opening that
link reproduces the same view. This fits the static-site model: no backend, all
state lives in the URL.

## What is shared

Only the scenario, meaning the parts that define "what you are looking at":

- `year` (viewed year)
- `baseline` (year normalized to SHS = 100)
- `includeConnectivity` (toggle)
- `showOverlap` (toggle)
- `edits` (the map of cell index to land cover type)

Transient UI is deliberately excluded: the active brush, the guided tour step,
and the single-species focus the tour applies. These are interaction state, not
a scenario.

## Encoding

- State lives in the URL hash (`#...`), not the query string. The hash is never
  sent to the server, which is the safe choice for a GitHub Pages static host.
- The payload is a `URLSearchParams` string: `y`, `b`, `c`, `o`, `e`.
- Fields equal to the defaults are omitted, so a fresh view encodes to an empty
  hash and a single edit stays short. Defaults: year 2025, baseline 2001,
  connectivity on, overlap on.
- Edits use the existing single-char land cover codes (`F`, `G`, `W`, ...) from
  `src/data/land-cover.ts`, one token per edited cell as `<char><index>`, joined
  with `-` and sorted by index. Example: `#y=2010&e=D3-B45`.

The pure encode/decode lives in `src/ui/share-state.ts` and is unit-tested
independent of React.

## Robustness

- Decoding validates every field. Out-of-range years and malformed edit tokens
  (unknown code, missing index) are skipped, not fatal.
- Shared edits are clamped to the current grid size before use. `applyCellEdits`
  throws on an out-of-range index, so a stale or foreign link (for example one
  authored against a larger future grid) drops the invalid cells instead of
  crashing.

## App integration

- The URL is read once at module load to seed initial state.
- An effect writes the encoded hash with `history.replaceState` on any scenario
  change, which avoids new history entries and scroll jumps.
- URL syncing is suspended while the guided tour is running, because the tour
  drives transient demo state we do not want to persist. The tour's on-close
  reset only fires on an actual close, not on initial mount, so a URL-seeded
  scenario is not wiped when the app loads.

## Not covered

- No compression. The grid is 10x10, so even a fully edited scenario stays a
  reasonable link length. Revisit if the grid scales (issue #17).
- No history/undo of scenarios. One live scenario in the URL at a time.
