/* ===========================================================================
   layer-toggle.js — community legend + show/hide filter (talks#57).

   ONE job: given the node/link D3 selections and a `communities` lookup, render
   a clickable legend and filter the graph by community. Pure view logic, no
   koshas hardcoding, no data fetching.

   The filter state is a single Set of *hidden* community keys. Toggling a row
   flips membership and re-applies `display:none` on the affected nodes/links —
   the force simulation is NOT restarted, so positions are preserved and the
   toggle feels instant. (See LAYER-TOGGLE.md for the full rationale.)

   Exposes a small global `LayerToggle` (and CommonJS export for `node --check`).
   =========================================================================== */
(function (root) {
  "use strict";

  /**
   * @param {object} opts
   * @param {object} opts.communities  key -> { label, hue }
   * @param {object} opts.selections   { node, link, linkLabel } D3 selections
   * @param {HTMLElement} opts.legendEl container to render legend rows into
   * @param {function(string):string} opts.colorFor  community key -> CSS color
   * @returns {{ hidden:Set, applyVisibility:function, buildLegend:function,
   *             reset:function }}
   */
  function create(opts) {
    var communities = opts.communities || {};
    var sel = opts.selections || {};
    var legendEl = opts.legendEl;
    var colorFor = opts.colorFor || function () { return "currentColor"; };

    var hidden = new Set();

    function communityOf(endpoint) {
      // After forceLink resolves ids -> node objects, endpoints carry .community.
      return typeof endpoint === "object" ? endpoint.community : null;
    }

    function applyVisibility() {
      if (sel.node) {
        sel.node.style("display", function (d) {
          return hidden.has(d.community) ? "none" : null;
        });
      }
      var edgeRule = function (d) {
        return hidden.has(communityOf(d.source)) || hidden.has(communityOf(d.target))
          ? "none" : null;
      };
      if (sel.link) sel.link.style("display", edgeRule);
      if (sel.linkLabel) sel.linkLabel.style("display", edgeRule);
    }

    function buildLegend() {
      if (!legendEl) return;
      legendEl.innerHTML = "";
      Object.keys(communities).forEach(function (key) {
        var row = document.createElement("div");
        row.className = "leg-row" + (hidden.has(key) ? " off" : "");
        var dot = document.createElement("span");
        dot.className = "leg-dot";
        dot.style.background = colorFor(key);
        var label = document.createElement("span");
        label.textContent = communities[key].label || key;
        row.appendChild(dot);
        row.appendChild(label);
        row.addEventListener("click", function () {
          if (hidden.has(key)) hidden.delete(key); else hidden.add(key);
          applyVisibility();
          buildLegend();
        });
        legendEl.appendChild(row);
      });
    }

    function reset() {
      hidden.clear();
      applyVisibility();
      buildLegend();
    }

    buildLegend();
    return {
      hidden: hidden,
      applyVisibility: applyVisibility,
      buildLegend: buildLegend,
      reset: reset,
    };
  }

  var LayerToggle = { create: create };
  if (typeof module !== "undefined" && module.exports) module.exports = LayerToggle;
  root.LayerToggle = LayerToggle;
})(typeof window !== "undefined" ? window : this);
