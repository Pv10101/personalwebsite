import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { projects } from "@/data/projects";
import { projectDetails } from "@/data/project-details";
import { ReplayPanel } from "@/components/bytefight";
import SelfImprovementLoop from "@/components/case-study/SelfImprovementLoop";
import MultimodalPipeline from "@/components/case-study/MultimodalPipeline";
import ScreenshotGallery from "@/components/case-study/ScreenshotGallery";
import type { ProjectDiagram } from "@/data/project-details";

/** Diagram key -> component + the heading it sits under. */
const DIAGRAMS: Record<
  ProjectDiagram,
  { heading: string; Component: (props: { className?: string }) => React.JSX.Element }
> = {
  "bytefight-loop": {
    heading: "How the loop works",
    Component: SelfImprovementLoop,
  },
  "clarity-coach-pipeline": {
    heading: "How the pipeline works",
    Component: MultimodalPipeline,
  },
};

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) return { title: "Project Not Found" };
  return {
    title: project.title,
    description: project.description,
  };
}

export default async function ProjectDetail({ params }: Props) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();

  const detail = projectDetails[slug];
  const hasDemo = detail?.demo !== undefined;
  // With nothing to put in the rail, the two-column grid would reserve an empty
  // 15rem column and shove the content sideways for no reason.
  const hasRail =
    (detail?.facts?.length ?? 0) > 0 ||
    (detail?.metrics?.length ?? 0) > 0 ||
    (project.links?.length ?? 0) > 0;

  const writeUp = detail ? (
    <div className="space-y-12">
      {/* Prose stays near 68ch even though the column is wider — media below
          is allowed to use the full width, which is what makes it read as a
          deliberate layout rather than a short line length. */}
      <div className="max-w-[68ch] space-y-8">
        {detail.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="mb-3 text-xl font-semibold text-text text-balance">
              {section.heading}
            </h2>
            <div className="space-y-4 leading-relaxed text-stone-300">
              {section.body.split("\n\n").map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </section>
        ))}
      </div>

      {detail.gallery && detail.gallery.length > 0 ? (
        <section>
          <h2 className="text-xl font-semibold text-text mb-3">In the product</h2>
          <ScreenshotGallery shots={detail.gallery} />
        </section>
      ) : null}

      {detail.diagram ? (
        <section>
          <h2 className="text-xl font-semibold text-text mb-3">
            {DIAGRAMS[detail.diagram].heading}
          </h2>
          {(() => {
            const { Component } = DIAGRAMS[detail.diagram!];
            return <Component />;
          })()}
        </section>
      ) : null}
    </div>
  ) : (
    <p className="text-stone-300 leading-relaxed">{project.description}</p>
  );

  const linkClass =
    "text-sm font-medium text-accent hover:text-accent-hover transition-colors";

  return (
    <article className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
      {/* ---- masthead: spans the full measure ------------------------------ */}
      <header className="max-w-[68ch]">
        <Link
          href="/projects"
          className="font-mono text-[11px] uppercase tracking-[0.12em] text-text-muted transition-colors hover:text-accent"
        >
          &larr; All projects
        </Link>

        <h1 className="mt-5 text-4xl font-bold tracking-tight text-balance sm:text-5xl">
          {project.title}
        </h1>

        {/* Falls back to the card description so every project gets a lede
            without one having to be written twice. */}
        <p className="mt-5 text-lg leading-relaxed text-stone-300 text-pretty">
          {detail?.lede ?? project.description}
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="inline-block rounded-full bg-surface px-3 py-0.5 text-xs font-medium text-stone-400"
            >
              {tag}
            </span>
          ))}
        </div>
      </header>

      {/*
        Two columns rather than one narrow one. Prose has to stay near 68ch to
        stay readable, so the leftover width goes to a rail of reference
        material — facts, figures, links — instead of sitting empty. The rail
        sticks, so those stay to hand while the write-up scrolls.
      */}
      <div
        className={`mt-12 grid gap-y-10 border-t border-border pt-10 lg:items-start lg:gap-x-16 ${
          hasRail ? "lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]" : ""
        }`}
      >
        <aside
          className={`space-y-8 lg:sticky lg:top-8 ${hasRail ? "" : "hidden"}`}
        >
          {detail?.facts && detail.facts.length > 0 ? (
            <dl className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4 lg:grid-cols-1">
              {detail.facts.map((fact) => (
                <div key={fact.label} className="min-w-0">
                  <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-text-muted">
                    {fact.label}
                  </dt>
                  <dd className="mt-1 text-sm leading-snug text-stone-300">
                    {fact.value}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}

          {detail?.metrics && detail.metrics.length > 0 ? (
            <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3 lg:grid-cols-1">
              {detail.metrics.map((metric) => (
                <div key={metric.label} className="bg-surface/60 px-4 py-3">
                  {/* Proportional figures: tabular-nums looks loose at display
                      sizes and nothing here aligns in a column. */}
                  <dd className="text-2xl font-semibold leading-none text-text">
                    {metric.value}
                  </dd>
                  <dt className="mt-2 text-xs font-medium leading-snug text-stone-400">
                    {metric.label}
                  </dt>
                  {metric.note ? (
                    <p className="mt-1 text-[11px] leading-snug text-stone-500">
                      {metric.note}
                    </p>
                  ) : null}
                </div>
              ))}
            </dl>
          ) : null}

          {project.links && project.links.length > 0 ? (
            <div className="flex flex-col gap-2 border-t border-border pt-5">
              {project.links.map((link) =>
                // Internal routes stay in-tab and use client navigation.
                link.url.startsWith("/") ? (
                  <Link key={link.label} href={link.url} className={linkClass}>
                    {link.label} &rarr;
                  </Link>
                ) : (
                  <a
                    key={link.label}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkClass}
                  >
                    {link.label} &rarr;
                  </a>
                ),
              )}
            </div>
          ) : null}
        </aside>

        <div className="min-w-0 space-y-12">
          {hasDemo ? (
            <ReplayPanel
              link={{
                href: "/projects/bytefight/replay",
                label: "Open full size →",
              }}
            />
          ) : null}
          {writeUp}
        </div>
      </div>
    </article>
  );
}
