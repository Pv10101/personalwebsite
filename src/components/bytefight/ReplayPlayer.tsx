"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import BoardCanvas from "./BoardCanvas";
import TerritorySparkline from "./TerritorySparkline";
import { P1_HEX, P2_HEX, POWERUP_HEX } from "./theme";
import type { Frame, Match, MatchIndex, MatchSummary } from "./types";

const INDEX_URL = "/bytefight/index.json";
const MATCH_URL = (id: string) => `/bytefight/matches/${id}.json`;

/** Frames per second at 1x. */
const BASE_FPS = 8;
const SPEEDS = [0.5, 1, 2, 4] as const;

interface LoadedMatch {
  id: string;
  match: Match;
}

interface LoadError {
  /** null = the index itself failed */
  id: string | null;
  message: string;
}

export interface ReplayPlayerProps {
  /** Match id to open first. Defaults to the first entry in index.json. */
  matchId?: string;
  /** Show the match picker dropdown (hide it to embed a single fixed replay). */
  showPicker?: boolean;
  /**
   * Show a poster first and only fetch a match when the visitor clicks it, which
   * picks one at random and starts playing. Keeps ~1 MB of match JSON off the
   * initial page load.
   */
  poster?: boolean;
  className?: string;
}

export default function ReplayPlayer({
  matchId,
  showPicker = true,
  poster = false,
  className = "",
}: ReplayPlayerProps) {
  const [summaries, setSummaries] = useState<MatchSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(matchId ?? null);
  const [loaded, setLoaded] = useState<LoadedMatch | null>(null);
  const [error, setError] = useState<LoadError | null>(null);

  const [frameIdx, setFrameIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<number>(1);
  // In poster mode nothing is fetched or shown until the visitor opts in.
  const [started, setStarted] = useState(!poster);
  // Set when the poster picks a match, consumed once that match finishes loading.
  const autoPlayRef = useRef(false);

  // Loading / error / match are derived from the currently selected id, so no
  // state has to be reset inside an effect when the selection changes.
  const match = loaded && loaded.id === selectedId ? loaded.match : null;
  const errorMsg =
    error && (error.id === null || error.id === selectedId) ? error.message : null;
  const loading = started && !match && !errorMsg;
  const total = match?.frames.length ?? 0;
  const maxIdx = Math.max(total - 1, 0);
  const safeIdx = Math.min(frameIdx, maxIdx);

  // Mirrors frameIdx so the rAF loop can read it without restarting each frame.
  const frameRef = useRef(0);

  const goToFrame = useCallback(
    (n: number) => {
      const clamped = Math.max(0, Math.min(n, maxIdx));
      frameRef.current = clamped;
      setFrameIdx(clamped);
    },
    [maxIdx],
  );

  // ---- load the match index -------------------------------------------------
  useEffect(() => {
    const ac = new AbortController();
    fetch(INDEX_URL, { signal: ac.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<MatchIndex>;
      })
      .then((data) => {
        const list = data.matches ?? [];
        setSummaries(list);
        if (list.length === 0) {
          setError({ id: null, message: "No matches found in index.json." });
          return;
        }
        // In poster mode the match is chosen on click, not on mount.
        if (!poster) setSelectedId((cur) => cur ?? list[0].id);
      })
      .catch((e: unknown) => {
        if ((e as Error).name === "AbortError") return;
        setError({
          id: null,
          message: `Could not load the match list: ${(e as Error).message}`,
        });
      });
    return () => ac.abort();
  }, [poster]);

  // ---- load the selected match ---------------------------------------------
  useEffect(() => {
    if (!selectedId || !started) return;
    const ac = new AbortController();
    fetch(MATCH_URL(selectedId), { signal: ac.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<Match>;
      })
      .then((data) => {
        setLoaded({ id: selectedId, match: data });
        if (autoPlayRef.current) {
          autoPlayRef.current = false;
          frameRef.current = 0;
          setFrameIdx(0);
          setPlaying(true);
        }
      })
      .catch((e: unknown) => {
        if ((e as Error).name === "AbortError") return;
        setError({
          id: selectedId,
          message: `Could not load match "${selectedId}": ${(e as Error).message}`,
        });
      });
    return () => ac.abort();
  }, [selectedId, started]);

  // ---- playback loop (rAF, time-accumulated so it does not drift) ----------
  useEffect(() => {
    if (!playing || total === 0) return;
    let raf = 0;
    let last = performance.now();
    let acc = 0;
    const interval = 1000 / (BASE_FPS * speed);

    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      acc += dt;
      if (acc >= interval) {
        const advance = Math.floor(acc / interval);
        acc -= advance * interval;
        const next = frameRef.current + advance;
        if (next >= total - 1) {
          frameRef.current = total - 1;
          setFrameIdx(total - 1);
          setPlaying(false);
          return;
        }
        frameRef.current = next;
        setFrameIdx(next);
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, speed, total]);

  const togglePlay = useCallback(() => {
    if (total === 0) return;
    if (playing) {
      setPlaying(false);
      return;
    }
    if (frameRef.current >= total - 1) {
      frameRef.current = 0;
      setFrameIdx(0);
    }
    setPlaying(true);
  }, [playing, total]);

  const step = useCallback(
    (delta: number) => {
      setPlaying(false);
      goToFrame(frameRef.current + delta);
    },
    [goToFrame],
  );

  const selectMatch = useCallback((id: string) => {
    setPlaying(false);
    frameRef.current = 0;
    setFrameIdx(0);
    setSelectedId(id);
  }, []);

  /** Poster click: pick a match at random, load it, and play it. */
  const startRandom = useCallback(() => {
    if (summaries.length === 0) return;
    const pick = summaries[Math.floor(Math.random() * summaries.length)];
    autoPlayRef.current = true;
    setStarted(true);
    selectMatch(pick.id);
  }, [summaries, selectMatch]);

  // ---- keyboard shortcuts ---------------------------------------------------
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && /^(INPUT|SELECT|TEXTAREA)$/.test(el.tagName)) return;
      if (e.key === " ") {
        e.preventDefault();
        togglePlay();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        step(1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        step(-1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [togglePlay, step]);

  const frame: Frame | undefined = match?.frames[safeIdx];
  const summary = useMemo(
    () => summaries.find((s) => s.id === selectedId) ?? null,
    [summaries, selectedId],
  );

  // ---- poster: nothing fetched beyond the small index until this is clicked --
  if (!started) {
    const ready = summaries.length > 0;
    return (
      <div className={`w-full ${className}`}>
        {errorMsg ? (
          <div className="rounded-md border border-border bg-surface px-4 py-3 text-sm text-stone-300">
            {errorMsg}
          </div>
        ) : (
          <button
            type="button"
            onClick={startRandom}
            disabled={!ready}
            aria-label="Play a random recorded match"
            className="group flex w-full flex-col items-center justify-center gap-4 rounded-md border border-border bg-surface px-6 py-20 text-center transition-colors hover:border-accent disabled:cursor-default disabled:opacity-60"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full border border-accent/50 bg-accent/10 transition-colors group-hover:bg-accent/20">
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="ml-1 h-6 w-6 fill-accent"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
            <span className="text-sm font-medium text-text">
              {ready ? "Play a random match" : "Loading matches…"}
            </span>
            {ready && (
              <span className="max-w-xs text-xs leading-relaxed text-stone-500">
                {summaries.length}
                {" recorded wins, reconstructed frame by frame from the "}
                {"engine’s own match logs."}
              </span>
            )}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {/* ---- top bar: picker + result ---------------------------------- */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        {/* min-w-0 on both the flex item and the select: without it the longest
            option's intrinsic width forces horizontal overflow on narrow screens. */}
        {showPicker && summaries.length > 0 && (
          <label className="flex min-w-0 max-w-full flex-1 items-center gap-2 text-sm text-text-muted">
            <span className="shrink-0">Match</span>
            <select
              value={selectedId ?? ""}
              onChange={(e) => selectMatch(e.target.value)}
              className="min-w-0 flex-1 truncate rounded-md border border-border bg-surface px-2 py-1 text-sm text-text outline-none focus:border-accent"
            >
              {summaries.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.map} · {s.p1} vs {s.p2}
                </option>
              ))}
            </select>
          </label>
        )}
        {summary && (
          <span className="rounded-full bg-surface px-3 py-0.5 text-xs font-medium text-stone-400">
            {summary.result === "DRAW" ? "Draw" : `${summary.result} wins`} ·{" "}
            {summary.reason}
          </span>
        )}
      </div>

      {errorMsg && (
        <div className="rounded-md border border-border bg-surface px-4 py-3 text-sm text-stone-300">
          {errorMsg}
        </div>
      )}

      {loading && (
        <div className="flex h-64 items-center justify-center rounded-md border border-border bg-surface text-sm text-text-muted">
          <span className="animate-pulse">Loading replay…</span>
        </div>
      )}

      {match && frame && (
        <div className="grid gap-5">
          {/* ---- board + transport ------------------------------------- */}
          <div className="min-w-0">
            <BoardCanvas
              width={match.meta.width}
              height={match.meta.height}
              statics={match.static}
              frame={frame}
            />

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label="Step back one frame"
                className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-text transition-colors hover:border-stone-600"
              >
                ◀|
              </button>
              <button
                type="button"
                onClick={togglePlay}
                aria-label={playing ? "Pause" : "Play"}
                className="rounded-md border border-accent bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent transition-colors hover:bg-accent/20"
              >
                {playing ? "Pause" : "Play"}
              </button>
              <button
                type="button"
                onClick={() => step(1)}
                aria-label="Step forward one frame"
                className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-text transition-colors hover:border-stone-600"
              >
                |▶
              </button>

              <div className="ml-auto flex items-center gap-1">
                {SPEEDS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSpeed(s)}
                    aria-pressed={speed === s}
                    className={`rounded-md border px-2 py-1 text-xs font-medium transition-colors ${
                      speed === s
                        ? "border-accent text-accent"
                        : "border-border text-stone-400 hover:border-stone-600"
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-3 flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={maxIdx}
                step={1}
                value={safeIdx}
                onChange={(e) => goToFrame(Number(e.target.value))}
                aria-label="Scrub frames"
                className="h-1.5 w-full min-w-0 cursor-pointer appearance-none rounded-full bg-surface accent-amber-500"
              />
              <span className="shrink-0 font-mono text-xs tabular-nums text-text-muted">
                {safeIdx} / {maxIdx}
              </span>
            </div>

            <p className="mt-3 min-h-[1.5rem] font-mono text-xs text-stone-400">
              {frame.action || "—"}
            </p>
          </div>

          {/* ---- HUD ---------------------------------------------------- */}
          <aside className="min-w-0 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <PlayerCard
                name={match.meta.p1.name}
                color={P1_HEX}
                stats={frame.p1}
                toMove={frame.turnOf === 0}
              />
              <PlayerCard
                name={match.meta.p2.name}
                color={P2_HEX}
                stats={frame.p2}
                toMove={frame.turnOf === 1}
              />
            </div>

            <div className="rounded-md border border-border bg-surface p-3">
              <div className="mb-1 text-[11px] uppercase tracking-wide text-text-muted">
                Territory over time
              </div>
              <TerritorySparkline frames={match.frames} current={safeIdx} />
            </div>

            <details className="rounded-md border border-border bg-surface p-3 text-xs text-stone-400">
              <summary className="cursor-pointer list-none text-[11px] uppercase tracking-wide text-text-muted marker:content-none">
                Legend
              </summary>
              <ul className="mt-2 space-y-1.5">
                <li className="flex items-center gap-2">
                  <span
                    className="inline-block h-3 w-3 rounded-full"
                    style={{ background: P1_HEX }}
                  />
                  P1 agent / paint
                </li>
                <li className="flex items-center gap-2">
                  <span
                    className="inline-block h-3 w-3 rounded-full"
                    style={{ background: P2_HEX }}
                  />
                  P2 agent / paint
                </li>
                <li className="flex items-center gap-2">
                  <span className="inline-block h-3 w-3 rounded-full border-2 border-stone-300" />
                  Hill (ring tints to owner)
                </li>
                <li className="flex items-center gap-2">
                  <span className="inline-block h-3 w-3 rotate-45 bg-stone-300" />
                  Beacon (owner-coloured)
                </li>
                <li className="flex items-center gap-2">
                  <span
                    className="inline-block h-3 w-3"
                    style={{
                      background: POWERUP_HEX,
                      clipPath:
                        "polygon(40% 0,60% 0,60% 40%,100% 40%,100% 60%,60% 60%,60% 100%,40% 100%,40% 60%,0 60%,0 40%,40% 40%)",
                    }}
                  />
                  Power-up
                </li>
                <li className="pt-1 text-[11px] text-stone-500">
                  Paint opacity = layer depth (1–4). Space = play/pause, ←/→ =
                  step.
                </li>
              </ul>
            </details>
          </aside>
        </div>
      )}
    </div>
  );
}

function PlayerCard({
  name,
  color,
  stats,
  toMove,
}: {
  name: string;
  color: string;
  stats: { stamina: number; maxStamina: number; territory: number };
  toMove: boolean;
}) {
  const pct =
    stats.maxStamina > 0
      ? Math.max(0, Math.min(100, (stats.stamina / stats.maxStamina) * 100))
      : 0;
  return (
    <div
      className={`rounded-md border bg-surface p-3 transition-colors ${
        toMove ? "border-stone-500" : "border-border"
      }`}
    >
      <div className="flex items-center gap-2">
        <span
          className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ background: color }}
        />
        <span className="truncate text-sm font-semibold text-text">{name}</span>
        {toMove && (
          <span className="ml-auto shrink-0 rounded-full bg-surface-hover px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-stone-300">
            to move
          </span>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="font-mono text-2xl tabular-nums text-text">
          {stats.territory}
        </span>
        <span className="text-[11px] uppercase tracking-wide text-text-muted">
          territory
        </span>
      </div>

      <div className="mt-2">
        <div className="flex justify-between text-[11px] text-text-muted">
          <span>Stamina</span>
          <span className="font-mono tabular-nums">
            {stats.stamina}/{stats.maxStamina}
          </span>
        </div>
        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-surface-hover">
          <div
            className="h-full rounded-full"
            style={{ width: `${pct}%`, background: color }}
          />
        </div>
      </div>
    </div>
  );
}
