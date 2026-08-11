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

  const writeUp = detail ? (
    <div className="space-y-8">
      {detail.sections.map((section) => (
        <section key={section.heading}>
          <h2 className="text-xl font-semibold text-text mb-3">
            {section.heading}
          </h2>
          <div className="space-y-4 text-stone-300 leading-relaxed">
            {section.body.split("\n\n").map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </section>
      ))}

      {detail.gallery && detail.gallery.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-text mb-3">In the product</h2>
          <ScreenshotGallery shots={detail.gallery} />
        </section>
      )}

      {detail.diagram && (
        <section>
          <h2 className="text-xl font-semibold text-text mb-3">
            {DIAGRAMS[detail.diagram].heading}
          </h2>
          {(() => {
            const { Component } = DIAGRAMS[detail.diagram!];
            return <Component />;
          })()}
        </section>
      )}
    </div>
  ) : (
    <p className="text-stone-300 leading-relaxed">{project.description}</p>
  );

  return (
    <article
      className={`mx-auto px-6 py-20 ${hasDemo ? "max-w-6xl" : "max-w-3xl"}`}
    >
      <Link
        href="/projects"
        className="text-sm text-text-muted hover:text-accent transition-colors"
      >
        &larr; All projects
      </Link>

      <h1 className="mt-6 text-3xl sm:text-4xl font-bold tracking-tight">
        {project.title}
      </h1>

      <div className="mt-4 flex flex-wrap gap-2">
        {project.tags.map((tag) => (
          <span
            key={tag}
            className="inline-block rounded-full bg-surface px-3 py-0.5 text-xs font-medium text-stone-400"
          >
            {tag}
          </span>
        ))}
      </div>

      {detail?.metrics && detail.metrics.length > 0 && (
        <dl className="mt-8 grid gap-3 sm:grid-cols-3">
          {detail.metrics.map((metric) => (
            <div
              key={metric.label}
              className="rounded-lg border border-border bg-surface/40 px-4 py-3"
            >
              {/* Proportional figures: tabular-nums looks loose at display sizes
                  and nothing here has to align in a column. */}
              <dd className="text-2xl font-semibold text-text">
                {metric.value}
              </dd>
              <dt className="mt-1 text-xs font-medium text-stone-400">
                {metric.label}
              </dt>
              {metric.note && (
                <p className="mt-0.5 text-[11px] text-stone-500">
                  {metric.note}
                </p>
              )}
            </div>
          ))}
        </dl>
      )}

      {hasDemo ? (
        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,560px)] lg:items-start">
          <div className="min-w-0">{writeUp}</div>

          {/* Sticky so the replay stays in view while the write-up scrolls. */}
          <aside className="min-w-0 lg:sticky lg:top-8">
            <ReplayPanel
              link={{
                href: "/projects/bytefight/replay",
                label: "Open full size →",
              }}
            />
          </aside>
        </div>
      ) : (
        <div className="mt-10">{writeUp}</div>
      )}

      {project.links && project.links.length > 0 && (
        <div className="mt-10 pt-6 border-t border-border flex gap-4">
          {project.links.map((link) =>
            // Internal routes stay in-tab and use client navigation.
            link.url.startsWith("/") ? (
              <Link
                key={link.label}
                href={link.url}
                className="text-sm font-medium text-accent hover:text-accent-hover transition-colors"
              >
                {link.label} &rarr;
              </Link>
            ) : (
              <a
                key={link.label}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-accent hover:text-accent-hover transition-colors"
              >
                {link.label} &rarr;
              </a>
            ),
          )}
        </div>
      )}
    </article>
  );
}
