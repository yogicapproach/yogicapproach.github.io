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
  // Shared with the koshas-notes app: language follows the reader across the site.
  var LANG_KEY = "kosha_lang";
  var LANGS = [
    { key: "en", label: "EN" },
    { key: "es", label: "ES" },
    { key: "ne", label: "ने" },
  ];
  function validLang(l) { return l === "en" || l === "es" || l === "ne"; }
  function initialLang() {
    try {
      var q = (new URLSearchParams(location.search)).get("lang");
      if (validLang(q)) return q;
      var s = localStorage.getItem(LANG_KEY);
      if (validLang(s)) return s;
    } catch (e) {}
    return "en";
  }
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

    /* ---- layout switch: Force · Concentric · Matrix (talks#29/#57) ----------
       Re-positions the SAME main graph between three views by REUSING the lab's
       geometry (window.KoshaLayouts.{concentric,matrix}) and applying it to the
       engine's own nodes/SVG via graph.applyPositions / graph.renderMatrix. The
       node-click panel, audio cites, session chips, legend and the session
       filter all keep working because only geometry moves — the node/link
       selections are never rebuilt. Force restarts the live simulation; the
       static/matrix layouts stop it so the layout owns x/y. */
    var LAYOUTS = [
      { key: "force", label: "Force" },
      { key: "concentric", label: "Concentric" },
      { key: "matrix", label: "Matrix" },
    ];
    // Community order (koshas first) for the matrix axes — same as the lab.
    var communityOrder = ["koshas", "concepts", "gunas", "metaphors", "practices", "structure"]
      .filter(function (c) { return communities[c]; });
    Object.keys(communities).forEach(function (c) {
      if (communityOrder.indexOf(c) < 0) communityOrder.push(c);
    });

    function layoutCtx() {
      var dim = graph.dimensions();
      return {
        nodes: graph.nodes, edges: graph.edges, byId: graph.byId,
        W: dim.W, H: dim.H, communityOrder: communityOrder,
        meta: data.meta,
      };
    }

    var currentLayout = "force";

    function applyLayout(key, animate) {
      currentLayout = key;
      var KL = window.KoshaLayouts || {};
      if (key === "concentric" && KL.concentric) {
        var res = KL.concentric.compute(layoutCtx());
        graph.applyPositions(res.positions, res.decorations, animate);
      } else if (key === "matrix" && KL.matrix) {
        graph.renderMatrix(KL.matrix.compute(layoutCtx()), communityColor);
      } else {
        currentLayout = "force";
        graph.startSim();
      }
      // Re-apply the session+community filters so visibility survives the switch
      // in the node-link layouts (Force, Concentric) — the same node/link
      // selections are filtered. In Matrix the node-link layers are hidden and
      // the cell grid is its own view, so re-applying the filter would re-reveal
      // the hidden node layer on top of the matrix — skip it there.
      if (currentLayout !== "matrix") {
        if (sessionFilter) sessionFilter.applyVisibility();
        else graph.layer.applyVisibility();
      }
      syncLayoutButtons();
    }

    var layBar = document.getElementById("layBar");
    function syncLayoutButtons() {
      if (!layBar) return;
      Array.prototype.forEach.call(layBar.children, function (b) {
        b.classList.toggle("on", b.dataset.key === currentLayout);
      });
    }
    if (layBar) {
      LAYOUTS.forEach(function (L) {
        var b = document.createElement("button");
        b.type = "button"; b.className = "lay-btn"; b.dataset.key = L.key;
        b.textContent = L.label;
        b.addEventListener("click", function () { applyLayout(L.key, true); });
        layBar.appendChild(b);
      });
      syncLayoutButtons();
    }
    // When force isn't active, reset/resize ask the engine to re-apply the
    // current static/matrix layout (re-fitted to the new canvas size).
    if (graph.onRelayout) {
      graph.onRelayout(function () {
        if (currentLayout !== "force") applyLayout(currentLayout, false);
      });
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

    /* ---- language toggle (EN · ES · ने) -------------------------------------
       Multilingual without forking the engine: graph.json carries parallel
       label_es/label_ne + desc_es/desc_ne per node, label_es/label_ne per
       community, and a meta.rel_i18n map keyed by the EN rel string. The host
       swaps the ACTIVE-language text onto the in-memory nodes / links /
       communities (EN originals preserved in the *_en stash) and re-renders the
       live engine selections + legend + any open panel. Sanskrit (the Devanagari
       `sanskrit` field, kosha names, mantra names) is never translated — it lives
       in the data verbatim across languages. Cites, session/layout/community
       toggles are untouched: only label/desc/rel text changes. */
    var relI18n = (data.meta && data.meta.rel_i18n) || {};

    // Stash EN originals once so switching back to EN is lossless.
    graph.nodes.forEach(function (n) {
      if (n._label_en === undefined) n._label_en = n.label;
      if (n._desc_en === undefined) n._desc_en = n.desc;
    });
    graph.edges.forEach(function (l) {
      if (l._rel_en === undefined) l._rel_en = l.rel;
    });
    Object.keys(communities).forEach(function (c) {
      if (communities[c]._label_en === undefined) communities[c]._label_en = communities[c].label;
    });

    function pick(obj, base, lang) {
      // base = "label" | "desc"; falls back to EN when a translation is absent.
      if (lang === "en") return obj["_" + base + "_en"];
      var v = obj[base + "_" + lang];
      return (v != null && v !== "") ? v : obj["_" + base + "_en"];
    }

    function applyLang(lang, persist) {
      if (!validLang(lang)) lang = "en";
      document.documentElement.lang = lang;
      document.documentElement.dataset.lang = lang;
      if (persist) { try { localStorage.setItem(LANG_KEY, lang); } catch (e) {} }

      // Node label + desc (engine reads d.label / d.desc directly).
      graph.nodes.forEach(function (n) {
        n.label = pick(n, "label", lang);
        n.desc = pick(n, "desc", lang);
      });
      // Edge rel (linkLabel + connections list read l.rel).
      graph.edges.forEach(function (l) {
        var en = l._rel_en;
        var tr = relI18n[en] && relI18n[en][lang];
        l.rel = (lang === "en" || !tr) ? en : tr;
      });
      // Community label (legend + panel kicker read communities[c].label).
      Object.keys(communities).forEach(function (c) {
        var en = communities[c]._label_en;
        communities[c].label = (lang === "en") ? en
          : (communities[c]["label_" + lang] || en);
      });

      // Re-render the live engine selections that show language.
      graph.selections.node.select("text.main-label").text(function (d) { return d.label; });
      graph.selections.linkLabel.text(function (d) { return d.rel || ""; });
      graph.layer.buildLegend();
      // Re-open the focused node so its panel (kicker/title/desc + connections) re-renders.
      if (graph.focused && graph.focused()) graph.focusNode(graph.focused().id);

      syncLangButtons();
    }

    var langBar = document.getElementById("langBar");
    function syncLangButtons() {
      if (!langBar) return;
      var cur = document.documentElement.dataset.lang || "en";
      Array.prototype.forEach.call(langBar.children, function (b) {
        b.classList.toggle("on", b.dataset.key === cur);
      });
    }
    if (langBar) {
      LANGS.forEach(function (L) {
        var b = document.createElement("button");
        b.type = "button"; b.className = "lang-btn"; b.dataset.key = L.key;
        b.textContent = L.label;
        b.title = L.key.toUpperCase();
        b.addEventListener("click", function () { applyLang(L.key, true); });
        langBar.appendChild(b);
      });
    }
    // Apply the bootstrapped language (from ?lang / kosha_lang) on first paint.
    applyLang(initialLang(), false);
  }
})();
