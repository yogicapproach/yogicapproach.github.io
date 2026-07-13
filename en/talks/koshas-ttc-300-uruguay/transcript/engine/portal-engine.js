/* ===========================================================================
   portal-engine.js — reusable client-side transcript-search engine (talks#65).

   A dependency-light (one optional dep: MiniSearch), GitHub-Pages-safe,
   theme-AGNOSTIC search portal over a flat index of timestamped cues. Drop in an
   index.json that matches the data-contract (see engine/README.md), point it at
   a few DOM elements, give it a resolver for click-to-audio, and you get:

     - live MiniSearch query (prefix + fuzzy), debounced, with browse-all mode,
     - language + session filter pills,
     - paged results with term highlighting,
     - each result carries the cue's timestamp (no public recording link) via the
       SHARED resolve(session, ts) interface (engine/resolver.js) — never bare.

   Nothing here knows about koshas. Sessions, the title, the audio URL scheme,
   the theme and palette all come from the HOST (koshas-host.js) through config.

   Exposes a small global `PortalEngine` (+ CommonJS export for node --check).
   =========================================================================== */
(function (root) {
  "use strict";

  function $(ref) {
    if (!ref) return null;
    return typeof ref === "string" ? document.getElementById(ref) : ref;
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  // Highlight matched terms inside an escaped string.
  function highlight(text, terms) {
    var safe = escapeHtml(text);
    if (!terms || !terms.length) return safe;
    var uniq = terms.filter(function (t, i) { return t && terms.indexOf(t) === i; })
                    .sort(function (a, b) { return b.length - a.length; })
                    .map(function (t) { return t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); });
    if (!uniq.length) return safe;
    var re = new RegExp("(" + uniq.join("|") + ")", "gi");
    return safe.replace(re, "<mark>$1</mark>");
  }

  function fmtTime(sec) {
    sec = Math.max(0, Math.floor(sec || 0));
    var h = Math.floor(sec / 3600);
    var m = Math.floor((sec % 3600) / 60);
    var s = sec % 60;
    var pad = function (n) { return n < 10 ? "0" + n : "" + n; };
    return (h > 0 ? h + ":" + pad(m) : m) + ":" + pad(s);
  }

  // The contract field for a cue is `start`; accept the compact `t` alias.
  function cueStart(c) { return c.start != null ? c.start : c.t; }
  function cueText(c) { return c.text != null ? c.text : c.x; }
  function cueLang(c) { return c.lang != null ? c.lang : c.l; }
  function cueSession(c) { return c.session != null ? c.session : c.s; }
  function cueSpeaker(c) { return c.speaker != null ? c.speaker : c.p; }
  function cueId(c) { return c.id != null ? c.id : c.i; }

  /**
   * @param {object} cfg
   * @param {object}   cfg.data        parsed index.json (the data-contract).
   * @param {object}   cfg.resolver    { resolve(session, ts) } — click-to-audio.
   * @param {object}   cfg.dom         element refs OR getElementById strings:
   *        q (req), results (req), status, counts, sessFilters, loadMore,
   *        loadMoreWrap, footMeta.
   * @param {number}   [cfg.pageSize=25]
   * @param {function(string): string} [cfg.sessionChipLabel]  session id -> chip text.
   * @param {function(string): string} [cfg.sessionChipTitle]  session id -> chip title.
   * @param {function(string): string} [cfg.langLabel]         lang code -> short label.
   * @param {function(object): string} [cfg.footerText]        payload -> footer line.
   * @param {function(object): string} [cfg.emptyHint]         payload -> browse-empty hint.
   * @returns {object} controller (mostly internal; returns { recompute, state }).
   */
  function create(cfg) {
    cfg = cfg || {};
    var PAGE = cfg.pageSize || 25;
    var data = cfg.data;
    var resolver = cfg.resolver || { resolve: function () { return { ok: false }; } };

    var els = {
      q: $(cfg.dom && cfg.dom.q),
      results: $(cfg.dom && cfg.dom.results),
      status: $(cfg.dom && cfg.dom.status),
      counts: $(cfg.dom && cfg.dom.counts),
      sessFilters: $(cfg.dom && cfg.dom.sessFilters),
      loadMore: $(cfg.dom && cfg.dom.loadMore),
      loadMoreWrap: $(cfg.dom && cfg.dom.loadMoreWrap),
      footMeta: $(cfg.dom && cfg.dom.footMeta),
    };

    var sessionChipLabel = cfg.sessionChipLabel || function (sid) {
      var s = state.sessions[sid];
      return "S" + (s && s.n != null ? s.n : "?");
    };
    var sessionChipTitle = cfg.sessionChipTitle || function (sid) {
      var s = state.sessions[sid];
      return s ? (s.title || sid) + (s.date ? " (" + s.date + ")" : "") : sid;
    };
    var langLabel = cfg.langLabel || function (l) { return String(l || "").toUpperCase(); };

    var state = {
      data: data,
      sessions: {},          // id -> meta
      mini: null,
      byId: {},
      lang: "all",
      sess: "all",
      shown: PAGE,
      lastResults: [],
    };
    (data.sessions || []).forEach(function (s) { state.sessions[s.id] = s; });

    // ---- rendering ---------------------------------------------------------

    function passesFilters(cue) {
      if (state.lang !== "all" && cueLang(cue) !== state.lang) return false;
      if (state.sess !== "all" && cueSession(cue) !== state.sess) return false;
      return true;
    }

    function langChip(l) {
      l = l || "en";
      return '<span class="tp-chip tp-lang tp-lang-' + escapeHtml(l) + '">' +
             escapeHtml(langLabel(l)) + "</span>";
    }

    function render(terms) {
      var list = state.lastResults;
      if (!els.results) return;
      els.results.innerHTML = "";

      if (!list.length) {
        var q = els.q ? els.q.value.trim() : "";
        var hint = cfg.emptyHint ? cfg.emptyHint(state.data) : "";
        els.results.innerHTML =
          '<div class="tp-empty"><span class="tp-big">' +
          (q ? "No passages found." : "Begin typing to search.") +
          "</span>" +
          (q ? "Try a different term, another language, or clear the filters." : hint) +
          "</div>";
        if (els.loadMoreWrap) els.loadMoreWrap.hidden = true;
        return;
      }

      var slice = list.slice(0, state.shown);
      var html = slice.map(function (cue) {
        var sid = cueSession(cue);
        var res = resolver.resolve(sid, cueStart(cue));
        var href = (res && res.audio) ? res.audio : "#";
        var sec = (res && res.ok) ? res.seconds : cueStart(cue);
        var spk = cueSpeaker(cue)
          ? '<span class="tp-chip tp-spk">' + escapeHtml(cueSpeaker(cue)) + "</span>"
          : "";
        var attrs = (res && res.audio)
          ? 'href="' + escapeHtml(href) + '" target="_blank" rel="noopener"'
          : 'href="#" aria-disabled="true"';
        return (
          '<a class="tp-hit" ' + attrs + ' ' +
              'title="Timestamp ' + fmtTime(sec) + '">' +
            '<div class="tp-hit-top">' +
              '<span class="tp-chip tp-sess">' + escapeHtml(sessionChipLabel(sid)) + "</span>" +
              langChip(cueLang(cue)) + spk +
              '<span class="tp-chip tp-time"><span class="tp-play"></span>' + fmtTime(sec) + "</span>" +
            "</div>" +
            '<p class="tp-hit-text">' + highlight(cueText(cue), terms) + "</p>" +
          "</a>"
        );
      }).join("");
      els.results.innerHTML = html;

      if (els.loadMoreWrap) els.loadMoreWrap.hidden = list.length <= state.shown;
    }

    function recompute() {
      var q = els.q ? els.q.value.trim() : "";
      state.shown = PAGE;
      var terms = [];

      if (!q) {
        state.lastResults = (state.data.cues || []).filter(passesFilters);
        if (els.status) els.status.textContent = state.lastResults.length
          ? "Browsing all passages — type to search"
          : "No passages match the current filters";
      } else if (state.mini) {
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

    // ---- filter pills ------------------------------------------------------

    function wireLangPills() {
      document.querySelectorAll("[data-lang]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          state.lang = btn.getAttribute("data-lang");
          document.querySelectorAll("[data-lang]").forEach(function (b) {
            b.setAttribute("aria-pressed", b === btn ? "true" : "false");
          });
          recompute();
        });
      });
    }

    function buildSessionPills() {
      if (!els.sessFilters) return;
      (state.data.sessions || []).forEach(function (s) {
        var btn = document.createElement("button");
        btn.className = "tp-pill";
        btn.type = "button";
        btn.setAttribute("data-sess", s.id);
        btn.setAttribute("aria-pressed", "false");
        btn.textContent = sessionChipLabel(s.id);
        btn.title = sessionChipTitle(s.id);
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

    // ---- search index ------------------------------------------------------

    function buildIndex() {
      state.byId = {};
      (state.data.cues || []).forEach(function (c) { state.byId[cueId(c)] = c; });

      if (typeof MiniSearch === "undefined") return; // search disabled; browse still works
      state.mini = new MiniSearch({
        idField: "i",
        // accept both the compact `x`/`i` aliases and the verbose contract names
        extractField: function (doc, field) {
          if (field === "i") return cueId(doc);
          if (field === "x") return cueText(doc);
          return doc[field];
        },
        fields: ["x"],
        storeFields: [],
        searchOptions: { prefix: true, fuzzy: 0.2, boost: { x: 1 } },
        processTerm: function (term) { return term.toLowerCase(); },
      });
      state.mini.addAll(state.data.cues || []);
    }

    // ---- wiring ------------------------------------------------------------

    var t;
    if (els.q) {
      els.q.addEventListener("input", function () {
        clearTimeout(t);
        t = setTimeout(recompute, 110);
      });
    }
    if (els.loadMore) {
      els.loadMore.addEventListener("click", function () {
        state.shown += PAGE;
        render(els.q ? els.q.value.trim().split(/\s+/).filter(Boolean) : []);
      });
    }

    // ---- boot --------------------------------------------------------------

    buildIndex();
    buildSessionPills();
    wireLangPills();

    var total = (state.data.cues || []).length;
    if (els.footMeta && cfg.footerText) els.footMeta.textContent = cfg.footerText(state.data);
    if (els.status) els.status.textContent = "Type to search " + total + " passages…";
    if (els.counts) els.counts.textContent = "";
    if (els.q) els.q.focus();
    recompute();

    return { recompute: recompute, render: render, state: state };
  }

  var PortalEngine = { create: create, highlight: highlight, fmtTime: fmtTime };
  if (typeof module !== "undefined" && module.exports) module.exports = PortalEngine;
  root.PortalEngine = PortalEngine;
})(typeof window !== "undefined" ? window : this);
