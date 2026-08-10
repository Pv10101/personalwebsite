/**
 * Types for the ByteFight replay data contract (v1).
 * See scripts/bytefight/CONTRACT.md — these mirror it exactly.
 */

export type Cell = [number, number];

export interface MatchSummary {
  id: string;
  file: string;
  p1: string;
  p2: string;
  map: string;
  width: number;
  height: number;
  turns: number;
  /** "P1" | "P2" | "DRAW" */
  result: string;
  reason: string;
}

export interface MatchIndex {
  matches: MatchSummary[];
}

export interface PlayerMeta {
  name: string;
  /** [row, col] */
  start: Cell;
}

export interface MatchMeta {
  id: string;
  width: number;
  height: number;
  p1: PlayerMeta;
  p2: PlayerMeta;
  result: string;
  reason: string;
  turns: number;
}

export interface StaticGrids {
  /** height x width; 1 = wall, 0 = open */
  walls: number[][];
  /** height x width; hillId (0 = none, 1..N = hill id) */
  hills: number[][];
}

export interface FramePlayer {
  /** [row, col] */
  loc: Cell;
  stamina: number;
  maxStamina: number;
  territory: number;
}

export interface Frame {
  t: number;
  /**
   * 0 = P1 to move, 1 = P2 to move.
   * The converter also emits -1 for "nobody" on the opening frame.
   */
  turnOf: number;
  p1: FramePlayer;
  p2: FramePlayer;
  /** FLAT, length width*height, row-major. 0 = neutral, +k = P1 k layers, -k = P2 k layers. */
  paint: number[];
  /** [row, col, owner] with owner 0 = P1, 1 = P2 */
  beacons: [number, number, number][];
  /** [row, col] */
  powerups: Cell[];
  /** hillId (as string key) -> owner: -1 none, 0 P1, 1 P2 */
  hills: Record<string, number>;
  /** short human label of the move made this turn ("" if none) */
  action: string;
}

export interface Match {
  meta: MatchMeta;
  static: StaticGrids;
  frames: Frame[];
}

export const PLAYER_NONE = -1;
export const PLAYER_ONE = 0;
export const PLAYER_TWO = 1;
