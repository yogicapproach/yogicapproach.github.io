/* ===========================================================================
   force-graph.js — reusable, data-driven D3 v7 force-graph ENGINE (talks#29/#57).

   ONE job: render a force-directed graph from a generic graph payload and wire
   the standard interactions (zoom/drag, focus + neighbour highlight, search,
   edge-label toggle, reset). It composes the sibling modules:
     - LayerToggle (layer-toggle.js) for the community legend + show/hide filter,
     - CiteLink     (cite-link.js)    for the clickable Source section in the panel.

   NO koshas-specific knowledge lives here. Everything app-specific is supplied
   through `config`:
     - the data (config.data),
     - DOM element ids/refs (config.dom),
     - a colour function (config.colorFor),
     - a node-panel renderer callback (config.renderPanelBody) — the host decides
       what a node's detail looks like; the engine only owns the Source section,
       connections list, focus state, and the legend.

   Data contract (config.data):
     {
       meta: { communities: { <key>: { label, hue? }, ... }, ... },
       nodes: [ { id, label, community, size?, sessions?, cite?, ref?, ... } ],
       edges: [ { source, target, rel? } ]
     }
   Only id/label/community are required on a node; everything else is optional and
   passed straight through to the host's renderPanelBody.

   Depends on a global `d3` (v7). Exposes a global `ForceGraph`.
   =========================================================================== */
