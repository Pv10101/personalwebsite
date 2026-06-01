import { Feed } from "feed";
import { getAllPosts } from "@/lib/posts";

const SITE_URL = "https://example.com"; // Replace with your real domain after deploy

export async function GET() {
  const posts = getAllPosts();

  const feed = new Feed({
    title: "Pranav — Blog",
    description:
      "Writing about machine learning, interpretability, robustness, and engineering.",
    id: SITE_URL,
    link: SITE_URL,
    language: "en",
    copyright: `All rights reserved ${new Date().getFullYear()}, Pranav`,
    author: {
      name: "Pranav",
      link: SITE_URL,
    },
  });

  for (const post of posts) {
    feed.addItem({
      title: post.title,
      id: `${SITE_URL}/blog/${post.slug}`,
      link: `${SITE_URL}/blog/${post.slug}`,
      description: post.description,
      date: new Date(post.pubDate),
    });
  }

  return new Response(feed.rss2(), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
