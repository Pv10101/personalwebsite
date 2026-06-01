import type { Metadata } from "next";
import Link from "next/link";
import { projects } from "@/data/projects";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Selected projects spanning interpretability, robustness, medical AI, and competitive programming.",
};

export default function ProjectsPage() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-10">
        Projects
      </h1>
      <div className="space-y-8">
        {projects.map((project) => (
          <Link
            key={project.slug}
            href={`/projects/${project.slug}`}
            className="group block rounded-lg border border-border p-6 transition-colors hover:border-stone-600"
          >
            <h2 className="text-xl font-semibold text-text group-hover:text-accent transition-colors">
              {project.title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-stone-400">
              {project.description}
            </p>
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
            <span className="mt-4 inline-block text-sm font-medium text-accent group-hover:text-accent-hover transition-colors">
              Read more &rarr;
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
