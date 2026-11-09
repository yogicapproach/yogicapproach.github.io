# yogicapproach.github.io

Global rules live in ~/.claude/CLAUDE.md (mooladhara config/global) and apply in full.

## This repo

Public GitHub Pages site for https://yogicapproach.com. No build step: `main` is what is served. See `README.md` for the directory map and which repo generates each tree.

- **Do not hand-edit published output.** `site-root` (root files, `assets/`, `es/`, `ne/`, `events/`, `retreats/`), `talks` (`en/talks/`, `talks/`) and `navaratri-sadhana` (`sadhana/`) overwrite their trees on the next publish. Fix the source repo, then republish.
- This repo is public: never commit `.claude/settings*.json`, tokens or local paths.
- The live site is read-only until a replacement is verified; changes go via branch + draft PR.
- Keep English, Spanish and Nepali pages in step; Devanagari is NFC UTF-8 only.
- Koshas feedback Worker: `koshas-feedback` on Cloudflare; source is outside this repo (see README).
