import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

/** Frontmatter shape for every blog post .md file. */
export interface PostFrontmatter {
  title: string;
  pubDate: string; // ISO date string
  description: string;
  tags?: string[];
}

/** A blog post with parsed frontmatter and the raw Markdown body (no HTML). */
export interface PostMeta extends PostFrontmatter {
  slug: string;
}

/** A fully rendered blog post including the HTML content. */
export interface Post extends PostMeta {
  contentHtml: string;
}

// Posts live in a top-level `posts/` directory at the repo root.
const postsDirectory = path.join(process.cwd(), "posts");

/**
 * Return metadata for every post, sorted newest-first by pubDate.
 * Does NOT render Markdown to HTML — use getPostBySlug for that.
 */
export function getAllPosts(): PostMeta[] {
  const filenames = fs.readdirSync(postsDirectory).filter((f) =>
    f.endsWith(".md")
  );

  const posts = filenames.map((filename) => {
    const slug = filename.replace(/\.md$/, "");
    const filePath = path.join(postsDirectory, filename);
    const fileContents = fs.readFileSync(filePath, "utf-8");
    const { data } = matter(fileContents);

    return {
      slug,
      title: data.title as string,
      pubDate: data.pubDate as string,
      description: data.description as string,
      tags: (data.tags as string[] | undefined) ?? [],
    };
  });

  // Sort newest first
  return posts.sort(
    (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
  );
}

/**
 * Read a single post by slug, parse frontmatter, and render
 * the Markdown body to HTML via remark + remark-html.
 */
export async function getPostBySlug(slug: string): Promise<Post> {
  const filePath = path.join(postsDirectory, `${slug}.md`);
  const fileContents = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(fileContents);

  const processed = await remark().use(html).process(content);
  const contentHtml = processed.toString();

  return {
    slug,
    title: data.title as string,
    pubDate: data.pubDate as string,
    description: data.description as string,
    tags: (data.tags as string[] | undefined) ?? [],
    contentHtml,
  };
}
