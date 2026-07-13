/* ===========================================================================
   koshas-host.js — the koshas-SPECIFIC host that drives the drishti-portal engine.

   The reusable engine (engine/portal-engine.js + resolver.js + portal-engine.css)
   knows nothing about koshas. This file is the only place koshas knowledge lives:
     - the theme toggle (shared localStorage key with koshas-notes/graph),
     - the YouTube audio URL scheme for click-to-audio deep links,
     - the session chip labels / footer copy for this series.

   Swap this file out (and index.json) and the same engine renders a different
   portal. The session registry + YouTube ids are authored in build-index.py and
   travel inside index.json (sessions[].vid), so the host stays thin.

   Loading order (index.html): minisearch -> engine/resolver.js ->
   engine/portal-engine.js -> assets/koshas-host.js.
   =========================================================================== */
(function () {
  "use strict";

  var THEME_KEY = "kosha_theme";
  var INDEX_URL = "assets/index.json";

  /* ---- theme toggle (shared key with the rest of the koshas surfaces) ---- */
  var themeBtn = document.getElementById("themeBtn");
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var cur = document.documentElement.dataset.theme === "light" ? "light" : "dark";
      var next = cur === "light" ? "dark" : "light";
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
    });
  }

  /* ---- the koshas audio URL scheme: YouTube &t=SECONDSs deep link ---- */
  function makeAudioFor(sessions) {
    var byId = {};
    (sessions || []).forEach(function (s) { byId[s.id] = s; });
    return function audioFor(sessionId, seconds) {
      var vid = byId[sessionId] && byId[sessionId].vid;
      if (!vid) return null; // audio-only / no recording → no deep link
      return null;   // recording is not public
    };
  }

  function boot(data) {
    // Resolver: the SHARED resolve(session, ts) interface, fed by index.json and
    // the koshas YouTube scheme. (Same contract as corpus cite.js / graph.)
    var resolver = window.PortalResolver.makeResolver(data, {
      audioFor: makeAudioFor(data.sessions),
    });

    window.PortalEngine.create({
      data: data,
      resolver: resolver,
      pageSize: 25,
      dom: {
        q: "q", results: "results", status: "status", counts: "counts",
        sessFilters: "sessFilters", loadMore: "loadMore",
        loadMoreWrap: "loadMoreWrap", footMeta: "footMeta",
      },
      sessionChipLabel: function (sid) {
        var s = (data.sessions || []).filter(function (x) { return x.id === sid; })[0];
        return "S" + (s && s.n != null ? s.n : "?");
      },
      sessionChipTitle: function (sid) {
        var s = (data.sessions || []).filter(function (x) { return x.id === sid; })[0];
        return s ? (s.title || sid) + (s.date ? " (" + s.date + ")" : "") : sid;
      },
      langLabel: function (l) { return String(l || "en").toUpperCase(); },
      footerText: function (d) {
        return d.series + " · " + (d.sessions || []).length + " sessions · " +
               (d.cues || []).length + " indexed passages (EN + ES).";
      },
      emptyHint: function (d) {
        return (d.cues || []).length + " timestamped passages across " +
               (d.sessions || []).length + " sessions, in English and Spanish.";
      },
    });
  }

  function ensureMiniSearch() {
    if (typeof MiniSearch !== "undefined") return Promise.resolve();
    return new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      s.src = "assets/minisearch.min.js";
      s.onload = resolve;
      s.onerror = function () { reject(new Error("MiniSearch unavailable")); };
      document.head.appendChild(s);
    });
  }

  fetch(INDEX_URL)
    .then(function (r) {
      if (!r.ok) throw new Error("index.json HTTP " + r.status);
      return r.json();
    })
    .then(function (data) { return ensureMiniSearch().then(function () { return data; }); })
    .then(boot)
    .catch(function (err) {
      var status = document.getElementById("status");
      var results = document.getElementById("results");
      if (status) status.textContent = "Could not load the search index — " + err.message;
      if (results) results.innerHTML =
        '<div class="tp-empty"><span class="tp-big">Search unavailable</span>' +
        "The index could not be loaded. If you opened this file directly, serve the " +
        "folder over HTTP (e.g. <code>python -m http.server</code>) so the browser can " +
        "fetch <code>index.json</code>.</div>";
      console.error(err);
    });
})();
