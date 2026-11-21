# yogicapproach.github.io

Global rules live in ~/.claude/CLAUDE.md (mooladhara config/global) and apply in full.
`README.md` has the layout, the publishing table and the rules for changes; read it first.

## What this repo is

Public GitHub Pages site for https://yogicapproach.com. No build step, no CI, no staging:
`main` IS the live site. Other repos generate almost all of it.

## Rules

- **Live site is read-only for agents.** Work on a branch or worktree, open a PR
  (`Refs #N`, never `Fixes`), and let KA merge. Never push to `main` from an agent session.
  The publish pipelines (`site-root`, `talks`, `navaratri-sadhana`) are the exception: they
  push `publish(...)` / `deploy(...)` commits to `main` by design.
- **Do not hand-edit published output.** Fix the source repo and republish; the next publish
  overwrites a hand edit. A site-shell or URL-structure change needs the publishing repos'
  agreement first.
- **Keep a redirect stub at any moved URL.**
- **This repo is public.** Never commit `.claude/settings*.json`, tokens, local paths or tool
  output (`graphify-out/`, `.gh-offline-sync/`, `.claude/worktrees/`, `.claude/tmp/`, `.vscode/`).
- **Keep English, Spanish and Nepali pages in step.** Devanagari is NFC UTF-8 only.
- Koshas feedback Worker: `koshas-feedback` on Cloudflare; its source is in the `talks` repo.
