/**
 * Architecture diagram for Clarity Coach's two-pipeline design.
 *
 * The point the diagram has to make: one 45-second recording forks into an
 * independent vision path and speech path, which are then fused by an LLM into
 * a single piece of coaching. That fork-join is the interesting part of the
 * build, and it is invisible in a bullet list.
 *
 * Inline SVG so labels stay real text. SVG <text> does not wrap, so every label
 * below is written to fit its box on one line.
 */

const W = 460;
const COL_W = 196;
const LEFT_X = 16;
const RIGHT_X = W - COL_W - 16;
const ROW_H = 54;

type Box = { title: string; sub: string };

const VIDEO: Box[] = [
  { title: "Frames", sub: "MoviePy + OpenCV" },
  { title: "Pose & face mesh", sub: "MediaPipe" },
  { title: "Posture · eye contact", sub: "per-frame scores" },
];

const AUDIO: Box[] = [
  { title: "Transcript", sub: "Whisper" },
  { title: "Delivery analysis", sub: "clarity · pacing · fillers" },
  { title: "Speech signals", sub: "structured output" },
];

const CAPTURE_Y = 8;
const CAPTURE_BOTTOM = CAPTURE_Y + 44;
/** Fork bar sits below the capture box; the column labels sit below the bar. */
const FORK_BAR_Y = CAPTURE_BOTTOM + 14;
const FORK_TOP = CAPTURE_BOTTOM + 38;
const COLS_H = VIDEO.length * ROW_H;
const FUSE_Y = FORK_TOP + COLS_H + 22;
const VOICE_Y = FUSE_Y + 52 + 18;
const HEIGHT = VOICE_Y + 52 + 10;

function Stack({ x, items, accent }: { x: number; items: Box[]; accent: string }) {
  return (
    <>
      {items.map((b, i) => {
        const y = FORK_TOP + i * ROW_H;
        return (
          <g key={b.title}>
            <rect
              x={x}
              y={y}
              width={COL_W}
              height={ROW_H - 12}
              rx="7"
              fill="var(--color-surface)"
              stroke="var(--color-border)"
            />
            <rect x={x} y={y} width="3" height={ROW_H - 12} rx="1.5" fill={accent} />
            <text x={x + 12} y={y + 18} fill="var(--color-text)" fontSize="12" fontWeight="600">
              {b.title}
            </text>
            <text x={x + 12} y={y + 33} fill="var(--color-stone-400)" fontSize="10">
              {b.sub}
            </text>
            {i < items.length - 1 && (
              <line
                x1={x + COL_W / 2}
                y1={y + ROW_H - 12}
                x2={x + COL_W / 2}
                y2={y + ROW_H - 2}
                stroke="var(--color-stone-600)"
                strokeWidth="1.5"
                markerEnd="url(#mm-arrow)"
              />
            )}
          </g>
        );
      })}
    </>
  );
}

