Paste this whole file as the first prompt of a new session in `C:\Users\kaanchan\Projects\Yoga\yogicapproach\github-repos\yogicapproach.github.io`. It is self-contained.
Pre-flight for KA: `/effort medium`. No `/model` change needed.

## What you are doing

Continue the site housekeeping started 2026-11-21. Two follow-on decisions are open, and KA said yes to both.
1. Move long audio and PDFs to Cloudflare R2 ([#10](https://github.com/yogicapproach/yogicapproach.github.io/issues/10)). The plan is in the issue comment dated 2026-11-21.
2. Put `talks` on site-root's `dist` branch contract instead of hand-run `deploy-*.sh` copies (not filed yet; file it in `yogicapproach/site-root`).
KA also asked for a `.gitattributes` in `talks` (pending, see Deliver 3).

## Starting state (verified 2026-11-21 20:35 NST)

| Fact | Command |
|---|---|
| pages repo `main` = `b45495f`, tree clean, 1 worktree, 3 branches (main + 2 remote refs) | `git status --short`, `git worktree list`, `git branch -a` |
| PRs merged: pages #16 (README tidy), pages #17 (small covers, graph, drop feedback/vendor), talks #107 | `gh pr list --state merged` |
| Live: `sm/` covers 200, `feedback/vendor` 404, `feedback/participant/vendor` 200 | curl on yogicapproach.com |
| #7, #8, #9 are open, commented "ready to test"; KA closes them after the test | `gh issue view N --comments` |
| `talks` clone `main` = `a078b73`, in sync with origin | `git -C ...\talks status -sb` |
| `.playwright-mcp/` is untracked in the pages repo but hidden via `.git/info/exclude` | `git status` shows nothing |

Confirm with `git status` before acting.

## Decisions already made (do not re-ask)

- **R2 for audio/PDF**: yes. Needs a bucket and subdomain name (e.g. `media.yogicapproach.com`) and Cloudflare access from KA.
- **Repo structure**: keep `talks` separate, no monorepo. Opus and Fable independently concluded the same: talks is private, the public site must stay public, the org is on the Free plan, and merging would pool ~45 worktrees and ~190 issues. Cheapest safe step is moving `talks` onto the `dist` contract: talks builds and pushes a `dist` branch and sends `repository_dispatch`; site-root's `assemble-and-deploy.yml` (line 48 has the slot, line 72 says talks bypasses it) pulls it; diff the assembled `en/talks/` against the live tree (must be empty) before retiring `deploy-*.sh`. Fable's pilot suggestion: the smallest script, `deploy-talks-sitemap.sh`.
- The Opus/Fable "not verified" list: whether site-root already pulls a talks dist, `navaratri-sadhana` (not in `github-repos\`), the contents of `consulting` (not a git repo).

## Rules for this session

- **Live site is read-only for agents.** Any change to the pages repo goes through a branch and PR; KA merges, unless KA says merge. (Earlier this session KA said "merge those PRs" explicitly.)
- **Run `pytest` (full `tests/`, including `test_dependency_census.py`) in `talks` before declaring green.** I skipped the census test once and CI caught the undeclared Pillow import.
- **Work in a worktree, never in the `talks` main clone**: it has KA's untracked screenshots and a line-ending-only modified file.
- **`rm -r` / `Remove-Item` on folders was denied by the classifier.** Give KA the command instead of retrying.

## Deliver

1. File the `talks` dist-contract issue in `yogicapproach/site-root` (use the `github-issue` skill; link it from site-root#5), citing the Opus and Fable findings above.
2. On KA's go and with the bucket name and Cloudflare access, start the R2 steps from the #10 comment. Do not upload anything before KA gives the bucket and access.
3. Add `.gitattributes` to `talks` in a small PR (copy the one in the pages repo), if KA said yes (see ASKS in the last message).
4. Stale `talks` worktrees: KA has the removal commands; do not remove them without a go. `wave28/guard-localstorage` has [PR #105](https://github.com/yogicapproach/talks/pull/105) open; leave it.
5. Append a PROGRESS.jsonl line per finished unit; sign off per the global format.

## References

- Pages repo: https://github.com/yogicapproach/yogicapproach.github.io, local `C:\Users\kaanchan\Projects\Yoga\yogicapproach\github-repos\yogicapproach.github.io`
- talks: https://github.com/yogicapproach/talks, local `C:\Users\kaanchan\Projects\Yoga\yogicapproach\github-repos\talks`
- site-root: https://github.com/yogicapproach/site-root, local `...\github-repos\site-root` (clone is 30+ commits behind; pull before reading). Home-direction decision board: [site-root#40](https://github.com/yogicapproach/site-root/issues/40) under epic [#38](https://github.com/yogicapproach/site-root/issues/38); KA said they will open site-root separately.
- R2: https://developers.cloudflare.com/r2/platform/limits/ and https://developers.cloudflare.com/r2/pricing
- Issues: [#10](https://github.com/yogicapproach/yogicapproach.github.io/issues/10) R2 decision, [#7](https://github.com/yogicapproach/yogicapproach.github.io/issues/7), [#8](https://github.com/yogicapproach/yogicapproach.github.io/issues/8), [#9](https://github.com/yogicapproach/yogicapproach.github.io/issues/9)
