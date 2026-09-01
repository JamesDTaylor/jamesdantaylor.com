/**
 * Shared organic terrain contour equation
 * Ensures 100% pixel-perfect alignment between background ground and character feet
 */
export function getParchmentGroundY(x, width, height) {
  const nx = Math.max(0, Math.min(1, x / width));
  const hill1 = Math.sin(nx * Math.PI * 1.15) * 16;
  const hill2 = Math.sin(nx * Math.PI * 2.8 + 0.3) * 4.5;
  return height - 25 - hill1 - hill2;
}
