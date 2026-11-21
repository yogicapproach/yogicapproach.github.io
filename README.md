# yogicapproach.github.io

Public website for Yogic Approach, served by GitHub Pages at
[yogicapproach.com](https://yogicapproach.com) (the `CNAME` file pins the domain).

This repo is **publish-only**: static HTML/CSS/JS with no build step, no package
manifest and no CI. Whatever is on `main` is what is served, and a push to `main`
is public within a minute or two. Other repos build the content and publish it
here; they own the planning and the issues for it. Issues on this repo are for
housekeeping and for problems visitors report.

> **Start here:** [Who publishes what](#who-publishes-what) before you edit
> anything, [Rules for changes](#rules-for-changes) before you push, and
> [Layout](#layout) to find a file.

## Who publishes what

Almost every commit on `main` is a `publish(...)` or `deploy(...)` commit from one
of these repos. **Edit the source repo and republish; a hand edit here is
overwritten by that repo's next publish.**

| Path | Source repo | Commit subject to look for |
|---|---|---|
| `/` root files (`index.html`, `robots.txt`, `sitemap.xml`), `assets/`, `es/`, `ne/`, `events/`, `retreats/` | `site-root` | `deploy(site-root): <timestamp> [<sha>]` |
| `en/talks/`, `talks/` | `talks` | `publish(talks#N): ...` |
| `sadhana/` and the readings deck under `en/sadhana/` | `navaratri-sadhana` | `publish(navaratri-sadhana#N): ...` |
| `en/events/`, `es/events/`, `ne/events/` | `events` (through `site-root`) | `deploy(site-root): ...` |

One exception: the GoatCounter snippets on the readings page were committed
directly here. Check the source repo before overwriting them.

## Rules for changes

- **Pipelines may push to `main`; agent sessions in this repo may not.** The
  publish pipelines above push straight to `main`. Any other change, by a person
  or an agent, goes through a branch and a pull request (`Refs #N`, never
  `Fixes`), and the owner merges.
- **Do not move or rename a published path.** It breaks shared links and WhatsApp
  previews. Leave a redirect stub at every old path.
- **A site-wide change (shell, URL structure) needs the publishing repos'
  agreement first**, because it collides with their next publish.
- **Large media counts against the Pages limit of 1 GB.** The tree is about
  230 MB; see [#10](https://github.com/yogicapproach/yogicapproach.github.io/issues/10)
  before adding more audio or PDFs.
- **The repo is public.** Never commit `.claude/settings*.json`, tokens, local
  paths or tool output (`graphify-out/`, `.gh-offline-sync/`, `.claude/worktrees/`,
  `.claude/tmp/`, `.vscode/`).
- **Keep English, Spanish and Nepali in step.** Devanagari text is NFC UTF-8 only.

## Layout

- `index.html`: a short placeholder ("in the process of migrating") linking to the
  Uruguay 2026 talks. There is no home page or shared navigation yet; the proposals
  are in [site-root#38](https://github.com/yogicapproach/site-root/issues/38).
- `404.html`, `robots.txt`, `sitemap.xml`: Pages and SEO files. The root
  `sitemap.xml` is an index of the per-section sitemaps.
- `CNAME`: the custom domain. Do not remove or repurpose it.
- `en/`, `es/`, `ne/`: content by language. `en/` has `events/`, `retreats/`,
  `sadhana/` and `talks/`; `es/` and `ne/` have `events/` only.
  - `en/talks/koshas-ttc-300-uruguay/`: the Koshas TTC-300 reader, sessions,
    transcript, glossary, graph and resources. Its `feedback/participant/` folder
    holds the survey form and the only copy of SurveyJS (`vendor/`).
  - `en/talks/yoga-sutras-exploration/`: the Yoga Sutras class pages.
- `events/`, `retreats/`, `talks/`, `sadhana/` at the repo root: language-neutral
  section roots. `events/`, `sadhana/` and `talks/` carry their own
  `sitemap.xml` and `llms.txt`. The root-level paths and their `en/` counterparts
  are being reworked
  ([site-root#20](https://github.com/yogicapproach/site-root/issues/20)), so treat
  this layout as transitional.
- `assets/`: shared static assets (currently `assets/2026-uruguay/`).
- `.claude/pm/`: planning notes for Claude Code sessions. It is not site content,
  but it is in the published tree.

## Deploy

GitHub Pages, "Deploy from a branch": source `main`, path `/`, custom domain
`yogicapproach.com` (Pages API check on 2026-11-09: `build_type: legacy`).
Pushing to `main` publishes; nothing else is run. `CNAME` keeps the domain.

## Feedback collector

The Koshas participant form posts to the Cloudflare Worker `koshas-feedback`
(`https://koshas-feedback.kaanchan.workers.dev/submit`, set as `COLLECTOR_URL` in
`en/talks/koshas-ttc-300-uruguay/feedback/participant/index.html`). The Worker
source is not in this repo; it is in the `talks` repo (`publish: feedback form LIVE
... (talks#85)`), with its README and deploy notes.

## Line endings

Git stores LF (see `.gitattributes`). If `git status` shows a file as modified but
`git diff --ignore-cr-at-eol` is empty, the difference is CRLF only. Staging the
file clears it.
