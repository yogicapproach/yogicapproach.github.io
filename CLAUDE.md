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
