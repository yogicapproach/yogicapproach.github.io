# Fonts for shell v1

Both are SIL Open Font License 1.1 (texts beside the files). Subsetting is a modification under the OFL; neither
family declares a Reserved Font Name. First-paint total: 124.6 KB (budget 150 KB).

| File | Source | Size | sha256 |
|------|--------|------|--------|
| `Spectral-Regular-latin.woff2` | Spectral Regular, `fonts/ttf/Spectral-Regular.ttf` from https://github.com/productiontype/Spectral (source sha256 `c89021dc20720c8d0dcf40b0b2f6e00c13665fa8041717f581396f51b8c78f5d`, fetched 2026-11-09) | 25.4 KB | `b2bc118094c24e531394397f1c2af38dcdd593ada5454f878493b1bf6fa4fcfc` |
| `NotoSerifDevanagari-wght-deva.woff2` | Noto Serif Devanagari 2.006, variable weight 400-700, copied unchanged from the Sundarkand viewer's `site/fonts/` (the subset recipe and source hash are in that folder's `README.txt`) | 96.3 KB | `87788c8879a040dbf05f47becd32d9be43519666a4ad5ce9025c1e33b3e08139` |

Latin subset command (fontTools with `brotli` available):

```
pyftsubset Spectral-Regular.ttf --flavor=woff2 --layout-features="kern,liga,ccmp,locl,mark,mkmk" \
  --unicodes="U+0020-007E,U+00A0-00FF,U+0100-017F,U+0300-036F,U+1E00-1EFF,U+2010-2014,U+2018-201D,U+2026,U+200C-200D" \
  --output-file=Spectral-Regular-latin.woff2
```

Covers IAST (ā ī ū ṛ ṝ ḷ ṃ ḥ ś ṣ ṇ ṭ ḍ ṅ ñ), Spanish and the Latin punctuation the pages use. Devanagari comes from the
second file through `unicode-range` in `shell.css`, so a page without Devanagari never downloads it. Glyph coverage
of every page is checked by `tests/check_site_quality.py --font ...`. Spectral ships one weight here: headings are
set at normal weight on purpose, so no synthetic bold is drawn.
