/**
 * Sequential single-hue green ramp for habitat suitability (0..1). Monotonic in
 * lightness (light = low suitability, dark = high), which is the sequential
 * rule and is inherently colorblind-safe. Stops are the ColorBrewer "Greens"
 * scale; we interpolate linearly between them.
 */
const STOPS: readonly (readonly [number, number, number])[] = [
  [247, 252, 245], // 0.0  near-white
  [199, 233, 192], // 0.25
  [116, 196, 118], // 0.5
  [49, 163, 84], // 0.75
  [0, 109, 44], // 1.0  dark green
];

function lerp(a: number, b: number, t: number): number {
  return Math.round(a + (b - a) * t);
}

/** Map a suitability value in [0, 1] to a CSS rgb() color on the green ramp. */
export function suitabilityColor(value: number): string {
  const clamped = Math.min(1, Math.max(0, value));
  const scaled = clamped * (STOPS.length - 1);
  const lower = Math.min(Math.floor(scaled), STOPS.length - 2);
  const t = scaled - lower;
  const from = STOPS[lower]!;
  const to = STOPS[lower + 1]!;
  const r = lerp(from[0], to[0], t);
  const g = lerp(from[1], to[1], t);
  const b = lerp(from[2], to[2], t);
  return `rgb(${r}, ${g}, ${b})`;
}
