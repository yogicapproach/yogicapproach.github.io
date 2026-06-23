/* ===========================================================================
   session-filter.js — "watch the graph build, session by session" (talks#29).

   Sibling to layer-toggle.js, same shape and rationale. ONE job: given the
   node/link D3 selections and a `sessions` lookup, render a control-bar group
   ( All · S1 · S2 · S3 · S4 ) and filter the graph to the nodes that belong to
   the selected session.

   CUMULATIVE by default — "up to and including Sx": picking S2 keeps every node
   whose `sessions` array touches S1 OR S2, so you literally watch the graph grow
   as you step forward. "All" (default) is the reset: nothing filtered.

   Unlike the community toggle (which only sets display:none and preserves the
   layout), this filter is meant to make the force layout RE-SETTLE on the visible
   subgraph — so it calls an injected `onChange` after re-applying visibility,
   letting the host nudge the simulation (sim.alpha().restart()). Hidden nodes are
   given display:none (removed from view) and excluded from the link rule.

   Pure view logic — no koshas hardcoding, no data fetching. Composes cleanly
   alongside LayerToggle: both only set `style("display")`, and applyVisibility
   here respects an injected `isLayerHidden(community)` predicate so the two
   filters intersect instead of fighting.

   Exposes a small global `SessionFilter` (+ CommonJS export for `node --check`).
   =========================================================================== */
(function (root) {
  "use strict";

  /**
   * @param {object} opts
   * @param {object} opts.sessions      key -> { label, date?, hue? } (meta.sessions)
   * @param {object} opts.selections    { node, link, linkLabel } D3 selections
   * @param {HTMLElement} opts.barEl     container to render the control group into
   * @param {function(string):boolean} [opts.isLayerHidden]
   *        community key -> is it currently hidden by the community layer toggle?
   *        Lets the two filters intersect (a node hidden by either stays hidden).
   * @param {function():void} [opts.onChange]
   *        called after each filter change, so the host can re-settle the layout.
   * @returns {{ active:?string, order:string[], applyVisibility:function,
   *             isNodeVisible:function, buildBar:function, set:function,
   *             reset:function }}
   */
  function create(opts) {
    var sessions = opts.sessions || {};
    var sel = opts.selections || {};
    var barEl = opts.barEl;
    var isLayerHidden = opts.isLayerHidden || function () { return false; };
    var onChange = opts.onChange || function () {};

    // Session keys in chronological order (S1, S2, …). meta.sessions is the
    // source of order; sort the Sxx keys numerically, keep any others appended.
    var order = Object.keys(sessions).sort(function (a, b) {
      var ma = /^S(\d+)$/.exec(a), mb = /^S(\d+)$/.exec(b);
      if (ma && mb) return (+ma[1]) - (+mb[1]);
      if (ma) return -1;
      if (mb) return 1;
      return a < b ? -1 : a > b ? 1 : 0;
    });

    // null = "All" (no session filter). Otherwise the selected session key.
    var active = null;

    // Cumulative membership: a node is in-scope when ANY of its sessions falls at
    // or before `active` in `order`. (For non-Sxx tags the host can still mark a
    // node; here we treat unknown tags as out-of-scope unless active is null.)
    function cutoffIndex() {
      return active == null ? Infinity : order.indexOf(active);
    }

    function isNodeVisible(d) {
      if (active == null) return true;       // "All"
      var cut = cutoffIndex();
      var tags = d.sessions || [];
      for (var i = 0; i < tags.length; i++) {
        var idx = order.indexOf(tags[i]);
        if (idx >= 0 && idx <= cut) return true;
      }
      return false;
    }

    function communityOf(endpoint) {
      return typeof endpoint === "object" ? endpoint.community : null;
    }

    // A node is shown only if the session filter keeps it AND the layer toggle
    // hasn't hidden its community.
    function nodeShown(d) {
      return isNodeVisible(d) && !isLayerHidden(d.community);
    }

    function applyVisibility() {
      if (sel.node) {
        sel.node.style("display", function (d) {
          return nodeShown(d) ? null : "none";
        });
      }
      var edgeRule = function (d) {
        // Endpoints are node objects after forceLink resolves ids.
        var s = d.source, t = d.target;
        var sOk = (typeof s === "object") ? nodeShown(s) : true;
        var tOk = (typeof t === "object") ? nodeShown(t) : true;
        // also respect the layer toggle on raw community (defensive)
        if (isLayerHidden(communityOf(s)) || isLayerHidden(communityOf(t))) return "none";
        return (sOk && tOk) ? null : "none";
      };
      if (sel.link) sel.link.style("display", edgeRule);
      if (sel.linkLabel) sel.linkLabel.style("display", edgeRule);
    }

    function buildBar() {
      if (!barEl) return;
      barEl.innerHTML = "";
      var items = [{ key: null, label: "All" }].concat(
        order.map(function (k) { return { key: k, label: k }; })
      );
      items.forEach(function (it) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "ses-btn" + (active === it.key ? " on" : "");
        btn.textContent = it.label;
        if (it.key) {
          var s = sessions[it.key];
          btn.title = (s && s.label) || it.key;
        } else {
          btn.title = "Show all sessions";
        }
        btn.addEventListener("click", function () { set(it.key); });
        barEl.appendChild(btn);
      });
    }

    function set(key) {
      active = key;
      applyVisibility();
      buildBar();
      onChange();
    }

    function reset() {
      set(null);
    }

    buildBar();
    return {
      get active() { return active; },
      order: order,
      applyVisibility: applyVisibility,
      isNodeVisible: isNodeVisible,
      buildBar: buildBar,
      set: set,
      reset: reset,
    };
  }

  var SessionFilter = { create: create };
  if (typeof module !== "undefined" && module.exports) module.exports = SessionFilter;
  root.SessionFilter = SessionFilter;
})(typeof window !== "undefined" ? window : this);
