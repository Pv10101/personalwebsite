import Link from "next/link";

export default function Home() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-24 sm:py-32">
      <p className="text-sm font-medium tracking-widest uppercase text-accent mb-4">
        Hello, I&apos;m
      </p>
      <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-text leading-tight">
        Pranav{" "}
        <span className="text-text-muted">Dhawale</span>
      </h1>
      <p className="mt-4 text-lg text-accent font-medium">
        Machine learning researcher and engineer working at the intersection of
        interpretability, robustness, and real-world deployment.
      </p>
      <p className="mt-6 text-base leading-relaxed text-stone-300 max-w-2xl">
        I am a computer science graduate from Georgia Tech, continuing into the
        MSCS program. My work sits between research and engineering. I study how
        machine learning models behave internally and build systems that hold up
        when they leave the lab. I care about making models more interpretable,
        more robust under distribution shift, and more trustworthy in settings
        where the stakes are real, like medical AI.
      </p>
      <div className="mt-10 flex gap-4">
        <Link
          href="/projects"
          className="inline-flex items-center px-5 py-2.5 rounded-md bg-accent text-stone-950 text-sm font-semibold hover:bg-accent-hover transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg"
        >
          Projects
        </Link>
        <Link
          href="/blog"
          className="inline-flex items-center px-5 py-2.5 rounded-md border border-border text-text text-sm font-semibold hover:bg-surface-hover transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg"
        >
          Blog
        </Link>
      </div>
    </section>
  );
}
