# yogicapproach.github.io

Static site served by GitHub Pages at https://yogicapproach.com (the `CNAME` file). There is no build step in this repo: whatever is committed on `main` is what is served. A push to `main` triggers a Pages rebuild.

## Do not hand-edit published output

Most of this tree is **generated** by other repos and overwritten on their next publish. Edit the source, not the copy here. Source per tree (taken from the commit subjects of each path, `git log --format=%s -- <dir>`):

| Path | Published by | Evidence in git log |
|---|---|---|
| `/` root files, `assets/`, `es/`, `ne/`, `events/` | **site-root** repo | `deploy(site-root): <timestamp> [<sha>]` |
| `retreats/` | **site-root** repo (older deploys) | `deploy(site-root): ...` |
| `en/talks/`, `talks/` | **talks** repo | `publish(talks#N): ...`, `publish: ... (talks #N)` |
| `sadhana/` and the readings deck under `en/` | **navaratri-sadhana** repo | `publish(navaratri-sadhana#69): ...` |

Exceptions: GoatCounter pageview snippets on the readings page were committed directly here (`feat: ... GoatCounter ...`). Re-check the source repo before overwriting those.

## Directory map

- `index.html`, `404.html`, `robots.txt`, `sitemap.xml`, `CNAME`: site root.
- `assets/`: shared assets.
- `en/`, `es/`, `ne/`: the three site languages (English, Spanish, Nepali). Keep them in step.
- `en/talks/koshas-ttc-300-uruguay/`: Koshas TTC-300 notes, with `feedback/` (SurveyJS form; `participant/` page, `survey.json`, `content.json`, `vendor/`).
- `en/talks/yoga-sutras-exploration/`: Yoga Sutras class pages.
- `events/`, `retreats/`, `sadhana/`, `talks/`: section roots.

## Feedback collector

The Koshas participant form posts to the Cloudflare Worker `koshas-feedback` (`https://koshas-feedback.kaanchan.workers.dev/submit`, set as `COLLECTOR_URL` in `en/talks/koshas-ttc-300-uruguay/feedback/participant/index.html`). The Worker source is not in this repo; it was published via the talks repo (commits `publish: feedback form LIVE ... (talks#85)`). Its README/deploy notes live there.

## Deploy model

1. Edit in the source repo (table above) and publish; the publish commit lands here on `main`.
2. GitHub Pages rebuilds from `main`; `CNAME` keeps the custom domain.
3. Never push local tooling (`.claude/` settings, `graphify-out/`) here; the repo is public.
