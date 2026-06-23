/* ===========================================================================
   koshas-corpus-host.js — the koshas HOST that wires the drishti-corpus engine.

   The engine (engine/corpus-search.js) knows nothing about koshas. This file is
   the only place koshas-specific search behaviour lives:
     - session pill labels ("S1/S2/S3", "Pir" for Piriápolis),
     - language chip labels (EN/ES),
     - the footer summary line for this corpus.

   The session registry + YouTube ids themselves come from corpus.json (built by
   build-corpus.py from the SESSIONS registry). Swap this host (and the palette
   in koshas-corpus.css) and the same engine drives a different corpus.
   =========================================================================== */
(function () {
  "use strict";

  window.CorpusSearch.create({
    corpusUrl: "assets/corpus.json",
    minisearchUrl: "assets/minisearch.min.js",
    dom: {
      q: "q", results: "results", status: "status", counts: "counts",
      sessFilters: "sessFilters", langFilters: "langFilters",
      loadMore: "loadMore", loadMoreWrap: "loadMoreWrap", footMeta: "footMeta",
    },
    // koshas pill label: "S1/S2/S3", and "Pir" for the audio-only Piriápolis.
    sessionPillLabel: function (s) {
      return s.n ? "S" + s.n : "Pir";
    },
    langLabel: function (l) { return l === "es" ? "ES" : "EN"; },
    footMeta: function (data) {
      return data.series + " · " + data.sessions.length + " sessions · " +
        data.cues.length + " indexed passages · own-transcript corpus " +
        (data.version || "");
    },
  });
})();
