# yogicapproach.github.io

> **Start here:** [Layout](#layout) for where content lives, [Deploy](#deploy) for how it goes live; planning state is in `.claude/pm/PENDING-TASK.md`.

Public website for Yogic Approach, served by GitHub Pages at the custom domain
[yogicapproach.com](https://yogicapproach.com) (see `CNAME`).

This is a **publish-only** repo: a static, hand-authored HTML/CSS/JS site with no
build system or package manifest. Content is pushed here additively from other
(private) repos — `site-root`, `events`, `talks` — which own their own planning
and issue tracking. Issues opened directly on this repo are for content-facing
concerns raised by site visitors, or for repo-level housekeeping like this one.

## Layout

- `en/`, `es/`, `ne/` — content by language (English, Spanish, Nepali). Coverage
  varies: `en/` currently has `events/`, `retreats/`, and `talks/`; `es/` and
  `ne/` currently have `events/` only.
- `events/`, `retreats/`, `talks/` (repo root) — shared/canonical content roots.
- `assets/` — shared static assets (images, styles, etc.) used across pages.
- `404.html`, `robots.txt`, `sitemap.xml` — standard Pages/SEO files.
- `CNAME` — pins the custom domain; do not remove or repurpose.

The exact relationship between the root-level `events/retreats/talks` and their
`en/` counterparts is being reworked — see
[yogicapproach/site-root#20](https://github.com/yogicapproach/site-root/issues/20)
(URL architecture: move language segment to root path level). Treat the current
layout as transitional rather than a fixed contract.

## Deploy

GitHub Pages builds directly from this repo (no CI build step). Pushing to the
default branch publishes immediately to yogicapproach.com.
