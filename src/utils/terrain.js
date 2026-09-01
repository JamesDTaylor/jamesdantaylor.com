/**
 * Unified Mathematical Terrain & Elevation Models
 * Based on harmonic multi-frequency synthesis for smooth organic contours
 */

// Ground baseline terrain curve for character physics and foreground baseline
export function getParchmentGroundY(x, width, height) {
  const nx = Math.max(0, Math.min(1, x / width));
  const hill1 = Math.sin(nx * Math.PI * 1.15) * 14.0;
  const hill2 = Math.sin(nx * Math.PI * 2.8 + 0.3) * 4.0;
  return height - 38.0 - hill1 - hill2;
}

// Analytical ground slope (derivative dy/dx) for orthogonal anchoring
export function getGroundSlope(x, width, height) {
  const step = 6.0;
  const y1 = getParchmentGroundY(x - step, width, height);
  const y2 = getParchmentGroundY(x + step, width, height);
  return Math.atan2(y2 - y1, step * 2.0);
}

// Background layer elevation curves for multi-depth atmospheric parallax
export function getFarMountainY(x, width, height) {
  const nx = x / width;
  return height * 0.58 + Math.sin(nx * 3.8 + 0.4) * 32.0 + Math.cos(nx * 8.2) * 16.0 + Math.sin(nx * 14.5) * 6.0;
}

export function getMidRidgeY(x, width, height) {
  const nx = x / width;
  return height * 0.64 + Math.sin(nx * 4.5 + 1.8) * 20.0 + Math.sin(nx * 9.8) * 10.0 + Math.cos(nx * 18.0) * 4.0;
}
