/**
 * Architecture diagram for the ByteFight self-improvement loop.
 *
 * Inline SVG rather than an image: it stays sharp at any width, needs no asset
 * pipeline, and the labels stay real text (selectable, searchable, readable by
 * a screen reader via the title/desc pair).
 *
 * Laid out vertically so it reads correctly in a ~500px column without the
 * caller having to special-case narrow layouts.
 */

/**
 * SVG <text> does not wrap, so each `body` must fit BOX_W on one line —
 * roughly 52 characters at 11px. Keep them short rather than truncating,
 * since a clipped half-sentence reads as a bug.
 */
const STEPS = [
  {
    title: "Scrimmage",
    body: "Playwright queues matches vs higher-ranked bots.",
  },
  {
    title: "Analyze the batch",
    body: "Find the one pattern behind most of the losses.",
  },
  {
    title: "Patch one thing",
    body: "A single change, so the result stays attributable.",
  },
  {
    title: "Validate",
    body: "Run the no-regression gate before shipping.",
  },
  {
    title: "Upload & record ELO",
    body: "Re-upload, scrape the new rating, log the run.",
  },
] as const;

const BOX_W = 300;
const BOX_H = 62;
const GAP = 26;
const LEFT = 74;
const TOP = 12;
const WIDTH = 420;
const HEIGHT = TOP + STEPS.length * (BOX_H + GAP) + 4;

export default function SelfImprovementLoop({
  className = "",
}: {
  className?: string;
}) {
  return (
    <figure className={className}>
      <div className="overflow-x-auto rounded-lg border border-border bg-surface/40 p-4">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="h-auto w-full min-w-[340px]"
          role="img"
          aria-labelledby="loop-title loop-desc"
        >
          <title id="loop-title">The ByteFight self-improvement loop</title>
          <desc id="loop-desc">
            A five-stage cycle: scrimmage against stronger bots, analyze the
            batch for the dominant loss pattern, patch exactly one strategy
            change, validate against a no-regression gate, then upload and
            record the new ELO. The cycle then repeats.
          </desc>

          <defs>
            <marker
              id="loop-arrow"
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

          {STEPS.map((step, i) => {
            const y = TOP + i * (BOX_H + GAP);
            const isLast = i === STEPS.length - 1;
            return (
              <g key={step.title}>
                <rect
                  x={LEFT}
                  y={y}
                  width={BOX_W}
                  height={BOX_H}
                  rx="8"
                  fill="var(--color-surface)"
                  stroke="var(--color-border)"
                />
                {/* Accent spine marks the happy path down the stack. */}
                <rect
                  x={LEFT}
                  y={y}
                  width="3"
                  height={BOX_H}
                  rx="1.5"
                  fill="var(--color-accent)"
                />
                <text
                  x={LEFT + 16}
                  y={y + 24}
                  fill="var(--color-text)"
                  fontSize="14"
                  fontWeight="600"
                >
                  {`${i + 1}. ${step.title}`}
                </text>
                <text
                  x={LEFT + 16}
                  y={y + 44}
                  fill="var(--color-stone-400)"
                  fontSize="11"
                >
                  {step.body}
                </text>

                {!isLast && (
                  <line
                    x1={LEFT + BOX_W / 2}
                    y1={y + BOX_H}
                    x2={LEFT + BOX_W / 2}
                    y2={y + BOX_H + GAP - 4}
                    stroke="var(--color-stone-600)"
                    strokeWidth="1.5"
                    markerEnd="url(#loop-arrow)"
                  />
                )}
              </g>
            );
          })}

          {/* Feedback edge: last step back up to the first. */}
          <path
            d={`M ${LEFT} ${TOP + (STEPS.length - 1) * (BOX_H + GAP) + BOX_H / 2}
                H 34 V ${TOP + BOX_H / 2} H ${LEFT - 6}`}
            fill="none"
            stroke="var(--color-stone-600)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            markerEnd="url(#loop-arrow)"
          />
          <text
            x="30"
            y={HEIGHT / 2}
            fill="var(--color-stone-500)"
            fontSize="10"
            textAnchor="middle"
            transform={`rotate(-90 30 ${HEIGHT / 2})`}
          >
            next iteration
          </text>
        </svg>

        <p className="mt-3 border-t border-border pt-3 text-xs leading-relaxed text-stone-500">
          <span className="font-medium text-stone-400">Guard rails:</span> one
          strategy change per iteration, automatic revert after two consecutive
          ELO drops, and a hard stop if the bot crashes.
        </p>
      </div>
    </figure>
  );
}
