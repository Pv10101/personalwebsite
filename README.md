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

Only one left — the rest are done.

- [ ] `SITE_URL` is still `https://example.com` in `src/app/rss.xml/route.ts` and
      `src/app/sitemap.ts`. **Until this is set, the RSS feed and sitemap emit
      example.com URLs**, so both are wrong the moment the site is deployed.

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
| **ByteFight Paint Bot** | **Live in-browser match replay** (4 real recorded wins) + case study | Built from existing replay logs | ✅ **Shipped.** Awaiting final ELO + public showcase repo |
| **Clarity Coach** | Case study: pipeline diagram + self-hosted screenshot gallery | Built | ✅ **Shipped.** Live MediaPipe demo **dropped** (see below) |
| **WatchTower** | Embedded demo **video** + architecture diagram + case study | Pranav records video; page built after | ⏸ **Blocked** on video + metrics |

---

### 1. ByteFight Paint Bot ⭐ (flagship — lead with this)

The strongest, most on-trend story: a **fully autonomous, self-improving agent**. It runs a closed loop — local scrimmage → live-website scrimmage (Playwright) → analyze weakness across matches → patch one targeted change to `bot.py` → validate against a no-regression gate → auto-upload → scrape new ELO → log — with guardrails (auto-revert on 2 consecutive ELO drops, hard-stop on crashes).

- **Context:** ByteFight 2026 @ Georgia Tech, month-long, $2,000 prize pool, Millennium internship track. `bot.py` ≈ 2,232 lines; git history shows real strategy evolution (breakout mode, dynamic collision defense, beacon placement, hill control, threat analysis). Baseline **ELO 1578, #21/51**.
- **Recruiter framing:** lead with the agentic/automation angle ("an agent that writes and tests its own improvements"), pair with game-AI/strategy depth and the systems story (Playwright automation + CI-style test harness).

**Live demo — feasible (corrected).** A *bot-vs-bot match* does NOT need the competition website or Playwright — only the self-improvement loop does. The full game engine (`player_files/game/board.py`) and a baseline opponent (`sample_controller/controller.py`) are local, and the bot is pure Python + stdlib. Better still, **real match replays already exist on disk** — e.g. `logs/New logs/match-*.json` (full turn-by-turn state: locations, stamina, paint/beacon/hill updates, walls, actions, `map_string`) and `logs/Past logs/misc/all_matches_combined.json` (~2.6MB, many matches). An existing `analyze_replay.py` documents the `map_string` format.

**Demo design:** pre-recorded **real matches** (bot vs sample controller), converted to compact per-turn frames served as static JSON. Clicking the demo loads one of a few curated matches into a React board player. No backend, no cost, deploys static on Vercel — visually live, fully reliable.

**Done:**
- [x] **Converter** — `scripts/bytefight/convert.py`, spec in `scripts/bytefight/CONTRACT.md`.
- [x] **Curation** — 4 real wins bundled in `public/bytefight/` (21×21, 27×27, 31×31).
- [x] **Replay player** — `src/components/bytefight/`, canvas-rendered, poster-gated.
- [x] **Case study** — loop diagram + metrics band on `/projects/bytefight`.

**Still open:**
- [ ] **Pranav:** create a **public showcase repo** — clean subset only. Keep the
      competition bot private. *The old link `Pv10101/bytefightbot` 404s and has
      been removed from the site; the project currently links to the replay instead.*
