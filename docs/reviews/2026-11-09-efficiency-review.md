# Efficiency review, 2026-11-09 (hub wave 26, lane: tokens / memory / speed / resource)

Scope: `origin/main` at 94c8a16 (315 tracked files, 229.8 MB tree, pack 210 MB). Read-only review; this is a public live site, so no served page was changed. Hub issue: kaanchan/mooladhara#748.
Method: `git ls-tree -l`, blob-hash duplicate detection, `cmp`, grep of the page JS, one Pillow resize measurement. Anything not measured is labelled HYPOTHESIS.

## Dimensions with nothing to report
- **Tokens:** no LLM or API calls in the repo (static HTML/JS/JSON). Not applicable.
- **Memory / resource:** no servers, subprocess spawns, timers or unbounded caches. The force graph uses a d3 simulation that stops on its own as alpha decays (`graph/engine/force-graph.js`). All `<audio>` elements use `preload="none"` (`assets/shared.js:261`, `yoga-sutras-exploration/*/index.html`, navaratri readings).
- **Security (light lens):** secret-pattern grep hits only vendored minified SurveyJS (false positives). `innerHTML` use renders repo-authored markdown only. No credentials found.

## Ranked findings

### 1. Session pages download multi-MB PNGs to draw 72 px thumbnails (speed, bandwidth) - HIGH
`en/talks/koshas-ttc-300-uruguay/assets/shared.js:256,304,356` renders `<img class="resource-cover" ...>` with no `loading="lazy"` and no size variant; CSS shows it at 72x72 (56x56 on mobile) (`assets/shared.css:121-124,209`). `sN/resources.json` points the audio cover at the full infographic.
Measured bytes of cover images fetched on open (git blob sizes):
- s1: 5,598,642 + 446,768 = **6.0 MB**
- s2: 4,387,299 + 500,998 + 568,102 = **5.5 MB**
- s3: 6,263,810 + 451,341 + 546,313 + 370,017 = **7.6 MB**
- s4: 4,387,299 + 411,729 + 14,826 = **4.8 MB**
The infographics are 2752x1536 RGBA PNG. Measured: `la-resonancia-de-la-conexion.png` 6,263,810 B -> 8,480 B at 256 px WebP q80 (about 740x smaller), 122,768 B at 1200 px WebP (51x). The click-to-zoom modal reuses the same `src`, so a 1200 px derivative would still serve the zoom view. Whether the resources panel is initially hidden does not matter: a hidden `<img>` still loads (HYPOTHESIS: not browser-verified here). Also the cover URL carries `?v=1`, fine.
Fix sketch (needs KA, changes served pages): add `loading="lazy" decoding="async"` and generate ~256 px thumb + ~1200 px zoom derivatives; point `resources.json` at them.

### 2. Dead duplicate SurveyJS vendor tree and survey files (repo and Pages size) - MEDIUM
`feedback/index.html` is a redirect to `participant/`; `feedback/participant/index.html:24-28` loads only `participant/vendor/*`. `feedback/vendor/` (5 files, 2,063,902 B: survey.core.min.js 1,448,418; survey-core.min.css 306,462; survey-js-ui.min.js 297,758; spanish 6,552; theme 4,702) is byte-identical (`cmp`) and no tracked html/js/json/md references `feedback/vendor`, `feedback/survey.json` or `feedback/content.json` (grep). Total deletable ~2.07 MB. Exact-duplicate bytes across the whole tree: 2.70 MB (blob-hash method). Also `search/assets/corpus.json` == `graph/corpus.json` (465,450 B each) and `marked.min.js` x8 (35,479 B each, 248 KB extra). Caveat: the owner may link the unprefixed `feedback/` paths externally; HYPOTHESIS that nothing outside the repo uses them.

### 3. Graph page fetches the same 106 KB graph twice, and 454 KB corpus eagerly (speed, mobile memory) - MEDIUM
`graph/index.html:272` loads `graph-data.js` (105.9 KB, blocking script) as a file:// fallback, while `graph/koshas-host.js:48` also `fetch("graph.json")` (105.8 KB) first. Over http both download (the comment says the embedded copy exists only for file://). `koshas-host.js:102` then fetches `corpus.json` (454.5 KB) at load although it is only needed when a citation link is clicked. d3 7.9.0 comes from jsdelivr (version pinned, good). Savings if fixed: ~106 KB blocking + ~454 KB deferred per graph view (session pages embed the graph in a lazy iframe, so only users who open it pay). Note gzip would cut the transfer, so wire savings are smaller (HYPOTHESIS).

### 4. Search page parses 454 KB JSON and builds a MiniSearch index on every visit (speed) - LOW
`search/engine/corpus-search.js:259-275` fetches `corpus.json`, then `addAll(data.cues)`. Query is debounced 110 ms (line 27), fuzzy 0.2. Cost is per page open on the main thread; on low-end phones HYPOTHESIS: noticeable (not measured). A prebuilt serialized index (`MiniSearch.loadJSON`) would skip indexing. Not recommended unless users report lag.

### 5. Media committed to git (repo size growth) - LOW today, HIGH if it keeps growing
Tree is 229.8 MB of which: PDFs 79.8 MB (7 slide decks, 8-15 MB each), one 67.4 MB m4a (`assets/2026-uruguay/20260223-koshas-piriopolis/...`), m4a 27 MB, PNG 18.7 MB, one 18 MB mp3. Pack is 210 MB, so history does not add much yet. GitHub Pages limits (fetched 2026-11-09): published site max 1 GB, repo recommended <= 1 GB, soft bandwidth 100 GB/month. Current use is about 23% of the site cap, but each new 60 MB recording consumes it, and large audio served directly counts against bandwidth (source below). Cloning cost for contributors is 210 MB. Options (KA decision): host long audio on GitHub Releases or object storage, keep only links in the repo.

### 6. Minor
- `en/sadhana/navaratri/2026-oct/readings/index.html` is a single 273 KB inline-everything page (HYPOTHESIS: fine, one request).
- 23 `<img>` tags in html with no `loading=` attribute (grep); most are small.
- Two near-identical copies of `shared.js` / `shared.css` (`assets/2026-uruguay/events/` vs `koshas-ttc-300-uruguay/assets/`); drift risk, not a performance issue.
- Local working tree has an uncommitted `resources/catalog.json` change (owner's work); not touched.

## Searches used (1 of 3 allowed, extended)
1. 2026-11-09, "GitHub Pages usage limits published site size 1 GB soft bandwidth 100 GB per month" (docs.github.com): confirmed 1 GB site cap, 1 GB recommended repo size, 100 GB/month soft bandwidth, 10 builds/hour soft limit. Changed finding 5 from a guess to a quantified margin. Source: https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
Searches 2 and 3 were not needed: the other findings rest on local measurement.

## Fixes
None made. The lane focus for this repo is "docs PRs only, nothing that changes served pages"; every candidate fix (lazy attribute, thumbnails, deleting vendor duplicates, graph fetch) alters served files, so each is filed as an issue for KA instead.

## Verification
No test suite exists in this repo (no `.github/`, no test files), so none was run. Free RAM before work: 2.6 GB.
