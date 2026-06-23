/* ===========================================================================
   koshas-host.js — the koshas-SPECIFIC host that drives the reusable engine.

   The reusable engine (engine/force-graph.js + layer-toggle.js + cite-link.js)
   knows nothing about koshas. This file is the only place koshas knowledge lives:
     - the theme toggle (shared localStorage key with koshas-notes),
     - the community -> CSS colour mapping (uses the host's --hue palette),
     - the app-specific panel body (Devanagari, English gloss, "appears in" chips),
     - the cite-resolver (corpus cite.js) + a transcript fallback URL so every
       node's Source is clickable.

   Swap this file out (and the data) and the same engine renders a different graph.
   =========================================================================== */
(function () {
  "use strict";

  var THEME_KEY = "kosha_theme";
  // Where a node with no resolvable audio cite still gets a real, clickable
  // source: the own-transcript corpus search page (reused, not duplicated).
  var CORPUS_INDEX = "../../202606-koshas-ttc-300-uruguay/artifacts/corpus/index.html";

  /* ---- theme toggle ---- */
  var themeBtn = document.getElementById("themeBtn");
  function syncThemeGlyph() {
    themeBtn.textContent = document.documentElement.dataset.theme === "light" ? "☀" : "☾";
  }
  syncThemeGlyph();

  /* ---- data load (http fetch, file:// embedded fallback) ---- */
  function loadData() {
    return fetch("graph.json").then(function (r) {
      if (!r.ok) throw new Error("http " + r.status);
      return r.json();
    }).catch(function () {
      if (window.__GRAPH__) return window.__GRAPH__;
      throw new Error("no data");
    });
  }

  // d3 is loaded from a CDN <script> that may still be in flight when the
  // graph.json fetch resolves. Gate boot() on both being ready.
  function whenD3Ready() {
    return new Promise(function (resolve) {
      (function poll(n) {
        if (window.d3) return resolve();
        if (n <= 0) return resolve();          // give up after ~10s; boot() will report
        setTimeout(function () { poll(n - 1); }, 50);
      })(200);
    });
  }

  Promise.all([loadData(), whenD3Ready()]).then(function (r) {
    boot(r[0]);
  }).catch(function (err) {
    document.getElementById("loading").textContent =
      "Could not load graph.json — serve this folder over http (python -m http.server) " +
      "or keep graph.json beside index.html.";
    console.error(err);
  });

  function boot(data) {
    var communities = data.meta.communities;
    var sessions = data.meta.sessions || {};

    function communityColor(comm) {
      var hue = (communities[comm] && communities[comm].hue) || 38;
      var light = document.documentElement.dataset.theme === "light";
      return light ? "hsl(" + hue + " 55% 46%)" : "hsl(" + hue + " 62% 60%)";
    }

    /* ---- Source links: cite -> audio, else corpus transcript search ---- */
    var citeLink = window.CiteLink.create({
      // resolver injected below once the corpus.json fetch resolves
      sessionLabel: function (sid) {
        var s = sessions[sid];
        return s ? s.label.split("—")[0].trim() : sid;
      },
      sessionUrl: function () {
        // Every node (incl. audio-less S4) gets a working link to the searchable
        // transcript corpus — never a bare reference.
        return CORPUS_INDEX;
      },
    });
    if (window.Cite) {
      fetch("corpus.json")
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (corpus) {
          if (corpus) citeLink.setResolver(window.Cite.makeResolver(corpus));
        })
        .catch(function () { /* corpus unavailable — fallback link still works */ });
    }

    /* ---- the koshas-specific panel body ---- */
    function renderPanelBody(panel, d) {
      document.getElementById("pDeva").textContent = d.sanskrit || "";
      document.getElementById("pKicker").textContent =
        (communities[d.community] && communities[d.community].label) || d.community;
      document.getElementById("pTitle").textContent = d.label;
      var eng = document.getElementById("pEng");
      eng.textContent = d.english || "";
      eng.style.display = d.english ? "" : "none";
      document.getElementById("pDesc").textContent = d.desc || "";

      var ses = document.getElementById("pSessions");
      ses.textContent = "";
      var lbl = document.createElement("p");
      lbl.className = "p-sect"; lbl.textContent = "Appears in";
      ses.appendChild(lbl);
      var chips = document.createElement("div"); chips.className = "chips";
      (d.sessions || []).forEach(function (sid) {
        // S1..S4 chips link to that session's notes page (../sessions/session-N/);
        // any non-Sxx tag (e.g. an audio-only event) stays a plain span.
        var m = /^S(\d+)$/.exec(sid);
        var c = document.createElement(m ? "a" : "span");
        c.className = "chip ses" + (m ? " chip-link" : "");
        if (m) { c.href = "../sessions/session-" + m[1] + "/"; c.target = "_blank"; c.rel = "noopener"; }
        c.title = (sessions[sid] && sessions[sid].label) || sid;
        c.textContent = sid + (sessions[sid] ? " · " + sessions[sid].date : "");
        chips.appendChild(c);
      });
      ses.appendChild(chips);
    }

    /* ---- start the engine ---- */
    var graph = window.ForceGraph.create({
      data: data,
      dom: {
        svg: "svg", panel: "panel", panelSource: "pSource", panelRels: "pRels",
        legend: "legRows", search: "search", labelsBtn: "labelsBtn",
        resetBtn: "resetBtn", loading: "loading",
      },
      colorFor: communityColor,
      citeLink: citeLink,
      renderPanelBody: renderPanelBody,
    });

    /* ---- session filter (watch the graph build, session by session) ----
       Cumulative by default; "All" resets. Composes with the community layer
       toggle: each filter only sets style("display"), and the session filter is
       handed an `isLayerHidden` predicate so the two intersect instead of fighting.
       When a session is picked we re-settle the force layout on the visible
       subgraph (sim alpha bump via graph.reheat). */
    var sessionFilter = window.SessionFilter ? window.SessionFilter.create({
      sessions: sessions,
      selections: graph.selections,
      barEl: document.getElementById("sesBar"),
      isLayerHidden: function (community) { return graph.layer.hidden.has(community); },
      onChange: function () { graph.reheat(); },
    }) : null;

    /* Keep the two filters in sync: after the community toggle changes anything,
       re-apply the session filter so a layer un-hide can't reveal a node the
       session filter means to keep hidden (intersection, not override). */
    if (sessionFilter && graph.onLayerChange) {
      graph.onLayerChange(function () { sessionFilter.applyVisibility(); });
    }

    /* close button (host chrome) */
    document.getElementById("pclose").addEventListener("click", function () {
      graph.closePanel();
    });

    /* reset button also clears the session filter back to "All" */
    var resetBtnEl = document.getElementById("resetBtn");
    if (resetBtnEl && sessionFilter) {
      resetBtnEl.addEventListener("click", function () { sessionFilter.reset(); });
    }

    /* theme toggle recolors the engine */
    themeBtn.addEventListener("click", function () {
      var next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
      syncThemeGlyph();
      graph.recolor();
    });
  }
})();
