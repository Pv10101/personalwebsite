import Link from "next/link";
import ReplayPlayer from "./ReplayPlayer";

interface ReplayPanelProps {
  /** The one thing that differs between the embedded and full-size views. */
  link: { href: string; label: string };
  className?: string;
}

/**
 * The replay viewer plus its framing (heading, link, caption).
 *
 * Both the embedded project-page view and the full-size page render THIS, so the
 * two cannot drift apart. Only the surrounding container width and the link differ.
 */
export default function ReplayPanel({ link, className = "" }: ReplayPanelProps) {
  return (
    <div className={`rounded-lg border border-border bg-surface/40 p-4 ${className}`}>
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
          Live match replay
        </h2>
        <Link
          href={link.href}
          className="text-xs text-accent hover:text-accent-hover transition-colors"
        >
          {link.label}
        </Link>
      </div>

      <ReplayPlayer poster showPicker={false} />

      <p className="mt-3 text-xs leading-relaxed text-stone-500">
        Real recorded matches, converted frame by frame from the engine&rsquo;s
        own logs. Paint depth, hill control, beacons and power-ups are all
        reconstructed exactly as they were played.
      </p>
    </div>
  );
}
