import Image from "next/image";
import type { ProjectShot } from "@/data/project-details";

/**
 * Product screenshots for a case study.
 *
 * No lightbox: each shot links to the full-size asset, which costs no client
 * JavaScript and still lets someone read the fine print. Images are lazy by
 * default in Next 16 — `priority` is deprecated in favour of `preload`, and
 * nothing here is above the fold, so neither is set.
 */
export default function ScreenshotGallery({ shots }: { shots: ProjectShot[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {shots.map((shot) => (
        <li key={shot.src} className="min-w-0">
          <figure className="overflow-hidden rounded-lg border border-border bg-surface/40">
            <a href={shot.src} target="_blank" rel="noopener noreferrer">
              <Image
                src={shot.src}
                alt={shot.alt}
                width={shot.width}
                height={shot.height}
                sizes="(min-width: 640px) 45vw, 90vw"
                className="h-auto w-full border-b border-border"
              />
            </a>
            <figcaption className="px-3 py-2 text-xs leading-relaxed text-stone-400">
              {shot.caption}
            </figcaption>
          </figure>
        </li>
      ))}
    </ul>
  );
}
