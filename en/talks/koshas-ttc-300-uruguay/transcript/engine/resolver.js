/* ===========================================================================
   resolver.js — the SHARED cite-resolver interface for drishti-portal.

   ONE job, NO DOM: turn (sessionId, timestamp) into the source cue + a
   click-to-audio deep link. This is the SAME interface used by drishti-corpus
   (corpus/assets/cite.js) and the koshas force-graph engine
   (engine/cite-link.js consumes it). Document it once, reuse it everywhere —
   do NOT fork the contract.

       resolver.resolve(sessionId, ts) -> {
         ok:           boolean,
         session:      string,         // the session id queried
         sessionTitle: string|null,
         time:         string,         // human time, e.g. "7:27"
         seconds:      number,         // resolved cue start in seconds
         text:         string|null,    // the source line to quote
         audio:        string|null,    // deep link (youtube &t=…) or null (audio-only)
         reason:       string|null     // why ok=false, when it is
       }

   The portal already loads every cue (index.json) client-side, so the portal's
   resolver is built straight from that payload — no second fetch. A different
   repo can either reuse this builder over its own index.json, or inject its own
   object that duck-types `resolve(session, ts)` with the shape above (e.g. the
   corpus `Cite.makeResolver`). The two are interchangeable by design.

   `audioFor` is injected so the engine stays link-scheme-agnostic: the host maps
   a (session, seconds) pair to whatever player URL it wants (YouTube, Vimeo, a
   local <audio> fragment, …). Default = no audio (returns null).

   Exposes a small global `PortalResolver` (+ CommonJS export for node --check).
   =========================================================================== */
(function (root) {
  "use strict";

  // Parse "MM:SS" or "H:MM:SS" (or bare seconds) into integer seconds.
  function parseTs(ts) {
    if (ts == null) return null;
    if (typeof ts === "number") return Math.max(0, Math.floor(ts));
    var parts = String(ts).trim().split(":").map(function (p) { return parseInt(p, 10); });
    if (!parts.length || parts.some(isNaN)) return null;
    var sec = 0;
    for (var i = 0; i < parts.length; i++) sec = sec * 60 + parts[i];
    return sec;
  }

  function fmtTime(sec) {
    sec = Math.max(0, Math.floor(sec || 0));
    var h = Math.floor(sec / 3600);
    var m = Math.floor((sec % 3600) / 60);
    var s = sec % 60;
    var pad = function (n) { return n < 10 ? "0" + n : "" + n; };
    return (h > 0 ? h + ":" + pad(m) : m) + ":" + pad(s);
  }

  /**
   * Build a resolver bound to one index.json payload.
   *
   * @param {object} payload  the parsed index.json (cue data-contract).
   * @param {object} [opts]
   * @param {function(string, number): (string|null)} [opts.audioFor]
   *        (sessionId, seconds) -> player deep-link, or null. Lets the host own
   *        the audio URL scheme. Defaults to no audio.
   * @returns {{ resolve: function(string, (string|number)): object }}
   */
  function makeResolver(payload, opts) {
    payload = payload || {};
    opts = opts || {};
    var audioFor = opts.audioFor || function () { return null; };

    var sessions = {};
    (payload.sessions || []).forEach(function (s) { sessions[s.id] = s; });

    // Bucket cues by session, sorted by start time, for fast nearest lookup.
    // The contract field for start-seconds is `start`; we also accept the
    // compact `t` alias the koshas build-index.py emits.
    var bySession = {};
    (payload.cues || []).forEach(function (c) {
      var sid = c.session != null ? c.session : c.s;
      (bySession[sid] || (bySession[sid] = [])).push(c);
    });
    Object.keys(bySession).forEach(function (k) {
      bySession[k].sort(function (a, b) { return cueStart(a) - cueStart(b); });
    });

    function cueStart(c) { return c.start != null ? c.start : c.t; }
    function cueEnd(c) { return c.end != null ? c.end : (c.e != null ? c.e : cueStart(c)); }
    function cueText(c) { return c.text != null ? c.text : c.x; }

    /**
     * Resolve one reference: find the cue whose [start,end] window contains the
     * second; else the nearest cue at/just before it (forgiving timestamps).
     */
    function resolve(sessionId, ts) {
      var sec = parseTs(ts);
      var sess = sessions[sessionId];
      var out = {
        ok: false, session: sessionId,
        sessionTitle: sess ? sess.title : null,
        seconds: sec, time: fmtTime(sec),
        text: null, audio: null, reason: null,
      };
      if (sec == null) { out.reason = "bad timestamp '" + ts + "'"; return out; }

      var cues = bySession[sessionId] || [];
      if (!cues.length) { out.reason = "no cues for session '" + sessionId + "'"; return out; }

      var hit = null;
      for (var i = 0; i < cues.length; i++) {
        var c = cues[i];
        if (sec >= cueStart(c) && sec <= cueEnd(c)) { hit = c; break; }
        if (cueStart(c) > sec) break; // sorted: passed the target
      }
      if (!hit) {
        for (var j = 0; j < cues.length; j++) {
          if (cueStart(cues[j]) <= sec) hit = cues[j]; else break;
        }
        if (!hit) hit = cues[0];
      }

      out.ok = true;
      out.seconds = cueStart(hit);
      out.time = fmtTime(out.seconds);
      out.text = cueText(hit);
      out.audio = audioFor(sessionId, out.seconds);
      return out;
    }

    return { resolve: resolve, sessions: sessions };
  }

  var PortalResolver = { makeResolver: makeResolver, parseTs: parseTs, fmtTime: fmtTime };
  if (typeof module !== "undefined" && module.exports) module.exports = PortalResolver;
  root.PortalResolver = PortalResolver;
})(typeof window !== "undefined" ? window : this);
