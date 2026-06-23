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

    var link = rootG.append("g").selectAll("line").data(links).join("line")
      .attr("class", "link").attr("marker-end", "url(#fg-arrow)");

    var linkLabel = rootG.append("g").selectAll("text").data(links).join("text")
      .attr("class", "link-label").attr("text-anchor", "middle")
      .text(function (d) { return d.rel || ""; });

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

    /* ---- layer toggle (community legend + filter) ---- */
    var layer = root.LayerToggle ? root.LayerToggle.create({
      communities: communities,
      selections: { node: node, link: link, linkLabel: linkLabel },
      legendEl: dom.legend,
      colorFor: colorFor,
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
        sim.alpha(0.5).restart();
      });
    }

    /* ---- resize ---- */
    window.addEventListener("resize", function () {
      W = window.innerWidth; H = window.innerHeight;
      svg.attr("viewBox", [0, 0, W, H]);
      sim.force("center", d3.forceCenter(W / 2, H / 2));
      sim.force("x", d3.forceX(W / 2).strength(0.04));
      sim.force("y", d3.forceY(H / 2).strength(0.05));
      sim.alpha(0.3).restart();
    });

    if (dom.loading) dom.loading.style.display = "none";
    if (config.onReady) config.onReady();

    return {
      focusNode: focusNode,
      clearFocus: clearFocus,
      closePanel: closePanel,
      recolor: recolor,
      layer: layer,
      nodes: nodes,
      byId: byId,
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
