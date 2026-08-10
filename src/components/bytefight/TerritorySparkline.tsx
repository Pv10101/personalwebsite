"use client";

import { useMemo } from "react";
import type { Frame } from "./types";
import { P1_HEX, P2_HEX } from "./theme";

interface Props {
  frames: Frame[];
  current: number;
}

const VB_W = 300;
const VB_H = 44;

/** Territory-over-time sparkline with a playhead. Pure SVG — cheap, one path per player. */
export default function TerritorySparkline({ frames, current }: Props) {
  const { p1Path, p2Path } = useMemo(() => {
    const n = frames.length;
    if (n === 0) return { p1Path: "", p2Path: "" };
    let max = 1;
    for (const f of frames) {
      if (f.p1.territory > max) max = f.p1.territory;
      if (f.p2.territory > max) max = f.p2.territory;
    }
    const x = (i: number) => (n === 1 ? 0 : (i / (n - 1)) * VB_W);
    const y = (v: number) => VB_H - (v / max) * (VB_H - 2) - 1;
    const build = (pick: (f: Frame) => number) =>
      frames.map((f, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(2)},${y(pick(f)).toFixed(2)}`).join(" ");
    return {
      p1Path: build((f) => f.p1.territory),
      p2Path: build((f) => f.p2.territory),
    };
  }, [frames]);

  const headX =
    frames.length <= 1 ? 0 : (current / (frames.length - 1)) * VB_W;

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      preserveAspectRatio="none"
      className="h-11 w-full"
      aria-hidden="true"
    >
      <path d={p1Path} fill="none" stroke={P1_HEX} strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
      <path d={p2Path} fill="none" stroke={P2_HEX} strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
      <line
        x1={headX}
        x2={headX}
        y1={0}
        y2={VB_H}
        stroke="#a8a29e"
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
