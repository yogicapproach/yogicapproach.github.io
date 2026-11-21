# yogicapproach.github.io

Global rules live in ~/.claude/CLAUDE.md (mooladhara config/global) and apply in full.
Read `README.md` for layout and deploy.

## Live-site gate

`main` IS the live site (GitHub Pages from `main`, `/`, CNAME yogicapproach.com). No build, no CI,
no staging. The live site is READ-ONLY for agents: work on a branch or worktree, open a PR
(`Refs #N`, never `Fixes`), and let KA merge. Never push to `main`. Keep a redirect stub at any
moved URL. Never commit `graphify-out/`, `.gh-offline-sync/`, `.claude/worktrees/`, `.claude/tmp/`.

## Spoke repos that publish into this one

`talks`, `navaratri-sadhana`, `events` (and `site-root`) push `publish(...)` commits straight to
`main`. A site-shell or URL-structure change needs their agreement first.

## Keep in step

English, Spanish and Nepali pages (`en/`, `es/`, `ne/`); Devanagari is NFC UTF-8 only.


## This repo

Public GitHub Pages site for https://yogicapproach.com. No build step: `main` is what is served. See `README.md` for the directory map and which repo generates each tree.

- **Do not hand-edit published output.** `site-root` (root files, `assets/`, `es/`, `ne/`, `events/`, `retreats/`), `talks` (`en/talks/`, `talks/`) and `navaratri-sadhana` (`sadhana/`) overwrite their trees on the next publish. Fix the source repo, then republish.
- This repo is public: never commit `.claude/settings*.json`, tokens or local paths.
- The live site is read-only until a replacement is verified; changes go via branch + draft PR.
- Keep English, Spanish and Nepali pages in step; Devanagari is NFC UTF-8 only.
- Koshas feedback Worker: `koshas-feedback` on Cloudflare; source is outside this repo (see README).