export default function MultimodalPipeline({
  className = "",
}: {
  className?: string;
}) {
  const midX = W / 2;
  return (
    <figure className={className}>
      <div className="overflow-x-auto rounded-lg border border-border bg-surface/40 p-4">
        <svg
          viewBox={`0 0 ${W} ${HEIGHT}`}
          className="h-auto w-full min-w-[400px]"
          role="img"
          aria-labelledby="mm-title mm-desc"
        >
          <title id="mm-title">Clarity Coach multimodal pipeline</title>
          <desc id="mm-desc">
            A single 45-second recording forks into two independent pipelines. The
            vision path extracts frames with MoviePy and OpenCV, runs MediaPipe
            pose and face mesh, and scores posture and eye contact. The speech
            path transcribes with Whisper and analyses clarity, pacing and filler
            words. Both feed an LLM that fuses them into structured coaching,
            which is then spoken back through ElevenLabs.
          </desc>

          <defs>
            <marker
              id="mm-arrow"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--color-stone-500)" />
            </marker>
          </defs>

          {/* capture */}
          <rect x={midX - 110} y={CAPTURE_Y} width="220" height="44" rx="7"
            fill="var(--color-surface)" stroke="var(--color-border)" />
          <text x={midX} y={CAPTURE_Y + 20} textAnchor="middle" fill="var(--color-text)" fontSize="12" fontWeight="600">
            45-second recording
          </text>
          <text x={midX} y={CAPTURE_Y + 34} textAnchor="middle" fill="var(--color-stone-400)" fontSize="10">
            MediaRecorder · getUserMedia
          </text>

          {/* fork */}
          <path
            d={`M ${midX} ${CAPTURE_BOTTOM} V ${FORK_BAR_Y}
                M ${LEFT_X + COL_W / 2} ${FORK_BAR_Y} H ${RIGHT_X + COL_W / 2}
                M ${LEFT_X + COL_W / 2} ${FORK_BAR_Y} V ${FORK_TOP - 2}
                M ${RIGHT_X + COL_W / 2} ${FORK_BAR_Y} V ${FORK_TOP - 2}`}
            fill="none" stroke="var(--color-stone-600)" strokeWidth="1.5"
          />

          <text x={LEFT_X} y={FORK_TOP - 7} fill="var(--color-stone-500)" fontSize="9" letterSpacing="0.08em">
            VISION
          </text>
          <text x={RIGHT_X} y={FORK_TOP - 7} fill="var(--color-stone-500)" fontSize="9" letterSpacing="0.08em">
            SPEECH
          </text>

          <Stack x={LEFT_X} items={VIDEO} accent="var(--color-accent)" />
          <Stack x={RIGHT_X} items={AUDIO} accent="#38bdf8" />

          {/* join */}
          <path
            d={`M ${LEFT_X + COL_W / 2} ${FORK_TOP + COLS_H - 12} V ${FUSE_Y - 12}
                H ${RIGHT_X + COL_W / 2} V ${FORK_TOP + COLS_H - 12}
                M ${midX} ${FUSE_Y - 12} V ${FUSE_Y - 2}`}
            fill="none" stroke="var(--color-stone-600)" strokeWidth="1.5"
            markerEnd="url(#mm-arrow)"
          />

          <rect x={midX - 130} y={FUSE_Y} width="260" height="44" rx="7"
            fill="var(--color-surface)" stroke="var(--color-border)" />
          <rect x={midX - 130} y={FUSE_Y} width="3" height="44" rx="1.5" fill="#a78bfa" />
          <text x={midX} y={FUSE_Y + 19} textAnchor="middle" fill="var(--color-text)" fontSize="12" fontWeight="600">
            Fuse into one critique
          </text>
          <text x={midX} y={FUSE_Y + 34} textAnchor="middle" fill="var(--color-stone-400)" fontSize="10">
            Claude · structured output
          </text>

          <line x1={midX} y1={FUSE_Y + 44} x2={midX} y2={VOICE_Y - 2}
            stroke="var(--color-stone-600)" strokeWidth="1.5" markerEnd="url(#mm-arrow)" />

          <rect x={midX - 130} y={VOICE_Y} width="260" height="44" rx="7"
            fill="var(--color-surface)" stroke="var(--color-border)" />
          <text x={midX} y={VOICE_Y + 19} textAnchor="middle" fill="var(--color-text)" fontSize="12" fontWeight="600">
            Spoken coaching, then Q&amp;A
          </text>
          <text x={midX} y={VOICE_Y + 34} textAnchor="middle" fill="var(--color-stone-400)" fontSize="10">
            ElevenLabs · conversational loop
          </text>
        </svg>

        <p className="mt-3 border-t border-border pt-3 text-xs leading-relaxed text-stone-500">
          <span className="font-medium text-stone-400">Why it was hard:</span>{" "}
          frame-by-frame vision on CPU was far too slow for a 36-hour demo, so the
          whole pipeline runs GPU-backed on Modal, with transcription, analysis
          and speech synthesis sequenced rather than raced.
        </p>
      </div>
    </figure>
  );
}
