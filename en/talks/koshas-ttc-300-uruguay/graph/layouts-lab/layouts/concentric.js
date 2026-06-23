/* ===========================================================================
   concentric.js — concentric "nested sheaths" layout (the domain-true view).
   Part of the Koshas Layouts Lab (talks #29/#57).

   The five koshas are NESTED sheaths: annamaya (gross, physical) is the OUTER
   ring; anandamaya (bliss, subtlest) is the INNER ring. The `kosha` hub sits at
   the very centre. Every other node is a "satellite": it is placed on the ring
   of the kosha it connects to most strongly; nodes with no kosha edge are placed
   on an OUTER halo ring, bucketed by community so groups stay together.

   This encodes the actual yoga semantics — concentric layers from gross to
   subtle — instead of an arbitrary force equilibrium.
   =========================================================================== */
(function (root) {
  "use strict";

  // Outer -> inner. annamaya is grossest/outermost, anandamaya subtlest/innermost.
  var KOSHA_ORDER = ["annamaya", "pranamaya", "manomaya", "vijnanamaya", "anandamaya"];

  root.KoshaLayouts = root.KoshaLayouts || {};
  root.KoshaLayouts.concentric = {
    label: "Concentric koshas",
    blurb: "The five sheaths as nested rings — annamaya (gross) outside, anandamaya (bliss) at the core. Concepts orbit the kosha they belong to.",
    live: false,
    compute: function (ctx) {
      var nodes = ctx.nodes, edges = ctx.edges, byId = ctx.byId;
      var cx = ctx.W / 2, cy = ctx.H / 2;
      var maxR = Math.min(ctx.W, ctx.H) / 2 - 70;

      // Ring radii: index 0 (annamaya) outermost. 5 kosha rings + 1 outer halo.
      // Innermost kosha ring leaves room for the centre hub.
      var nRings = KOSHA_ORDER.length;            // 5
      var inner = maxR * 0.18;                     // anandamaya ring
      var step = (maxR - inner) / (nRings - 1);
      function koshaRing(i) { return inner + (nRings - 1 - i) * step; } // i=0 -> outermost
      var haloR = maxR + 46;                       // un-kosha'd nodes ring

      var ringRadius = {};
      KOSHA_ORDER.forEach(function (k, i) { ringRadius[k] = koshaRing(i); });

      // ---- assign each satellite to a kosha (or to the halo) ----------------
      // A node's kosha = the kosha it has the most edges to (ties: subtler wins,
      // so deep concepts pull inward). Kosha nodes own their own ring; the hub
      // is centre; everything else is a satellite.
      var koshaIndex = {};
      KOSHA_ORDER.forEach(function (k, i) { koshaIndex[k] = i; });

      function neighboursKoshaScore(id) {
        var score = {}; // kosha -> count
        edges.forEach(function (e) {
          var s = eid(e.source), t = eid(e.target);
          var other = null;
          if (s === id && koshaIndex[t] != null) other = t;
          else if (t === id && koshaIndex[s] != null) other = s;
          if (other) score[other] = (score[other] || 0) + 1;
        });
        return score;
      }
      function eid(x) { return typeof x === "object" ? x.id : x; }

      var assignment = {}; // id -> kosha key | "__halo"
      nodes.forEach(function (n) {
        if (n.id === "kosha") { assignment[n.id] = "__center"; return; }
        if (koshaIndex[n.id] != null) { assignment[n.id] = n.id; return; }
        var score = neighboursKoshaScore(n.id);
        var best = null, bestC = 0, bestDepth = -1;
        Object.keys(score).forEach(function (k) {
          var c = score[k], depth = koshaIndex[k];
          if (c > bestC || (c === bestC && depth > bestDepth)) { best = k; bestC = c; bestDepth = depth; }
        });
        assignment[n.id] = best || "__halo";
      });

      // ---- group satellites per ring, spread them around the circle --------
      var buckets = {}; // ringKey -> [nodes]
      nodes.forEach(function (n) {
        var a = assignment[n.id];
        if (a === "__center") return;
        var key = a === "__halo" ? "__halo" : a;
        (buckets[key] = buckets[key] || []).push(n);
      });

      var positions = {};
      positions["kosha"] = { x: cx, y: cy };

      // Place kosha nodes themselves first, evenly, as anchors of their ring,
      // so satellites can be clustered near (but not on top of) their kosha.
      var koshaAngle = {};
      KOSHA_ORDER.forEach(function (k, i) {
        // stagger kosha anchor angles so labels don't stack vertically
        koshaAngle[k] = (-90 + i * 26) * Math.PI / 180;
      });

      function placeRing(ringKey, radius, members, anchorAngle) {
        // Sort: the kosha node itself first, then by community for visual runs.
        members.sort(function (a, b) {
          if (a.community !== b.community) return a.community < b.community ? -1 : 1;
          return a.id < b.id ? -1 : 1;
        });
        var n = members.length;
        members.forEach(function (m, idx) {
          var ang;
          if (m.id === ringKey) ang = anchorAngle != null ? anchorAngle : 0;
          else {
            // even spread, rotated so it opens away from the anchor kosha
            ang = (anchorAngle != null ? anchorAngle : -Math.PI / 2) +
              ((idx + 1) / (n + 1)) * 2 * Math.PI;
          }
          positions[m.id] = {
            x: cx + radius * Math.cos(ang),
            y: cy + radius * Math.sin(ang)
          };
        });
      }

      KOSHA_ORDER.forEach(function (k) {
        var members = buckets[k] || [];
        // ensure the kosha node is in its own ring bucket
        if (members.indexOf(byId[k]) < 0 && byId[k]) members.push(byId[k]);
        placeRing(k, ringRadius[k], members, koshaAngle[k]);
      });
      if (buckets["__halo"]) placeRing("__halo", haloR, buckets["__halo"], -Math.PI / 2);

      // ---- decorations: a dashed ring + label per kosha --------------------
      var decorations = [];
      KOSHA_ORDER.forEach(function (k) {
        var d = byId[k];
        decorations.push({ type: "ring", cx: cx, cy: cy, r: ringRadius[k] });
        decorations.push({
          type: "ringLabel",
          x: cx, y: cy - ringRadius[k] - 6,
          text: (d && d.label ? d.label : k)
        });
      });
      decorations.push({ type: "ring", cx: cx, cy: cy, r: haloR });
      decorations.push({ type: "ringLabel", x: cx, y: cy - haloR - 6, text: "concepts · metaphors · practices" });

      return { positions: positions, decorations: decorations };
    }
  };
})(typeof window !== "undefined" ? window : this);
