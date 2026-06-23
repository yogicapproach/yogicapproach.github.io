/* ===========================================================================
   corpus-search.js — Reusable corpus search controller (drishti-corpus engine).

   ONE JOB: drive a static, citation-grounded transcript search page. Loads a
   corpus.json (the data contract — see engine/README.md), indexes every cue
   with MiniSearch, renders results, and turns each hit into a copyable citation
   + a click-to-audio link via the canonical cite-resolver (window.Cite).

   NO koshas knowledge here. Everything app-specific is injected through
   `CorpusSearch.create(config)`:
     - which corpus.json to load,
     - which DOM ids to bind,
     - how to label a session / its filter pill (defaults are data-driven).

   NO build step and NO CDN: MiniSearch is expected to be already loaded from a
   LOCAL vendored copy (engine README documents the <script> order). cite.js /
   cite-resolver.js is a plain <script> loaded before this one (window.Cite).

   Exposes a global `CorpusSearch` (+ CommonJS export for node --check / tests).
   =========================================================================== */
(function (root) {
  "use strict";

  var DEFAULTS = {
    corpusUrl: "assets/corpus.json",
    page: 25,
    debounceMs: 110,
    // dom: ids OR elements for each slot (all optional except q + results).
    dom: {
      q: "q", results: "results", status: "status", counts: "counts",
      sessFilters: "sessFilters", langFilters: "langFilters",
      loadMore: "loadMore", loadMoreWrap: "loadMoreWrap", footMeta: "footMeta",
    },
    // Host hooks (all optional; sensible data-driven defaults below).
    sessionLabel: null,      // (sess) => string  — chip in a result row
    sessionPillLabel: null,  // (sess) => string  — text on a filter pill
    langLabel: null,         // (langCode) => string — chip ("EN"/"ES"/…)
    footMeta: null,          // (data) => string  — footer summary line
  };

  function el(ref) {
    if (!ref) return null;
    return typeof ref === "string" ? document.getElementById(ref) : ref;
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function highlight(text, terms) {
    var safe = escapeHtml(text);
    if (!terms || !terms.length) return safe;
    var uniq = terms.filter(function (t, i) { return t && terms.indexOf(t) === i; })
                    .sort(function (a, b) { return b.length - a.length; })
                    .map(function (t) { return t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); });
    if (!uniq.length) return safe;
    return safe.replace(new RegExp("(" + uniq.join("|") + ")", "gi"), "<mark>$1</mark>");
  }

  // ---- the engine ----------------------------------------------------------

  function create(userConfig) {
    var cfg = Object.assign({}, DEFAULTS, userConfig || {});
    cfg.dom = Object.assign({}, DEFAULTS.dom, (userConfig && userConfig.dom) || {});

    if (typeof root.Cite === "undefined") {
      throw new Error("CorpusSearch: window.Cite (cite-resolver) must load first");
    }

    var els = {};
    Object.keys(cfg.dom).forEach(function (k) { els[k] = el(cfg.dom[k]); });

    var state = {
      data: null, sessions: {}, resolver: null, mini: null, byId: {},
      lang: "all", sess: "all", shown: cfg.page, lastResults: [],
    };

    // ---- label helpers (data-driven defaults, host-overridable) ----
    function sessionLabel(sess) {
      if (cfg.sessionLabel) return cfg.sessionLabel(sess);
      if (!sess) return "?";
      return sess.n ? "S" + sess.n : (sess.id || "?").toUpperCase();
    }
    function sessionPillLabel(sess) {
      if (cfg.sessionPillLabel) return cfg.sessionPillLabel(sess);
      return sessionLabel(sess);
    }
    function langLabel(l) {
      if (cfg.langLabel) return cfg.langLabel(l);
      return (l || "en").toUpperCase();
    }
    function langChipHtml(l) {
      return '<span class="chip lang-' + escapeHtml(l || "en") + '">' +
             escapeHtml(langLabel(l)) + "</span>";
    }

    // The citation reference a teacher would copy into a note for this cue.
    function refFor(cue) { return cue.s + "#" + root.Cite.fmtTime(cue.t); }

    function passesFilters(cue) {
      if (state.lang !== "all" && cue.l !== state.lang) return false;
      if (state.sess !== "all" && cue.s !== state.sess) return false;
      return true;
    }

    function hitHtml(cue, terms) {
      var res = state.resolver.resolve(cue.s, root.Cite.fmtTime(cue.t));
      var sess = state.sessions[cue.s] || {};
      var spk = cue.p ? '<span class="chip spk">' + escapeHtml(cue.p) + "</span>" : "";
      var ref = refFor(cue);

      var audio = res.audio
        ? '<a class="audio" href="' + res.audio + '" target="_blank" rel="noopener" ' +
            'title="Open the recording at ' + res.time + '"><span class="play"></span>' +
            res.time + "</a>"
        : '<span class="chip time" title="Audio-only — no online recording to deep-link">' +
            res.time + "</span>";

      return (
        '<div class="hit">' +
          '<div class="hit-top">' +
            '<span class="chip sess" title="' + escapeHtml(sess.title || "") + '">' +
              escapeHtml(sessionLabel(sess)) + "</span>" +
            langChipHtml(cue.l) + spk + audio +
            '<button class="cite-copy" type="button" data-ref="' + escapeHtml(ref) + '" ' +
              'title="Copy citation reference">[[cite: ' + escapeHtml(ref) + "]]</button>" +
          "</div>" +
          '<p class="hit-text">' + highlight(cue.x, terms) + "</p>" +
        "</div>"
      );
    }

    function render(terms) {
      var list = state.lastResults;
      if (els.loadMoreWrap) els.loadMoreWrap.hidden = true;
      if (!list.length) {
        var q = els.q.value.trim();
        els.results.innerHTML =
          '<div class="empty"><span class="big">' +
          (q ? "No passages found." : "Search the teacher’s own words.") + "</span>" +
          (q ? "Try a different term, another language, or clear the filters."
             : "Type a word or phrase. Every result is a real passage from a recording, with a "
               + "timestamp you can copy as a citation.") +
          "</div>";
        return;
      }
      els.results.innerHTML = list.slice(0, state.shown)
        .map(function (c) { return hitHtml(c, terms); }).join("");
      if (els.loadMoreWrap) els.loadMoreWrap.hidden = list.length <= state.shown;
    }

    function recompute() {
      var q = els.q.value.trim();
      state.shown = cfg.page;
      var terms = [];

      if (!q) {
        state.lastResults = state.data.cues.filter(passesFilters);
        if (els.status) els.status.textContent = state.lastResults.length
          ? "Browsing all passages — type to search"
          : "No passages match the current filters";
      } else {
        var raw = state.mini.search(q, { prefix: true, fuzzy: 0.2, combineWith: "AND" });
        state.lastResults = raw.map(function (r) { return state.byId[r.id]; })
                               .filter(function (c) { return c && passesFilters(c); });
        terms = q.split(/\s+/).filter(Boolean);
        if (els.status) els.status.textContent = state.lastResults.length
          ? "Matches for “" + q + "”"
          : "No matches for “" + q + "”";
      }

      if (els.counts) els.counts.textContent = state.lastResults.length + " passage" +
        (state.lastResults.length === 1 ? "" : "s");
      render(terms);
    }

    // ---- filter pills ----
    function wireLangPills() {
      if (!els.langFilters) return;
      els.langFilters.querySelectorAll("[data-lang]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          state.lang = btn.getAttribute("data-lang");
          els.langFilters.querySelectorAll("[data-lang]").forEach(function (b) {
            b.setAttribute("aria-pressed", b === btn ? "true" : "false");
          });
          recompute();
        });
      });
    }

    function buildSessionPills() {
      if (!els.sessFilters) return;
      var all = document.createElement("button");
      all.className = "pill"; all.type = "button";
      all.setAttribute("data-sess", "all"); all.setAttribute("aria-pressed", "true");
      all.textContent = "All"; all.title = "All sessions";
      els.sessFilters.appendChild(all);

      state.data.sessions.forEach(function (s) {
        var btn = document.createElement("button");
        btn.className = "pill"; btn.type = "button";
        btn.setAttribute("data-sess", s.id); btn.setAttribute("aria-pressed", "false");
        btn.textContent = sessionPillLabel(s);
        btn.title = s.title + (s.date ? " (" + s.date + ")" : "");
        els.sessFilters.appendChild(btn);
      });
      els.sessFilters.querySelectorAll("[data-sess]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          state.sess = btn.getAttribute("data-sess");
          els.sessFilters.querySelectorAll("[data-sess]").forEach(function (b) {
            b.setAttribute("aria-pressed", b === btn ? "true" : "false");
          });
          recompute();
        });
      });
    }

    // ---- copy-citation (delegated) ----
    function wireCopy() {
      els.results.addEventListener("click", function (ev) {
        var btn = ev.target.closest && ev.target.closest(".cite-copy");
        if (!btn) return;
        var ref = "[[cite: " + btn.getAttribute("data-ref") + "]]";
        var done = function () {
          var old = btn.textContent;
          btn.classList.add("copied"); btn.textContent = "copied ✓";
          setTimeout(function () { btn.classList.remove("copied"); btn.textContent = old; }, 1100);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(ref).then(done, done);
        } else { done(); }
      });
    }

    // ---- boot ----
    function ensureMiniSearch() {
      // MiniSearch must be vendored LOCALLY (no CDN). It is normally already on
      // the page; as a defensive fallback, load the sibling vendored copy.
      if (typeof root.MiniSearch !== "undefined") return Promise.resolve();
      return new Promise(function (resolve, reject) {
        var s = document.createElement("script");
        s.src = (cfg.minisearchUrl || "assets/minisearch.min.js");
        s.onload = resolve;
        s.onerror = function () { reject(new Error("MiniSearch unavailable (vendored copy not found)")); };
        document.head.appendChild(s);
      });
    }

    function defaultFootMeta(data) {
      var total = data.cues.length;
      return (data.series ? data.series + " · " : "") +
        data.sessions.length + " sessions · " + total + " indexed passages" +
        (data.version ? " · " + data.version : "");
    }

    function boot() {
      fetch(cfg.corpusUrl)
        .then(function (r) { if (!r.ok) throw new Error("corpus.json HTTP " + r.status); return r.json(); })
        .then(function (data) { return ensureMiniSearch().then(function () { return data; }); })
        .then(function (data) {
          state.data = data;
          data.sessions.forEach(function (s) { state.sessions[s.id] = s; });
          data.cues.forEach(function (c) { state.byId[c.i] = c; });
          state.resolver = root.Cite.makeResolver(data);

          state.mini = new root.MiniSearch({
            idField: "i", fields: ["x"], storeFields: [],
            searchOptions: { prefix: true, fuzzy: 0.2, boost: { x: 1 } },
            processTerm: function (term) { return term.toLowerCase(); },
          });
          state.mini.addAll(data.cues);

          var total = data.cues.length;
          if (els.footMeta) {
            els.footMeta.textContent = (cfg.footMeta || defaultFootMeta)(data);
          }

          buildSessionPills();
          wireLangPills();
          wireCopy();

          if (els.status) els.status.textContent = "Type to search " + total + " passages…";
          if (els.counts) els.counts.textContent = "";
          els.q.focus();
          recompute();
        })
        .catch(function (err) {
          if (els.status) els.status.textContent = "Could not load the corpus index — " + err.message;
          els.results.innerHTML =
            '<div class="empty"><span class="big">Search unavailable</span>' +
            "The index could not be loaded. If you opened this file directly, serve the folder " +
            "over HTTP (e.g. <code>python -m http.server</code>) so the browser can fetch " +
            "<code>corpus.json</code>.</div>";
          console.error(err);
        });
    }

    // input wiring
    var t;
    els.q.addEventListener("input", function () {
      clearTimeout(t); t = setTimeout(recompute, cfg.debounceMs);
    });
    if (els.loadMore) {
      els.loadMore.addEventListener("click", function () {
        state.shown += cfg.page;
        render(els.q.value.trim().split(/\s+/).filter(Boolean));
      });
    }

    boot();

    // small handle for hosts / tests
    return { recompute: recompute, state: state };
  }

  var CorpusSearch = { create: create };
  if (typeof module !== "undefined" && module.exports) module.exports = CorpusSearch;
  root.CorpusSearch = CorpusSearch;
})(typeof window !== "undefined" ? window : this);
