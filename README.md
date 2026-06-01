# Personal Portfolio & Blog

Next.js personal website with a Markdown-based blog, RSS feed, and sitemap.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Add a blog post

1. Create a new `.md` file in the `posts/` directory (e.g. `posts/my-post.md`).
2. Add frontmatter at the top:
   ```yaml
   ---
   title: "My Post Title"
   pubDate: 2026-06-15
   description: "A short summary shown on the blog index."
   tags: ["topic"]
   ---
   ```
3. Write the post body in Markdown below the frontmatter.
4. Commit and push. The slug is derived from the filename (`my-post.md` becomes `/blog/my-post`).

## Add a project

Edit `src/data/projects.ts` and add a new entry to the `projects` array with `title`, `description`, `tags`, and optional `links`.

## Deploy to Vercel

1. Push the repo to GitHub.
2. Import the repository in [Vercel](https://vercel.com/new).
3. Vercel auto-detects Next.js — no special config needed.
4. After deploy, update `SITE_URL` in `src/app/rss.xml/route.ts` and `src/app/sitemap.ts` with your production domain.

## Placeholders to fill in

- `[REPLACE_WITH_LAST_NAME]` in `src/app/page.tsx`
- `YOUR_EMAIL`, `YOUR_GITHUB_URL`, `YOUR_LINKEDIN_URL` in `src/app/contact/page.tsx`
- Each `REPLACE_WITH_LINK` in `src/data/projects.ts`
- `SITE_URL` in `src/app/rss.xml/route.ts` and `src/app/sitemap.ts`

## Tech stack

- Next.js 16 (App Router)
- TypeScript (strict)
- Tailwind CSS v4
- gray-matter + remark/remark-html for Markdown
- feed for RSS generation
