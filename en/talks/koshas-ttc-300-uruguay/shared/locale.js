/* ============================================================================
   Shared locale primitives for the Koshas notes app.
   ONE source of truth for the language list + the EN deep-fallback merge,
   consumed by both shared/session.js and shared/home.js (was duplicated in each,
   and drifted on `pt` once). Load this BEFORE session.js / home.js.
   ============================================================================ */
(function () {
  // The language switcher list. Add/remove a language in ONE place.
  // (pt — Portuguese — is held; re-add { code: "pt", label: "PT" } when pursued.)
  var LANGS = [
    { code: "en", label: "EN" },
    { code: "es", label: "ES" },
    { code: "ne", label: "ने" }    // Nepali (Devanagari)
  ];

  // Deep-merge a locale's data OVER the EN base, so a partial locale falls back
  // to EN per missing key (objects + arrays recursed; primitives prefer locale).
  function deepFallback(base, over) {
    if (over == null) return base;
    if (Array.isArray(base)) {
      if (!Array.isArray(over)) return over;
      return base.map(function (b, i) { return i < over.length ? deepFallback(b, over[i]) : b; });
    }
    if (base && typeof base === "object") {
      if (typeof over !== "object" || Array.isArray(over)) return over;
      var out = {};
      for (var k in base) if (Object.prototype.hasOwnProperty.call(base, k)) out[k] = deepFallback(base[k], over[k]);
      for (var k2 in over) if (Object.prototype.hasOwnProperty.call(over, k2) && !(k2 in out)) out[k2] = over[k2];
      return out;
    }
    return over === undefined ? base : over;   // primitive: prefer locale, fall back to EN
  }

  window.KoshaLocale = { LANGS: LANGS, deepFallback: deepFallback };
})();
