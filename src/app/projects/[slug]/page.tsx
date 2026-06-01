import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { projects } from "@/data/projects";
import { projectDetails } from "@/data/project-details";

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

  return (
    <article className="mx-auto max-w-3xl px-6 py-20">
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

      {detail ? (
        <div className="mt-10 space-y-8">
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
        </div>
      ) : (
        <p className="mt-8 text-stone-300 leading-relaxed">
          {project.description}
        </p>
      )}

      {project.links && project.links.length > 0 && (
        <div className="mt-10 pt-6 border-t border-border flex gap-4">
          {project.links.map((link) => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-accent hover:text-accent-hover transition-colors"
            >
              {link.label} &rarr;
            </a>
          ))}
        </div>
      )}
    </article>
  );
}
