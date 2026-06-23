/* ===========================================================================
   note-render.js — Inline-citation note renderer (drishti-corpus engine).

   ONE JOB: take a plain-text note containing [[cite: session#ts]] references,
   resolve each through the canonical cite-resolver (window.Cite) against the
   corpus, and replace it with an inline, hoverable source popover (the actual
   words + a click-to-audio link). NO koshas knowledge, NO host coupling.

   This is the proof that inline citations in notes resolve to real source
   lines. Any repo can render its notes this way: keep the note text in a
   <script type="text/note" id="noteSource"> and add #note / #noteStatus
   targets (see note-demo.html). Host-tunable via CorpusNote.boot(opts) or the
   automatic boot (uses defaults) when a #note element exists.

   Exposes a global `CorpusNote` (+ renderNote export for node --check / tests).
   =========================================================================== */
(function (root) {
  "use strict";

  var DEFAULT_CORPUS_URL = "assets/corpus.json";

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  // Render one resolved citation as an inline, expandable source reference.
  function citationHtml(idx, res) {
    if (!res.ok) {
      return '<sup class="cite-bad" title="' + escapeHtml(res.reason || "unresolved") + '">[?]</sup>';
    }
    var label = (res.sessionTitle ? res.sessionTitle.split("—")[0].trim() : res.session) +
                " · " + res.time;
    var audio = res.audio
      ? '<a class="src-audio" href="' + res.audio + '" target="_blank" rel="noopener">' +
          '<span class="play"></span>listen at ' + escapeHtml(res.time) + "</a>"
      : '<span class="src-audio muted">audio-only · ' + escapeHtml(res.time) + "</span>";
    return (
      '<span class="cite">' +
        '<sup class="cite-mark" tabindex="0" aria-describedby="src-' + idx + '">[' + idx + "]</sup>" +
        '<span class="src-pop" id="src-' + idx + '" role="note">' +
          '<span class="src-head">' + escapeHtml(label) + "</span>" +
          '<span class="src-quote">“' + escapeHtml(res.text) + "”</span>" +
          audio +
        "</span>" +
      "</span>"
    );
  }

  // Replace every citation ref in `note` with rendered citation HTML; escape the
  // surrounding prose. Returns { html, count }.
  function renderNote(note, resolver) {
    var refs = resolver.findRefs(note);
    if (!refs.length) return { html: escapeHtml(note), count: 0 };

    var out = "";
    var pos = 0;
    refs.forEach(function (r, n) {
      out += escapeHtml(note.slice(pos, r.start));
      out += citationHtml(n + 1, resolver.resolve(r.session, r.ts));
      pos = r.end;
    });
    out += escapeHtml(note.slice(pos));
    // Paragraph breaks on blank lines.
    out = out.split(/\n{2,}/).map(function (p) { return "<p>" + p.replace(/\n/g, "<br>") + "</p>"; }).join("");
    return { html: out, count: refs.length };
  }

  function boot(opts) {
    opts = opts || {};
    var corpusUrl = opts.corpusUrl || DEFAULT_CORPUS_URL;
    var noteEl = opts.noteEl || document.getElementById("note");
    var srcEl = opts.srcEl || document.getElementById("noteSource");
    var statusEl = opts.statusEl || document.getElementById("noteStatus");
    if (!noteEl) return;
    var noteText = (srcEl && srcEl.textContent || "").replace(/^\n/, "");

    fetch(corpusUrl)
      .then(function (r) { if (!r.ok) throw new Error("corpus.json HTTP " + r.status); return r.json(); })
      .then(function (corpus) {
        var resolver = root.Cite.makeResolver(corpus);
        var rendered = renderNote(noteText, resolver);
        noteEl.innerHTML = rendered.html;
        if (statusEl) {
          statusEl.textContent = rendered.count +
            " inline citation" + (rendered.count === 1 ? "" : "s") +
            " resolved live against the corpus.";
        }
      })
      .catch(function (err) {
        noteEl.textContent = noteText; // graceful: show raw note
        if (statusEl) statusEl.textContent = "Corpus not loaded (" + err.message +
          ") — serve over HTTP to resolve citations.";
        console.error(err);
      });
  }

  var CorpusNote = { renderNote: renderNote, boot: boot };

  // Expose for tests; auto-boot only when a #note exists and no host opted out.
  if (typeof module !== "undefined" && module.exports) module.exports = CorpusNote;
  root.CorpusNote = CorpusNote;
  if (typeof document !== "undefined" && !opts_optOut() && document.getElementById("note")) boot();

  function opts_optOut() {
    return typeof document !== "undefined" &&
      document.documentElement && document.documentElement.hasAttribute("data-note-manual");
  }
})(typeof window !== "undefined" ? window : this);
