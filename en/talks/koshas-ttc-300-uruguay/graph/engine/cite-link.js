/* ===========================================================================
   cite-link.js — render a node's SOURCE reference as a clickable link (talks#29).

   ONE job: given a node, produce the "Source" section of the side panel so a
   reference is NEVER shown as bare text. Three tiers, in order:

     1. node.cite + a cite-resolver  -> the teacher's exact quote + audio deep-link
        (e.g. "s1#44:43" -> YouTube &t=2683s). Resolver is the corpus `cite.js`.
     2. node.cite, no resolver loaded -> a plain "open the source recording/session"
        link built from the session id (still clickable).
     3. no cite, only node.sessions   -> a "read the session transcript" link to the
        first session the concept appears in (still clickable).

   Pure view logic. The resolver is injected (duck-typed: `{ resolve(session, ts) }`),
   so this module has no dependency on any specific corpus — only the interface.
   No innerHTML with untrusted content; everything is built with DOM nodes.

   Exposes a small global `CiteLink` (and CommonJS export for `node --check`).
   =========================================================================== */
(function (root) {
  "use strict";

  function el(tag, props, text) {
    var n = document.createElement(tag);
    if (props) Object.keys(props).forEach(function (k) { n.setAttribute(k, props[k]); });
    if (text != null) n.textContent = text;
    return n;
  }

  function sectionLabel(text) {
    var p = el("p", null, text);
    p.className = "p-sect";
    return p;
  }

  /**
   * @param {object} opts
   * @param {function(string):(string|null)} [opts.sessionUrl]  session id -> a URL
   *        for tier 2/3 fallback links (e.g. a transcript page). Receives the
   *        session id AS IT APPEARS in node.sessions (e.g. "S2"). Return null to
   *        omit the fallback link (the section is then skipped entirely).
   * @param {function(string):string} [opts.sessionLabel]  session id -> human label.
   * @param {object} [opts.resolver]  cite-resolver: { resolve(sessionId, ts) -> res }.
   *        `res` shape (from corpus cite.js): { ok, text, time, sessionTitle,
   *        session, audio }.
   * @param {string} [opts.label="Source"]  heading text.
   * @returns {{ render: function(HTMLElement, object) }}
   */
  function create(opts) {
    opts = opts || {};
    var resolver = opts.resolver || null;
    var sessionUrl = opts.sessionUrl || function () { return null; };
    var sessionLabel = opts.sessionLabel || function (s) { return s; };
    var heading = opts.label || "Source";

    function setResolver(r) { resolver = r; }   // allow late injection (async load)

    function renderResolvedCite(box, d) {
      var parts = String(d.cite).split("#");
      var res = resolver.resolve(parts[0], parts[1]);
      if (!res || !res.ok) return false;

      box.appendChild(sectionLabel(heading + " (the teacher’s words)"));

      var q = el("blockquote", null, "“" + res.text + "”");
      q.style.cssText = "margin:0 0 8px;font-style:italic;color:var(--ink-soft);" +
        "border-left:3px solid var(--accent,#b07d3a);padding-left:10px;line-height:1.5;";
      box.appendChild(q);

      var meta = el("div");
      meta.style.cssText = "font-size:.82rem;color:var(--ink-soft);";
      var loc = (res.sessionTitle ? res.sessionTitle.split("—")[0].trim() : res.session) +
                " · " + res.time;
      if (res.audio) {
        var a = el("a", { href: res.audio, target: "_blank", rel: "noopener" },
          "▶ " + loc + " — open recording");
        a.style.cssText =
          "color:var(--accent,#b07d3a);font-weight:600;text-decoration:none;";
        meta.appendChild(a);
      } else {
        meta.appendChild(el("span", null, loc + " (audio-only source)"));
      }
      box.appendChild(meta);
      return true;
    }

    function renderSessionFallback(box, d) {
      var sids = d.sessions || [];
      if (d.cite) sids = [String(d.cite).split("#")[0]].concat(sids);  // cite session first
      for (var i = 0; i < sids.length; i++) {
        var url = sessionUrl(sids[i]);
        if (url) {
          box.appendChild(sectionLabel(heading));
          var a = el("a", { href: url, target: "_blank", rel: "noopener" },
            "Read the source — " + sessionLabel(sids[i]));
          a.style.cssText =
            "color:var(--accent,#b07d3a);font-weight:600;text-decoration:none;";
          box.appendChild(a);
          return true;
        }
      }
      return false;
    }

    /**
     * Render the source section into `box` for node `d`. Clears prior content.
     * Guarantees: if the node has any reference at all, the user gets a working
     * link — never bare text.
     */
    function render(box, d) {
      if (!box) return;
      box.textContent = "";
      if (!d) return;

      if (d.cite && resolver && renderResolvedCite(box, d)) return;
      renderSessionFallback(box, d);   // tiers 2 & 3
    }

    return { render: render, setResolver: setResolver };
  }

  var CiteLink = { create: create };
  if (typeof module !== "undefined" && module.exports) module.exports = CiteLink;
  root.CiteLink = CiteLink;
})(typeof window !== "undefined" ? window : this);
