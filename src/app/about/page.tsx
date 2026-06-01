import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "About Pranav — machine learning researcher and engineer based in Atlanta.",
};

export default function AboutPage() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-10">
        About
      </h1>
      <div className="space-y-5 text-stone-300 leading-relaxed">
        <p>
          I am a machine learning researcher and engineer based in Atlanta. I
          completed my BS in computer science at Georgia Tech with
          concentrations in intelligence and people, and I am continuing into
          the Georgia Tech MSCS program.
        </p>
        <p>
          My research focuses on understanding what models actually learn. Most
          recently I have worked on interpretability for graph neural networks,
          using Shapley-based attribution to study how individual neurons
          contribute to model behavior across architectures and datasets. I am
          drawn to questions of robustness as well, particularly how models can
          be trained to generalize across environments rather than memorize the
          quirks of a single data source.
        </p>
        <p>
          Alongside research I build. I have shipped projects under hackathon
          deadlines, written training pipelines for clinical prediction, and
          developed competitive game-playing agents. I like problems that have
          hard constraints, because constraints force you to understand the
          system instead of brute forcing it.
        </p>
        <p>
          I have spent two semesters as a lead undergraduate teaching assistant,
          and teaching has shaped how I think. I believe dense research ideas
          can be made accessible without losing rigor, and that explaining
          something clearly is a real test of whether you understand it.
        </p>
        <p>
          Outside of work I play FromSoftware games, go to concerts, and cook.
          I care about contributing to AI research ethics, and about building a
          career that supports travel, family, and steady ground to stand on.
        </p>
      </div>
    </article>
  );
}
