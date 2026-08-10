/** Shared palette for the ByteFight replay renderer. Matches the site's stone/amber language. */

export const P1_RGB = "245, 158, 11"; // amber-500, the site accent
export const P2_RGB = "56, 189, 248"; // sky-400

export const P1_HEX = "#f59e0b";
export const P2_HEX = "#38bdf8";

export const BOARD_BG = "#0c0a09"; // --color-bg
export const CELL_OPEN = "#1c1917"; // --color-surface
export const CELL_WALL = "#3f3a36";
export const GRID_LINE = "rgba(250, 250, 249, 0.05)";

export const POWERUP_HEX = "#34d399"; // emerald-400
export const NEUTRAL_HILL = "rgba(214, 211, 209, 0.32)"; // stone-300-ish

/** Paint opacity by layer count (index 0 unused — 0 means neutral). */
export const PAINT_ALPHA = [0, 0.24, 0.44, 0.64, 0.86];

export function ownerRgb(owner: number): string | null {
  if (owner === 0) return P1_RGB;
  if (owner === 1) return P2_RGB;
  return null;
}

export function ownerHex(owner: number): string {
  if (owner === 0) return P1_HEX;
  if (owner === 1) return P2_HEX;
  return "#a8a29e";
}
