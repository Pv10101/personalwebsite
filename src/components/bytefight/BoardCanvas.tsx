"use client";

import { useCallback, useEffect, useRef } from "react";
import type { Frame, StaticGrids } from "./types";
import {
  BOARD_BG,
  CELL_OPEN,
  CELL_WALL,
  GRID_LINE,
  NEUTRAL_HILL,
  PAINT_ALPHA,
  POWERUP_HEX,
  ownerHex,
  ownerRgb,
  P1_HEX,
  P1_RGB,
  P2_HEX,
  P2_RGB,
} from "./theme";

interface BoardCanvasProps {
  width: number; // cols
  height: number; // rows
  statics: StaticGrids;
  frame: Frame;
}

/**
 * Canvas renderer for one frame.
 *
 * Canvas (rather than a grid of DOM nodes) because a 31x31 board is 961 cells and
 * playback runs at up to ~24 frames/sec; repainting one <canvas> is a single
 * composite instead of ~1000 style mutations + layout per frame.
 */
export default function BoardCanvas({
  width,
  height,
  statics,
  frame,
}: BoardCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  // Latest frame kept in a ref so the resize handler can redraw without
  // re-subscribing the ResizeObserver on every frame. Written only in effects.
  const frameRef = useRef(frame);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const dpr =
      typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 1;
    const boxW = wrap.clientWidth;
    if (boxW <= 0) return;

    // Square-ish cells: fit the whole board inside the available width.
    const cell = boxW / width;
    const cssW = boxW;
    const cssH = cell * height;

    const pxW = Math.max(1, Math.round(cssW * dpr));
    const pxH = Math.max(1, Math.round(cssH * dpr));
    if (canvas.width !== pxW || canvas.height !== pxH) {
      canvas.width = pxW;
      canvas.height = pxH;
    }
    canvas.style.height = `${cssH}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);

    const f = frameRef.current;
    const { walls, hills } = statics;

    ctx.fillStyle = BOARD_BG;
    ctx.fillRect(0, 0, cssW, cssH);

    // --- cells: wall / open / paint / hill tint -----------------------------
    for (let r = 0; r < height; r++) {
      const wallRow = walls[r];
      const hillRow = hills[r];
      for (let c = 0; c < width; c++) {
        const x = c * cell;
        const y = r * cell;
        const isWall = wallRow?.[c] === 1;

        ctx.fillStyle = isWall ? CELL_WALL : CELL_OPEN;
        ctx.fillRect(x, y, cell + 0.5, cell + 0.5);
        if (isWall) continue;

        const paint = f.paint[r * width + c] ?? 0;
        if (paint !== 0) {
          const layers = Math.min(Math.abs(paint), PAINT_ALPHA.length - 1);
          const rgb = paint > 0 ? P1_RGB : P2_RGB;
          ctx.fillStyle = `rgba(${rgb}, ${PAINT_ALPHA[layers]})`;
          ctx.fillRect(x, y, cell + 0.5, cell + 0.5);
        }

        const hillId = hillRow?.[c] ?? 0;
        if (hillId > 0) {
          const owner = f.hills[String(hillId)] ?? -1;
          const rgb = ownerRgb(owner);
          if (rgb) {
            ctx.fillStyle = `rgba(${rgb}, 0.22)`;
            ctx.fillRect(x, y, cell + 0.5, cell + 0.5);
          }
        }
      }
    }

    // --- grid lines (only when cells are big enough to be worth it) ---------
    if (cell >= 7) {
      ctx.strokeStyle = GRID_LINE;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let c = 1; c < width; c++) {
        const x = Math.round(c * cell) + 0.5;
        ctx.moveTo(x, 0);
        ctx.lineTo(x, cssH);
      }
      for (let r = 1; r < height; r++) {
        const y = Math.round(r * cell) + 0.5;
        ctx.moveTo(0, y);
        ctx.lineTo(cssW, y);
      }
      ctx.stroke();
    }

    // --- hill rings ---------------------------------------------------------
    const ringW = Math.max(1, cell * 0.09);
    for (let r = 0; r < height; r++) {
      const hillRow = hills[r];
      for (let c = 0; c < width; c++) {
        const hillId = hillRow?.[c] ?? 0;
        if (hillId <= 0) continue;
        const owner = f.hills[String(hillId)] ?? -1;
        const cx = c * cell + cell / 2;
        const cy = r * cell + cell / 2;
        ctx.beginPath();
        ctx.arc(cx, cy, Math.max(1, cell * 0.32), 0, Math.PI * 2);
        ctx.lineWidth = ringW;
        ctx.strokeStyle = owner === -1 ? NEUTRAL_HILL : ownerHex(owner);
        ctx.stroke();
      }
    }

    // --- powerups: emerald plus --------------------------------------------
    const plusArm = Math.max(1, cell * 0.22);
    const plusW = Math.max(1, cell * 0.11);
    ctx.fillStyle = POWERUP_HEX;
    for (const pu of f.powerups) {
      const [r, c] = pu;
      const cx = c * cell + cell / 2;
      const cy = r * cell + cell / 2;
      ctx.fillRect(cx - plusArm, cy - plusW / 2, plusArm * 2, plusW);
      ctx.fillRect(cx - plusW / 2, cy - plusArm, plusW, plusArm * 2);
    }

    // --- beacons: diamond ---------------------------------------------------
    const dia = Math.max(1.5, cell * 0.3);
    for (const b of f.beacons) {
      const [r, c, owner] = b;
      const cx = c * cell + cell / 2;
      const cy = r * cell + cell / 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy - dia);
      ctx.lineTo(cx + dia, cy);
      ctx.lineTo(cx, cy + dia);
      ctx.lineTo(cx - dia, cy);
      ctx.closePath();
      ctx.fillStyle = ownerHex(owner);
      ctx.fill();
      ctx.lineWidth = Math.max(1, cell * 0.06);
      ctx.strokeStyle = "rgba(12, 10, 9, 0.9)";
      ctx.stroke();
    }

    // --- agents: the most prominent marks on the board ----------------------
    const drawAgent = (
      loc: [number, number],
      hex: string,
      rgb: string,
      toMove: boolean,
    ) => {
      const [r, c] = loc;
      const cx = c * cell + cell / 2;
      const cy = r * cell + cell / 2;
      const rad = Math.max(3, cell * 0.42);

      // Soft owner-coloured halo when this agent is the one to move.
      if (toMove) {
        ctx.beginPath();
        ctx.arc(cx, cy, rad * 1.7, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb}, 0.2)`;
        ctx.fill();
      }

      // Dark backing disc separates the agent from paint of the same hue.
      ctx.beginPath();
      ctx.arc(cx, cy, rad * 1.28, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(12, 10, 9, 0.92)";
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx, cy, rad, 0, Math.PI * 2);
      ctx.fillStyle = hex;
      ctx.fill();

      // Bright rim keeps the agent readable at 31x31 where cells are ~15px.
      ctx.beginPath();
      ctx.arc(cx, cy, rad, 0, Math.PI * 2);
      ctx.lineWidth = Math.max(1, cell * 0.07);
      ctx.strokeStyle = "rgba(250, 250, 249, 0.85)";
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy, Math.max(1, rad * 0.32), 0, Math.PI * 2);
      ctx.fillStyle = "#fafaf9";
      ctx.fill();
    };

    drawAgent(f.p1.loc, P1_HEX, P1_RGB, f.turnOf === 0);
    drawAgent(f.p2.loc, P2_HEX, P2_RGB, f.turnOf === 1);
  }, [width, height, statics]);

  // Redraw whenever the frame (or board identity) changes.
  useEffect(() => {
    frameRef.current = frame;
    render();
  }, [render, frame]);

  // Redraw on container resize.
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => render());
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [render]);

  return (
    <div ref={wrapRef} className="w-full max-w-full overflow-hidden">
      <canvas
        ref={canvasRef}
        className="block w-full rounded-md border border-border"
        role="img"
        aria-label={`ByteFight board, frame ${frame.t}`}
      />
    </div>
  );
}
