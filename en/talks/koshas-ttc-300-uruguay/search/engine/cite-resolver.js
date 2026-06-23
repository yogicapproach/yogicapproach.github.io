/* ===========================================================================
   cite-resolver.js — THE canonical citation resolver (drishti-corpus engine).

   ONE JOB: turn a citation reference into the exact source cue + an optional
   click-to-audio deep link. Pure logic, NO DOM, no koshas knowledge. This is
   the SHARED SPINE every consumer calls — the corpus search page, the note
   renderer, AND the drishti-graph node panel all resolve through this same
   interface, so a `[[cite: …]]` means the same thing everywhere.

   ─────────────────────────────────────────────────────────────────────────
   THE CONTRACT (any repo can build to this):

     var resolver = Cite.makeResolver(corpus);   // corpus = parsed corpus.json
     var r = resolver.resolve(sessionId, ts);    // ts = "MM:SS" | "H:MM:SS" | secs

       r = {
         ok:           boolean,   // false if session/timestamp unresolvable
         ref:          string,    // "s1#44:43" (echo of the request)
         session:      string,    // session id, e.g. "s1"
         sessionTitle: string,    // human title, or null
         seconds:      number,    // resolved start-second of the landed cue
         cue:          object,    // the raw corpus cue record, or null
         text:         string,    // the source line to quote, or null
         time:         string,    // human time of the landed cue, e.g. "44:43"
         audio:        string,    // YouTube &t= deep link, or null (audio-only)
         reason:       string,    // why ok===false (else null)
       };

     resolver.findRefs(text)  ->  [{ match, start, end, session, ts }, …]
       Locate every [[cite: SESSION#TS]] / {quote SESSION#TS} ref in a string.

     resolver.sessions        ->  { <id>: <session-meta>, … }

   Resolution rule (forgiving): land on the cue whose [t,e] window contains the
   requested second; if none does, fall back to the nearest cue at/just before
   it (else the first). Hand-written timestamps can be rough and still land on
   the right passage.

   Reference syntax (human-writable, used in notes and graph nodes):
       [[cite: s1#01:08]]        session s1, at 1 min 08 sec
       [[cite: s2#1:02:30]]      session s2, at 1 h 02 m 30 s
       [[cite: pir#03:12]]       audio-only session — resolves to the line, no link
       {quote s3#12:00}          alternate brace form, same meaning

   The corpus payload is a generic data contract (see engine/README.md), not
   koshas-specific: { sessions:[{id,vid,title,…}], cues:[{i,s,l,p,t,e,x}] }.

   Exposes a global `Cite` (and CommonJS export for `node --check` / tests).
   `window.Cite` is the canonical name every consumer already binds to.
   =========================================================================== */
(function (root) {
  "use strict";

  // Match [[cite: SESSION#TS]] or {quote SESSION#TS} (and {cite ...}).
  var REF_RE = /\[\[\s*cite:\s*([a-z0-9]+)\s*#\s*([0-9:]+)\s*\]\]|\{\s*(?:quote|cite)\s+([a-z0-9]+)\s*#\s*([0-9:]+)\s*\}/gi;

  // Parse "MM:SS" or "H:MM:SS" (or bare seconds) into integer seconds.
  function parseTs(ts) {
    if (ts == null) return null;
    var parts = String(ts).trim().split(":").map(function (p) { return parseInt(p, 10); });
    if (parts.some(isNaN)) return null;
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

  function ytLink(vid, sec) {
    if (!vid) return null;
    return "https://www.youtube.com/watch?v=" + encodeURIComponent(vid) +
           "&t=" + Math.max(0, Math.floor(sec)) + "s";
  }

  /**
   * Build a resolver bound to one corpus payload.
   * @param {{sessions:Array, cues:Array}} corpus  parsed corpus.json
   */
  function makeResolver(corpus) {
    var sessions = {};
    (corpus.sessions || []).forEach(function (s) { sessions[s.id] = s; });

    // Bucket cues by session, sorted by start time, for fast nearest lookup.
    var bySession = {};
    (corpus.cues || []).forEach(function (c) {
      (bySession[c.s] || (bySession[c.s] = [])).push(c);
    });
    Object.keys(bySession).forEach(function (k) {
      bySession[k].sort(function (a, b) { return a.t - b.t; });
    });

    /**
     * Resolve one reference (see THE CONTRACT above for the return shape).
     */
    function resolve(sessionId, ts) {
      var sec = parseTs(ts);
      var sess = sessions[sessionId];
      var out = {
        ok: false, ref: sessionId + "#" + ts, session: sessionId,
        sessionTitle: sess ? sess.title : null, seconds: sec,
        cue: null, text: null, time: fmtTime(sec), audio: null, reason: null,
      };
      if (!sess) { out.reason = "unknown session '" + sessionId + "'"; return out; }
      if (sec == null) { out.reason = "bad timestamp '" + ts + "'"; return out; }

      var cues = bySession[sessionId] || [];
      if (!cues.length) { out.reason = "no cues for session"; return out; }

      // Prefer the cue whose [t,e] window contains the second.
      var hit = null;
      for (var i = 0; i < cues.length; i++) {
        var c = cues[i];
        var end = (c.e != null) ? c.e : c.t;
        if (sec >= c.t && sec <= end) { hit = c; break; }
        if (c.t > sec) break; // sorted: passed the target
      }
      // Else: nearest cue at/just before the second (or the very first).
      if (!hit) {
        for (var j = 0; j < cues.length; j++) {
          if (cues[j].t <= sec) hit = cues[j]; else break;
        }
        if (!hit) hit = cues[0];
      }

      out.ok = true;
      out.cue = hit;
      out.text = hit.x;
      out.time = fmtTime(hit.t);
      out.seconds = hit.t;
      out.audio = ytLink(sess.vid, hit.t); // null when the session has no vid
      return out;
    }

    /**
     * Find all citation refs in a block of text.
     * @returns {Array<{match,start,end,session,ts}>}
     */
    function findRefs(text) {
      var refs = [];
      var m;
      REF_RE.lastIndex = 0;
      while ((m = REF_RE.exec(text)) !== null) {
        var session = m[1] || m[3];
        var ts = m[2] || m[4];
        refs.push({ match: m[0], start: m.index, end: m.index + m[0].length, session: session, ts: ts });
      }
      return refs;
    }

    return { resolve: resolve, findRefs: findRefs, sessions: sessions };
  }

  var Cite = {
    makeResolver: makeResolver,
    parseTs: parseTs,
    fmtTime: fmtTime,
    ytLink: ytLink,
    REF_RE: REF_RE,
  };

  if (typeof module !== "undefined" && module.exports) module.exports = Cite;
  root.Cite = Cite;
})(typeof window !== "undefined" ? window : this);