(function (root) {
  "use strict";

  /**
   * @param {object} config
   * @param {object} config.data            graph payload (see contract above)
   * @param {object} config.dom             { svg, panel, panelSource, panelRels,
   *                                           legend, search, labelsBtn, resetBtn,
   *                                           loading? } — elements or element ids
   * @param {function(string):string} config.colorFor  community key -> CSS color
   * @param {function(HTMLElement,object,object):void} [config.renderPanelBody]
   *        (panelEl, node, api) -> fill the app-specific part of the panel.
   *        `api.focusNode(id)` lets the host wire its own cross-links.
   * @param {object} [config.citeLink]      a CiteLink instance (Source section).
   * @param {function():void} [config.onReady]
   * @returns {object} api { focusNode, clearFocus, recolor, layer }
   */
  function create(config) {
    var d3 = root.d3;   // read lazily: d3 (CDN) may load after this module
    if (!d3) throw new Error("ForceGraph requires d3 (v7) on the page");
    var data = config.data;
    var dom = resolveDom(config.dom);
    var colorFor = config.colorFor;
    var citeLink = config.citeLink || null;
    var renderPanelBody = config.renderPanelBody || function () {};

    var communities = (data.meta && data.meta.communities) || {};
    var nodes = data.nodes.map(function (n) { return Object.assign({}, n); });
    var links = data.edges.map(function (e) { return Object.assign({}, e); });
    var byId = {};
    nodes.forEach(function (n) { byId[n.id] = n; });

    function sizeOf(d) { return d.size != null ? d.size : 12; }
    function radius(d) { return Math.sqrt(sizeOf(d)) * 2.4; }

    var W = window.innerWidth, H = window.innerHeight;
    var svg = d3.select(dom.svg).attr("viewBox", [0, 0, W, H]);
    svg.selectAll("*").remove();

    var defs = svg.append("defs");
    defs.append("marker")
      .attr("id", "fg-arrow").attr("viewBox", "0 -5 10 10").attr("refX", 17)
      .attr("refY", 0).attr("markerWidth", 6).attr("markerHeight", 6).attr("orient", "auto")
      .append("path").attr("d", "M0,-4L9,0L0,4").attr("fill", "currentColor")
      .attr("class", "fg-arrowhead");

    var rootG = svg.append("g");
    var zoom = d3.zoom().scaleExtent([0.3, 4]).on("zoom", function (ev) {
      rootG.attr("transform", ev.transform);
    });
    svg.call(zoom);

    // Layer order: decorations (rings) behind, then links, a matrix layer
    // (used only by alternate layouts), then nodes on top.
    var decoG = rootG.append("g").attr("class", "deco-layer");

    var link = rootG.append("g").selectAll("line").data(links).join("line")
      .attr("class", "link").attr("marker-end", "url(#fg-arrow)");

    var linkLabel = rootG.append("g").selectAll("text").data(links).join("text")
      .attr("class", "link-label").attr("text-anchor", "middle")
      .text(function (d) { return d.rel || ""; });

    var matrixG = rootG.append("g").attr("class", "matrix-layer").style("display", "none");

    var node = rootG.append("g").selectAll("g").data(nodes).join("g")
      .attr("class", "node")
      .call(d3.drag().on("start", dragstart).on("drag", dragged).on("end", dragend))
      .on("click", function (ev, d) { ev.stopPropagation(); focusNode(d.id); });

    node.append("circle")
      .attr("r", radius)
      .attr("fill", function (d) { return colorFor(d.community); });

    node.append("text")
      .attr("class", "main-label")
      .attr("x", function (d) { return radius(d) + 5; })
      .attr("y", "0.32em")
      .attr("font-size", function (d) { return (10 + sizeOf(d) * 0.16).toFixed(1) + "px"; })
      .text(function (d) { return d.label; });

    // Layout state (declared before the sim so the first tick sees simActive=true).
    var simActive = true;          // is the force sim currently driving tick()?
    var matrixMode = false;        // is the matrix cell grid showing?

    var sim = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(function (d) { return d.id; })
        .distance(function (l) {
          return l.rel === "comprises" || l.rel === "subtler than" ? 70 : 95;
        })
        .strength(0.35))
      .force("charge", d3.forceManyBody().strength(-340))
      .force("center", d3.forceCenter(W / 2, H / 2))
      .force("collide", d3.forceCollide().radius(function (d) { return radius(d) + 16; }))
      .force("x", d3.forceX(W / 2).strength(0.04))
      .force("y", d3.forceY(H / 2).strength(0.05))
      .on("tick", tick);

    function tick() {
      if (!simActive) return;   // a static/matrix layout owns positions now
      link.attr("x1", function (d) { return d.source.x; })
        .attr("y1", function (d) { return d.source.y; })
        .attr("x2", function (d) { return d.target.x; })
        .attr("y2", function (d) { return d.target.y; });
      linkLabel.attr("x", function (d) { return (d.source.x + d.target.x) / 2; })
        .attr("y", function (d) { return (d.source.y + d.target.y) / 2; });
      node.attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; });
    }

    function dragstart(ev, d) {
      if (!ev.active) sim.alphaTarget(0.3).restart();
      d.fx = d.x; d.fy = d.y; svg.classed("dragging", true);
    }
    function dragged(ev, d) { d.fx = ev.x; d.fy = ev.y; }
    function dragend(ev, d) {
      if (!ev.active) sim.alphaTarget(0);
      d.fx = null; d.fy = null; svg.classed("dragging", false);
    }

    /* neighbour map for focus highlighting */
    var nbr = {};
    nodes.forEach(function (n) { nbr[n.id] = new Set([n.id]); });
    links.forEach(function (l) {
      var s = typeof l.source === "object" ? l.source.id : l.source;
      var t = typeof l.target === "object" ? l.target.id : l.target;
      nbr[s].add(t); nbr[t].add(s);
    });

    /* ---- layer toggle (community legend + filter) ----
       A mutable hook lets a host-side sibling filter (SessionFilter) re-apply
       after every community toggle, so the two filters intersect. */
    var layerChangeHook = function () {};
    var layer = root.LayerToggle ? root.LayerToggle.create({
      communities: communities,
      selections: { node: node, link: link, linkLabel: linkLabel },
      legendEl: dom.legend,
      colorFor: colorFor,
      onChange: function () { layerChangeHook(); },
    }) : { applyVisibility: function () {}, buildLegend: function () {}, reset: function () {} };

    /* ---- focus + side panel ---- */
    var focused = null;

    function clearFocus() {
      focused = null;
      node.classed("dim", false).classed("focus", false);
      link.classed("hl", false);
    }

    function focusNode(id) {
      var d = byId[id]; if (!d) return;
      focused = d;
      var keep = nbr[d.id];
      node.classed("dim", function (n) { return !keep.has(n.id); })
        .classed("focus", function (n) { return n.id === d.id; });
      link.classed("hl", function (l) {
        return l.source.id === d.id || l.target.id === d.id;
      });
      openPanel(d);
    }

    var panelApi = { focusNode: focusNode, byId: byId, communities: communities };

    function openPanel(d) {
      if (dom.panel) dom.panel.classList.add("open");

      // App-specific body (titles, sanskrit, sessions, …) — host owns this.
      if (dom.panel) renderPanelBody(dom.panel, d, panelApi);

      // Connections list (engine-owned: derived purely from edges).
      if (dom.panelRels) renderConnections(dom.panelRels, d);

      // Source section (engine-owned via CiteLink): never a bare ref.
      if (citeLink && dom.panelSource) citeLink.render(dom.panelSource, d);
    }

    function renderConnections(wrap, d) {
      wrap.textContent = "";
      var rels = links.filter(function (l) {
        return l.source.id === d.id || l.target.id === d.id;
      });
      var head = document.createElement("p");
      head.className = "p-sect";
      head.textContent = "Connections (" + rels.length + ")";
      wrap.appendChild(head);

      var ul = document.createElement("ul");
      ul.className = "rel-list";
      rels.forEach(function (l) {
        var out = l.source.id === d.id;
        var other = out ? l.target : l.source;
        var li = document.createElement("li");
        var a = document.createElement("a");
        a.textContent = other.label;
        a.addEventListener("click", function () { focusNode(other.id); });
        var rel = document.createElement("span");
        rel.className = "rel-rel";
        rel.textContent = (out ? " — " : " ← ") + (l.rel || "related") + (out ? " →" : " ");
        if (out) { li.appendChild(a); li.appendChild(rel); }
        else { li.appendChild(rel); li.appendChild(a); }
        ul.appendChild(li);
      });
      wrap.appendChild(ul);
    }

    function closePanel() {
      if (dom.panel) dom.panel.classList.remove("open");
      clearFocus();
    }
    svg.on("click", closePanel);

    /* ---- recolor (theme switch) ---- */
    function recolor() {
      node.selectAll("circle").attr("fill", function (d) { return colorFor(d.community); });
      matrixG.selectAll("rect.mx-cell")
        .attr("fill", function (d) { return colorFor(byId[d.source].community); });
      layer.buildLegend();
    }

    /* ---- search ---- */
    if (dom.search) {
      dom.search.addEventListener("input", function () {
        var q = dom.search.value.trim().toLowerCase();
        if (!q) { clearFocus(); return; }
        node.classed("dim", function (n) {
          return n.label.toLowerCase().indexOf(q) < 0;
        });
      });
      dom.search.addEventListener("change", function () {
        var q = dom.search.value.trim().toLowerCase();
        var hit = nodes.find(function (n) { return n.label.toLowerCase().indexOf(q) >= 0; });
        if (hit) focusNode(hit.id);
      });
    }

    /* ---- edge-label toggle ---- */
    if (dom.labelsBtn) {
      dom.labelsBtn.addEventListener("click", function () {
        var on = dom.labelsBtn.classList.toggle("on");
        linkLabel.classed("show", on);
      });
    }

    /* ---- reset ---- */
    if (dom.resetBtn) {
      dom.resetBtn.addEventListener("click", function () {
        clearFocus();
        layer.reset();
        if (dom.search) dom.search.value = "";
        svg.transition().duration(500).call(zoom.transform, d3.zoomIdentity);
        // Only re-heat the force sim if a force layout is active; for a static
        // or matrix layout, ask the host to re-apply the current layout instead.
        if (simActive && !matrixMode) sim.alpha(0.5).restart();
        else relayoutHook();
      });
    }

    /* A host can register a callback that re-applies the currently selected
       (static/matrix) layout — used on reset + resize when force isn't active. */
    var relayoutHook = function () {};

    /* ---- resize ---- */
    window.addEventListener("resize", function () {
      W = window.innerWidth; H = window.innerHeight;
      svg.attr("viewBox", [0, 0, W, H]);
      sim.force("center", d3.forceCenter(W / 2, H / 2));
      sim.force("x", d3.forceX(W / 2).strength(0.04));
      sim.force("y", d3.forceY(H / 2).strength(0.05));
      if (simActive && !matrixMode) sim.alpha(0.3).restart();
      else relayoutHook();   // re-fit the static/matrix layout to the new size
    });

    if (dom.loading) dom.loading.style.display = "none";
    if (config.onReady) config.onReady();

    /* Re-settle the simulation on the currently visible subgraph (used by the
       session filter so the layout reflows when nodes are added/removed). */
    function reheat() { if (simActive) sim.alpha(0.6).restart(); }

    /* ===================================================================
       LAYOUT SWITCHING (talks#29/#57) — reuse the layouts-lab geometry on
       the MAIN graph. The lab's KoshaLayouts.* modules compute static
       positions / matrix cells; here we apply them to THIS engine's own
       nodes/links/SVG. The force simulation is stopped for static + matrix
       layouts (`simActive=false` so tick() can't fight the static x/y) and
       restarted for Force. Node click -> panel, cites, session chips,
       legend and the session filter all keep working because we only
       move geometry; we never rebuild the node/link selections.
       =================================================================== */
    function stopSim() { simActive = false; sim.stop(); }
    function startSim() {
      simActive = true;
      matrixMode = false;
      matrixG.style("display", "none");
      link.style("display", null); linkLabel.style("display", null);
      node.style("display", null);
      drawDecorations([]);
      sim.alpha(0.6).restart();
    }

    /* Apply a static positions map { id: {x,y} } to nodes + links, with an
       optional smooth transition. Decorations (rings/labels) are drawn from
       the layout result. */
    function applyPositions(positions, decorations, animate) {
      simActive = false;
      matrixMode = false;
      sim.stop();
      matrixG.style("display", "none");
      link.style("display", null); linkLabel.style("display", null);
      node.style("display", null);
      drawDecorations(decorations || []);

      // keep d.x/d.y in sync so neighbour highlight + reheat math stay valid
      nodes.forEach(function (d) {
        var p = positions[d.id];
        if (p) { d.x = p.x; d.y = p.y; d.fx = null; d.fy = null; }
      });

      var dur = animate ? 760 : 0;
      node.transition().duration(dur)
        .attr("transform", function (d) {
          var p = positions[d.id];
          return p ? "translate(" + p.x + "," + p.y + ")" : null;
        });
      link.transition().duration(dur)
        .attr("x1", function (d) { var p = positions[endId(d.source)]; return p ? p.x : 0; })
        .attr("y1", function (d) { var p = positions[endId(d.source)]; return p ? p.y : 0; })
        .attr("x2", function (d) { var p = positions[endId(d.target)]; return p ? p.x : 0; })
        .attr("y2", function (d) { var p = positions[endId(d.target)]; return p ? p.y : 0; });
      linkLabel.transition().duration(dur)
        .attr("x", function (d) {
          var a = positions[endId(d.source)], b = positions[endId(d.target)];
          return a && b ? (a.x + b.x) / 2 : 0;
        })
        .attr("y", function (d) {
          var a = positions[endId(d.source)], b = positions[endId(d.target)];
          return a && b ? (a.y + b.y) / 2 : 0;
        });
    }

    function endId(x) { return typeof x === "object" ? x.id : x; }

    /* Render an adjacency-matrix view from a layout result { order, cells }.
       Node-link layers hide; clickable row/col labels still open the panel. */
    function renderMatrix(res, colorOf) {
      simActive = false; matrixMode = true;
      sim.stop();
      drawDecorations([]);
      link.style("display", "none"); linkLabel.style("display", "none");
      node.style("display", "none");
      matrixG.style("display", null);
      matrixG.selectAll("*").remove();

      var order = res.order, cells = res.cells, n = order.length;
      var topMargin = 90, sideMargin = 170, bottomMargin = 50;
      var size = Math.min(W - sideMargin - 60, H - topMargin - bottomMargin);
      var c = size / n;
      var ox = (W - size) / 2 + 50;
      var oy = topMargin + Math.max(0, (H - topMargin - bottomMargin - size) / 2);
      var color = colorOf || function () { return "currentColor"; };

      matrixG.append("g").selectAll("rect.mx-cell").data(cells).join("rect")
        .attr("class", "mx-cell")
        .attr("x", function (d) { return ox + d.c * c; })
        .attr("y", function (d) { return oy + d.r * c; })
        .attr("width", c).attr("height", c)
        .attr("fill", function (d) { return color(byId[d.source].community); })
        .attr("opacity", 0.9)
        .append("title").text(function (d) {
          return byId[d.source].label + " — " + (d.rel || "") + " → " + byId[d.target].label;
        });

      var lf = Math.max(6, Math.min(11, c - 1));
      matrixG.append("g").selectAll("text.row").data(order).join("text")
        .attr("class", "mx-label row").attr("x", ox - 6)
        .attr("y", function (d, i) { return oy + (i + 0.5) * c; })
        .attr("text-anchor", "end").attr("dominant-baseline", "middle")
        .attr("font-size", lf + "px").style("cursor", "pointer")
        .text(function (d) { return d.label; })
        .on("click", function (ev, d) { ev.stopPropagation(); focusNode(d.id); });

      matrixG.append("g").selectAll("text.col").data(order).join("text")
        .attr("class", "mx-label col")
        .attr("transform", function (d, i) {
          return "translate(" + (ox + (i + 0.5) * c) + "," + (oy - 6) + ") rotate(-60)";
        })
        .attr("text-anchor", "start").attr("font-size", lf + "px").style("cursor", "pointer")
        .text(function (d) { return d.label; })
        .on("click", function (ev, d) { ev.stopPropagation(); focusNode(d.id); });
    }

    /* decorations: dashed rings + ring labels (concentric needs these) */
    function drawDecorations(list) {
      var rings = list.filter(function (d) { return d.type === "ring"; });
      var ringLabels = list.filter(function (d) { return d.type === "ringLabel"; });

      var r = decoG.selectAll("circle.ring").data(rings);
      r.exit().remove();
      r.enter().append("circle").attr("class", "ring").merge(r)
        .attr("cx", function (d) { return d.cx; }).attr("cy", function (d) { return d.cy; })
        .attr("r", function (d) { return d.r; });

      var rl = decoG.selectAll("text.ring-label").data(ringLabels);
      rl.exit().remove();
      rl.enter().append("text").attr("class", "ring-label").merge(rl)
        .attr("x", function (d) { return d.x; }).attr("y", function (d) { return d.y; })
        .attr("text-anchor", function (d) { return d.anchor || "middle"; })
        .text(function (d) { return d.text; });
    }

    return {
      focusNode: focusNode,
      clearFocus: clearFocus,
      closePanel: closePanel,
      // The currently focused node datum (or null) — lets a host re-render the
      // open panel after it changes label/desc (e.g. on a language switch).
      focused: function () { return focused; },
      recolor: recolor,
      reheat: reheat,
      layer: layer,
      // Host registers a callback fired after each community-toggle change, so a
      // sibling filter (SessionFilter) can re-apply and the filters stay intersected.
      onLayerChange: function (fn) { layerChangeHook = fn || function () {}; },
      nodes: nodes,
      edges: links,
      byId: byId,
      // Raw D3 selections so a host-side filter (e.g. SessionFilter) can compose
      // with the engine's own visibility without re-querying the DOM.
      selections: { node: node, link: link, linkLabel: linkLabel },

      /* ---- layout switching (talks#29/#57) ---- */
      // Current canvas dimensions, for building a layout context.
      dimensions: function () { return { W: W, H: H }; },
      // Apply a static positions map (Concentric/etc.) with optional animation.
      applyPositions: applyPositions,
      // Render the adjacency-matrix cell grid (Matrix). colorOf: community->css.
      renderMatrix: renderMatrix,
      // Stop the force sim (so a static layout owns x/y) / restart it (Force).
      stopSim: stopSim,
      startSim: startSim,
      // Is the matrix cell grid currently showing? (panel/filters stay live.)
      isMatrix: function () { return matrixMode; },
      // Host registers a re-apply-current-layout callback for reset + resize
      // while a non-force layout is active.
      onRelayout: function (fn) { relayoutHook = fn || function () {}; },
    };
  }

  function resolveDom(dom) {
    var out = {};
    Object.keys(dom || {}).forEach(function (k) {
      var v = dom[k];
      out[k] = typeof v === "string" ? document.getElementById(v) : v;
    });
    return out;
  }

  var ForceGraph = { create: create };
  if (typeof module !== "undefined" && module.exports) module.exports = ForceGraph;
  root.ForceGraph = ForceGraph;
})(typeof window !== "undefined" ? window : this);
