import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Blog",
  description: "Writing about machine learning, interpretability, robustness, and engineering.",
};

export default function BlogIndex() {
  const posts = getAllPosts();

  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-10">
        Blog
      </h1>
      {posts.length === 0 ? (
        <p className="text-text-muted">No posts yet. Check back soon.</p>
      ) : (
        <ul className="space-y-8">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link href={`/blog/${post.slug}`} className="group block">
                <time className="text-xs font-medium text-text-muted tracking-wide uppercase">
                  {new Date(post.pubDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
                <h2 className="mt-1 text-xl font-semibold text-text group-hover:text-accent transition-colors">
                  {post.title}
                </h2>
                <p className="mt-2 text-sm text-stone-400 leading-relaxed">
                  {post.description}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