- [ ] **Pranav:** provide **final ELO / ranking**. Metrics are baseline-only
      (1578, #21/51) until then — no improvement figure is claimed anywhere.
- [ ] **To build:** ELO-progression chart, once the number exists.

### 2. Clarity Coach (interactive live demo)

AI speaking coach for ESL speakers (TreeHacks 2026): record 45s video → MediaPipe posture/eye-contact/gaze + Whisper speech → Claude structured feedback → ElevenLabs voice coach, on Modal GPU. Multimodal fusion (CV + speech + LLM) is the differentiator.

- ⚠️ **Problem (addressed):** the linked repo (`SamhitaK10/clarity-coach`) is **only the Node/Express audio backend** — the FastAPI/MediaPipe video pipeline is not there. It is now labelled "Audio backend repo" so the link no longer oversells itself, and Devpost leads instead.

**Done:**
- [x] **Case study** — two-pipeline diagram (`MultimodalPipeline`) + metrics band.
- [x] **Screenshot gallery** — 5 Devpost images self-hosted in `public/clarity-coach/`
      (6.4 MB PNG → 135 KB WebP).
- [x] **Links fixed** — see the Devpost finding below.

**Dropped:**
- ~~Browser-only MediaPipe live demo.~~ Decided against on 2026-08-10. It is
  buildable client-side with no backend or keys, but it cannot be verified
  without a real webcam and a real face, and the case study reads well without
  it. Revisit only if a live demo becomes necessary.

**Still open:**
- [ ] **Pranav:** confirm & share the **FastAPI/MediaPipe repo** location (or make it public).
      This is the impressive CV work and nothing currently links to it.

### 3. WatchTower (demo video)

Single-camera pilot collision-avoidance HUD (TreeHacks 2025): monocular depth (**MiDaS**) + **YOLOv8** → 3D point cloud → collision/dynamics → recommended action, with Arduino IMU sensor fusion. Pranav's role: real-time single-camera depth mapping (strongest ML-depth angle — harder than stereo).

- No live demo feasible (needs 2 cameras + GPU + Arduino). Code repo: `hpuppala26/TreeHacks2025` (public but weak README, committed `/venv`).

**To do:**
- [ ] **Pranav:** record a **30–60s demo video** of the running dashboard (depth overlay + YOLO boxes + collision recommendation); host unlisted on YouTube.
- [ ] **Pranav:** measure & supply **metrics** (inference FPS, per-frame latency) — none exist yet; keep claims qualitative until then.
- [ ] **Pranav:** clean up the public code repo (real README, remove `/venv`) before linking; confirm any TreeHacks placement.
- [ ] **To build:** build case-study page with embedded video slot, architecture diagram (camera → MiDaS + YOLO → point cloud → collision → action), and the 4 existing Devpost screenshots (download now — CloudFront URLs can rot). *Unblocked in part: the diagram, screenshots and metrics band can all be built before the video exists.*

---

### Cross-cutting infra

`ProjectDetail` (`src/data/project-details.ts`) now drives the detail page. Adding
a case study is a data change plus, at most, one diagram component.

- [x] `demo` — switches to a two-column layout with an interactive demo pinned right.
- [x] `diagram` — keyed registry, one entry per architecture diagram.
- [x] `metrics` — stat-tile band under the title.
- [x] `gallery` — self-hosted screenshots with alt text and captions.
- [x] Devpost screenshots self-hosted for Clarity Coach.
- [ ] Hero media slot (video/GIF) — **needed for WatchTower**, not built yet.
- [ ] "ML deep-dive" callout.
- [ ] Self-host WatchTower's 4 Devpost screenshots.

### Assets needed from Pranav (checklist)

- [ ] **ByteFight:** public showcase repo, final ELO/ranking
- [ ] **Clarity Coach:** FastAPI/MediaPipe repo location
- [ ] **WatchTower:** demo video, FPS/latency metrics, repo cleanup, TreeHacks placement
- [ ] **Neuron Shapley:** make `Pv10101/GCNS` public (link removed — it 404s)
- [ ] **Site-wide:** production domain for `SITE_URL`

---

## Findings & decisions

Things discovered while building that are not obvious from the code.

### Link rot and wrong links

- `Pv10101/bytefightbot` and `Pv10101/GCNS` **both return 404** to logged-out
  visitors. Both links were removed with a restore comment at the call site. A
  dead link on a recruiter-facing page is worse than no link.
- `devpost.com/software/clarity-coach` is **a different project** — a Flutter app
  by another author from RevenueCat Shipyard 2026. The real TreeHacks entry is
  **`clarity-coach-1oxkvl`**. Verify Devpost slugs against the team list; do not
  infer them from the project name.

### ByteFight replay data

- The competition record against top-ELO opponents is roughly **5 wins to 43+
  losses**. The four shipped replays are *curated highlights*, not a
  representative sample. Frame the page around the self-improvement loop, which
  is the genuinely impressive part — never around a win rate.
- Most logs do **not** record which engine slot was ours. The four curated
  matches are confirmed P1 wins; do not add more without confirming attribution.
- Replay format was reverse-engineered: paint sign = owner (+P1/−P2), magnitude =
  layers; `parity_playing` is `1`/`-1`/`0`, not `0`/`1`. Full spec in `CONTRACT.md`.
- `test_convert.py` converts the whole corpus and asserts territory counts match
  the engine's own: **343/345 pass exactly**. The 2 failures are synthetic engine
  test maps where a beacon on an unpainted cell counts as territory but is
  recorded in `beacon_updates`. No curated match is affected.
- Replays are public now, and they reveal move-by-move strategy. Fine given the
  competition ended, but worth knowing before adding more.

### Privacy

- The Clarity Coach screenshots include a **teammate's face, first name, and a
  critique of her speaking**. Already public on the team's own Devpost, so
  re-hosting is not a new disclosure — but it is a judgement call worth revisiting.

### Repo hygiene

- **Never run `npm run build` while a dev server is running.** Both write to
  `.next/`, and the build clobbers the dev server's state mid-session. The
  symptom is a misleading `Jest worker encountered 2 child process exceptions`
  runtime error and a `(stale)` badge in the error overlay. Fix: stop the dev
  server, `rm -rf .next`, restart.
- Commits in this repo carry **no `Co-Authored-By` trailer** — sole authorship.
