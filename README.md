# yogicapproach.github.io

> **Start here:** [Live-site gate](#live-site-gate) before you push anything, [Layout](#layout) for where content lives, [Deploy](#deploy) for how it goes live, [Who publishes here](#who-publishes-here) for the spoke repos.

Public website for Yogic Approach, served by GitHub Pages at the custom domain
[yogicapproach.com](https://yogicapproach.com) (see `CNAME`).

This is a **publish-only** repo: static, hand-authored HTML/CSS/JS with **no build
step, no package manifest and no CI**. What is in the tree is what is served.
Content is pushed here from other repos (see below) which own their own planning
and issue tracking. Issues on this repo are for repo-level housekeeping and for
content-facing concerns raised by site visitors.

## Live-site gate

**`main` is the live site.** There is no staging and no preview: a commit on
`main` is public within a minute or two.

- Never push to `main` directly from an agent session; use a branch and a pull
  request, and let the owner merge.
- Moving or renaming a published path breaks shared links and WhatsApp previews;
  leave a redirect stub at every old path.
- Large media (audio, PDF) is in git and counts against the Pages 1 GB cap — see
  [#10](https://github.com/yogicapproach/yogicapproach.github.io/issues/10)
  before adding more.
- Never commit local tooling output (`graphify-out/`, `.gh-offline-sync/`,
  `.claude/worktrees/`, `.claude/tmp/`): it would be published.

## Layout

- `index.html` — currently a short placeholder ("in the process of migrating")
  linking to the Uruguay 2026 talks. There is no central home page or shared
  navigation yet.
- `en/`, `es/`, `ne/` — content by language (English, Spanish, Nepali). Coverage
  varies: `en/` has `events/`, `retreats/`, `sadhana/`, `talks/`; `es/` and `ne/`
  have `events/` only.
- `events/`, `retreats/`, `talks/`, `sadhana/` (repo root) — language-neutral
  content roots, each with its own `sitemap.xml`/`llms.txt` where present
  (`events/`, `sadhana/`).
- `assets/` — shared static assets (currently `assets/2026-uruguay/`).
- `404.html`, `robots.txt`, `sitemap.xml` — Pages/SEO files; the root
  `sitemap.xml` indexes the per-section sitemaps.
- `CNAME` — pins the custom domain; do not remove or repurpose.
- `.claude/pm/` — planning state for Claude Code sessions (not served content,
  but it is in the published tree).

The relationship between the root-level content roots and their `en/` counterparts
is being reworked — see
[yogicapproach/site-root#20](https://github.com/yogicapproach/site-root/issues/20)
(URL architecture: language segment at root). Treat the current layout as
transitional rather than a fixed contract.

## Deploy

GitHub Pages, "Deploy from a branch": source `main`, path `/`, custom domain
`yogicapproach.com` (checked via the Pages API on 2026-11-09: `build_type: legacy`).
Pushing to `main` publishes; nothing else is needed or run.

## Who publishes here

Recent `main` history is almost entirely `publish(...)` commits from spoke repos:

| Spoke repo | What it publishes |
|---|---|
| `talks` (`yogicapproach/talks`) | class pages under `en/talks/` (Yoga Sutras exploration, Koshas TTC 300) |
| `navaratri-sadhana` | the Navaratri readings deck and `sadhana/` |
| `events` | `events/`, `en|es|ne/events/` pages |
| `site-root` | root files (`sitemap.xml`, `robots.txt`, deploy of the root) |

Because spokes push straight to `main`, a change to site-wide structure can
collide with their next publish — agree it with them first.

## Local changes

Line endings: git stores LF. If `git status` shows a file modified but
`git diff --ignore-cr-at-eol` is empty, it is a CRLF difference only; see
[PR #6](https://github.com/yogicapproach/yogicapproach.github.io/pull/6)
(`.gitattributes`).
