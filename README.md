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

---

## Next Steps — Portfolio Demo Plan

Plan to maximize the three hackathon projects for SWE + startup recruiters (with ML depth surfaced). Derived from research on each project's links + local source. Priority order reflects impact.

### Strategy at a glance

| Project | Demo approach | Who builds the asset | Status |
| --- | --- | --- | --- |
| **ByteFight Paint Bot** | **Live in-browser match replay** (real bot vs sample-controller matches) + case study | Built from existing replay logs | Repo private → make public showcase repo |
| **Clarity Coach** | **Interactive browser-only live demo** (MediaPipe posture/gaze, no backend) | Built | Linked repo undersells work — needs fix |
| **WatchTower** | Embedded demo **video** + architecture diagram + case study | Pranav records video; page built after | Devpost public; code repo needs cleanup |

---

### 1. ByteFight Paint Bot ⭐ (flagship — lead with this)

The strongest, most on-trend story: a **fully autonomous, self-improving agent**. It runs a closed loop — local scrimmage → live-website scrimmage (Playwright) → analyze weakness across matches → patch one targeted change to `bot.py` → validate against a no-regression gate → auto-upload → scrape new ELO → log — with guardrails (auto-revert on 2 consecutive ELO drops, hard-stop on crashes).

- **Context:** ByteFight 2026 @ Georgia Tech, month-long, $2,000 prize pool, Millennium internship track. `bot.py` ≈ 2,232 lines; git history shows real strategy evolution (breakout mode, dynamic collision defense, beacon placement, hill control, threat analysis). Baseline **ELO 1578, #21/51**.
- **Recruiter framing:** lead with the agentic/automation angle ("an agent that writes and tests its own improvements"), pair with game-AI/strategy depth and the systems story (Playwright automation + CI-style test harness).

**Live demo — feasible (corrected).** A *bot-vs-bot match* does NOT need the competition website or Playwright — only the self-improvement loop does. The full game engine (`player_files/game/board.py`) and a baseline opponent (`sample_controller/controller.py`) are local, and the bot is pure Python + stdlib. Better still, **real match replays already exist on disk** — e.g. `logs/New logs/match-*.json` (full turn-by-turn state: locations, stamina, paint/beacon/hill updates, walls, actions, `map_string`) and `logs/Past logs/misc/all_matches_combined.json` (~2.6MB, many matches). An existing `analyze_replay.py` documents the `map_string` format.

**Demo design:** pre-recorded **real matches** (bot vs sample controller), converted to compact per-turn frames served as static JSON. Clicking the demo loads one of a few curated matches into a React board player. No backend, no cost, deploys static on Vercel — visually live, fully reliable.

**To do:**
- [ ] **To build:** write a converter that turns the existing replay JSON (`logs/New logs/match-*.json` / `all_matches_combined.json`) into compact per-turn frames (grid state per tick) + metadata (map, players, outcome).
- [ ] **To build:** curate a few real **bot vs sample-controller** matches (ideally on different maps) and bundle them as static JSON in `public/`.
- [ ] **To build:** build a **React board-replay player**: renders the grid (paint/walls/hills/beacons/agents), with play/pause, scrub, step, speed; clicking the demo plays one of the bundled matches. Optionally overlay stamina/territory and the action taken each turn.
- [ ] **To build:** wrap it in a case-study page: the self-improvement loop story + architecture diagram + (optional) ELO-progression chart, links to showcase repo.
- [ ] **Pranav:** create a **public showcase repo** — clean subset only (README, architecture write-up, analyze→patch→test loop diagram). Keep the competition bot code private to avoid strategy reuse.
- [ ] **Pranav:** provide **final ELO / ranking** for the progression chart (baseline recorded: 1578, #21/51).

### 2. Clarity Coach (interactive live demo)

AI speaking coach for ESL speakers (TreeHacks 2026): record 45s video → MediaPipe posture/eye-contact/gaze + Whisper speech → Claude structured feedback → ElevenLabs voice coach, on Modal GPU. Multimodal fusion (CV + speech + LLM) is the differentiator.

- ⚠️ **Problem:** the currently linked repo (`SamhitaK10/clarity-coach`) is **only the Node/Express audio backend** — the FastAPI/MediaPipe video pipeline (the impressive CV work) is not there. Recruiters clicking through see a small JS backend and are underwhelmed.

**To do:**
- [ ] **To build:** build a **browser-only live demo** — MediaPipe (JS/WASM) posture + eye-contact/gaze overlay running client-side, **no backend, no API keys**. Scoped-down but genuinely interactive; this is the best live-demo candidate of the three.
- [ ] **Pranav:** confirm & share the **FastAPI/MediaPipe repo** location (or make it public).
- [ ] **To build:** fix the project link so it doesn't point only to the JS backend (link Devpost + both repos, or update repo README).
- [ ] **To build:** case-study page with two-pipeline architecture diagram + screenshot gallery (5 Devpost images) + ESL "1 in 5" product hook.

### 3. WatchTower (demo video)

Single-camera pilot collision-avoidance HUD (TreeHacks 2025): monocular depth (**MiDaS**) + **YOLOv8** → 3D point cloud → collision/dynamics → recommended action, with Arduino IMU sensor fusion. Pranav's role: real-time single-camera depth mapping (strongest ML-depth angle — harder than stereo).

- No live demo feasible (needs 2 cameras + GPU + Arduino). Code repo: `hpuppala26/TreeHacks2025` (public but weak README, committed `/venv`).

**To do:**
- [ ] **Pranav:** record a **30–60s demo video** of the running dashboard (depth overlay + YOLO boxes + collision recommendation); host unlisted on YouTube.
- [ ] **Pranav:** measure & supply **metrics** (inference FPS, per-frame latency) — none exist yet; keep claims qualitative until then.
- [ ] **Pranav:** clean up the public code repo (real README, remove `/venv`) before linking; confirm any TreeHacks placement.
- [ ] **To build:** build case-study page with embedded video slot, architecture diagram (camera → MiDaS + YOLO → point cloud → collision → action), and the 4 existing Devpost screenshots (download now — CloudFront URLs can rot).

---

### Cross-cutting infra

- [ ] Extend the project schema/detail pages to support rich case studies: hero media (video/GIF slot), architecture diagram, "ML deep-dive" callout, metrics band, screenshot gallery, multiple links.
- [ ] Add a reusable client-side MediaPipe demo component (used by Clarity Coach; pattern reusable later).
- [ ] Download & self-host all Devpost screenshots into `public/` (avoid CloudFront link rot).

### Assets needed from Pranav (checklist)

- [ ] ByteFight: public showcase repo, final ELO/ranking (live replay is built from existing match logs — no GIF needed)
- [ ] Clarity Coach: FastAPI/MediaPipe repo location
- [ ] WatchTower: demo video, FPS/latency metrics, repo cleanup, TreeHacks placement
