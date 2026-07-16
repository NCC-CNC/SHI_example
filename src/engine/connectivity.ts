/**
 * Connectivity via the GISfrag metric: the average distance from each suitable
 * cell to the nearest edge of the suitable area. Large contiguous blocks have
 * interior cells far from any edge and so score higher than the same area
 * scattered into fragments.
 *
 * "Edge" means the nearest non-suitable cell OR the grid boundary (the study
 * area is bounded, so leaving the grid counts as leaving the habitat). Distance
 * is measured in grid steps with 8-connectivity (Chebyshev / chessboard
 * distance). See docs/design/01_shi_model.md.
 */

/**
 * For each suitable cell, its distance to the nearest edge of the suitable
 * area. Non-suitable cells are 0. Computed with a multi-source BFS from all
 * non-suitable cells, then combined with the distance to the grid boundary.
 */
export function distanceToEdgeField(
  mask: readonly boolean[],
  width: number,
  height: number,
): Float64Array {
  const n = width * height;
  const dist = new Float64Array(n).fill(Infinity);
  const queue: number[] = [];

  // Seed: every non-suitable cell is an edge source at distance 0.
  for (let i = 0; i < n; i++) {
    if (mask[i] !== true) {
      dist[i] = 0;
      queue.push(i);
    }
  }

  // Multi-source BFS (8-connectivity, unit steps => Chebyshev distance).
  for (let head = 0; head < queue.length; head++) {
    const idx = queue[head]!;
    const x = idx % width;
    const y = (idx - x) / width;
    const next = dist[idx]! + 1;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) {
          continue;
        }
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) {
          continue;
        }
        const nIdx = ny * width + nx;
        if (next < dist[nIdx]!) {
          dist[nIdx] = next;
          queue.push(nIdx);
        }
      }
    }
  }

  // Combine with the distance to the grid boundary: a suitable cell near the
  // edge of the study area is close to habitat's edge even with no non-suitable
  // cell nearby (and a fully-suitable grid measures to its boundary).
  for (let i = 0; i < n; i++) {
    if (mask[i] === true) {
      const x = i % width;
      const y = (i - x) / width;
      const boundary = Math.min(x + 1, width - x, y + 1, height - y);
      dist[i] = Math.min(dist[i]!, boundary);
    }
  }

  return dist;
}

/**
 * The GISfrag value for a suitable mask: the mean distance-to-edge over all
 * suitable cells. Returns null when there are no suitable cells (undefined).
 */
export function gisfrag(
  mask: readonly boolean[],
  width: number,
  height: number,
): number | null {
  const dist = distanceToEdgeField(mask, width, height);
  let sum = 0;
  let count = 0;
  for (let i = 0; i < mask.length; i++) {
    if (mask[i] === true) {
      sum += dist[i]!;
      count += 1;
    }
  }
  return count === 0 ? null : sum / count;
}

/**
 * Connectivity score: the current GISfrag as a percentage of the baseline's.
 * Null when either value is undefined or the baseline is zero.
 */
export function connectivityScore(
  currentGisfrag: number | null,
  baselineGisfrag: number | null,
): number | null {
  if (currentGisfrag === null || baselineGisfrag === null || baselineGisfrag <= 0) {
    return null;
  }
  return (100 * currentGisfrag) / baselineGisfrag;
}
