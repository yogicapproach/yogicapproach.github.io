/* ============================================================================
   Series HOME hub — renders the four-session index.
   Reuses KOSHAS_SERIES (catalog) + KOSHAS_UI (chrome) + the shared theme/locale
   keys (kosha_lang / kosha_theme) so choices carry across home ↔ session pages.
   ============================================================================ */
(function () {
  const SERIES = window.KOSHAS_SERIES || {};
  const UI = window.KOSHAS_UI || {};
  const view = document.getElementById("view");
  const KOSHA_HUES = [18, 35, 190, 255, 45];

  const LANGS = [
    { code: "en", label: "EN" },
    { code: "es", label: "ES" },
    { code: "ne", label: "ने" }    // Nepali (Devanagari)
    // pt (Portuguese) held — re-add when pursued
  ];

  /* Deep EN fallback so partial (stub) locales render cleanly — missing keys
     fall back to the EN catalog rather than showing `undefined`.            */
  function deepFallback(base, over) {
    if (over == null) return base;
    if (Array.isArray(base)) {
      if (!Array.isArray(over)) return over;
      return base.map((b, i) => (i < over.length ? deepFallback(b, over[i]) : b));
    }
    if (base && typeof base === "object") {
      if (typeof over !== "object" || Array.isArray(over)) return over;
      const out = {};
      for (const k of Object.keys(base)) out[k] = deepFallback(base[k], over[k]);
      for (const k of Object.keys(over)) if (!(k in out)) out[k] = over[k];
      return out;
    }
    return over === undefined ? base : over;
  }
  const seriesFor = (lang) =>
    (lang === "en" || !SERIES.en) ? SERIES[lang] : deepFallback(SERIES.en, SERIES[lang]);

  // precedence: ?lang= (shareable URL) > localStorage > navigator
  let LOCALE = (new URLSearchParams(location.search).get("lang") || "").toLowerCase() ||
    localStorage.getItem("kosha_lang") ||
    ((navigator.language || "").toLowerCase().startsWith("es") ? "es" : "en");
  if (!SERIES[LOCALE]) LOCALE = "en";
  localStorage.setItem("kosha_lang", LOCALE);   // persist a ?lang= choice across pages
  let THEME = document.documentElement.dataset.theme || "dark";
  let S = seriesFor(LOCALE);

  const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
  const t = (key) => (UI[LOCALE] && UI[LOCALE][key]) || (UI.en && UI.en[key]) || key;

  /* sigil — five kosha rings */
  const sigil = document.getElementById("sigil");
  KOSHA_HUES.forEach((h, i) => {
    const s = document.createElement("span");
    s.style.inset = i * 5 + "px"; s.style.setProperty("--sh", h);
    sigil.appendChild(s);
  });

  function paintMeta() {
    document.getElementById("eyebrow").textContent = S.course;
    document.getElementById("mastTitle").textContent = S.title;
    document.getElementById("mastSub").textContent = `${S.subtitle} · ${S.teacher}, ${S.host}`;
    document.getElementById("footNote").textContent = S.blurb;
    document.getElementById("footMeta").textContent = `${S.title} · ${S.course}`;
    document.title = `${S.title} · ${S.subtitle}`;
    document.documentElement.lang = LOCALE;
  }

  function buildControls() {
    const c = document.getElementById("controls");
    c.innerHTML = `
      <div class="lang-seg" role="group" aria-label="${esc(t("lang_label"))}">
        ${LANGS.filter((l) => SERIES[l.code]).map((l) => `<button data-lang="${l.code}" lang="${l.code}" class="${LOCALE === l.code ? "on" : ""}" aria-pressed="${LOCALE === l.code}">${l.label}</button>`).join("")}
      </div>
      <button class="theme-btn" id="themeBtn" aria-label="${esc(t("theme_label"))}" title="${esc(t("theme_label"))}">${THEME === "dark" ? "☾" : "☀"}</button>
      <a class="rec-link" href="${esc(S.recording)}" target="_blank" rel="noopener"><span class="rec-dot"></span> ${esc(t("recording"))}</a>`;
    c.querySelectorAll("[data-lang]").forEach((b) => b.addEventListener("click", () => setLocale(b.dataset.lang)));
    c.querySelector("#themeBtn").addEventListener("click", toggleTheme);
  }
  function applyTheme() {
    document.documentElement.dataset.theme = THEME;
    const b = document.getElementById("themeBtn"); if (b) b.textContent = THEME === "dark" ? "☾" : "☀";
  }
  function toggleTheme() { THEME = THEME === "dark" ? "light" : "dark"; localStorage.setItem("kosha_theme", THEME); applyTheme(); }
  function setLocale(lang) {
    if (lang === LOCALE || !SERIES[lang]) return;
    LOCALE = lang; localStorage.setItem("kosha_lang", lang); S = seriesFor(lang);
    { const u = new URL(location.href); u.searchParams.set("lang", lang);   // shareable URL
      history.replaceState(null, "", u.pathname + u.search + location.hash); }
    paintMeta(); buildControls(); render();
  }

  function render() {
    const cards = S.sessions.map((s, i) => {
      const hue = KOSHA_HUES[i % KOSHA_HUES.length];
      const ready = s.status === "ready";
      const cta = ready ? t_open() : esc(S.upcoming_label);
      return `
        <a class="scard ${ready ? "ready" : "upcoming"}" href="${esc(s.href)}" style="--hue:${hue}">
          <div class="scard-top">
            <span class="scard-n">${s.n}</span>
            <span class="scard-date">${esc(s.date)}</span>
          </div>
          <h3 class="scard-title">${esc(s.title)}</h3>
          <p class="scard-theme">${esc(s.theme)}</p>
          <span class="scard-cta">${cta} <span class="scard-arrow">→</span></span>
        </a>`;
    }).join("");
    view.innerHTML = `<div class="reveal">
      <h2 class="section-h home-h">${esc(S.subtitle)}</h2>
      <p class="lead home-lead">${esc(S.blurb)}</p>
      <div class="scard-grid">${cards}</div>
    </div>`;
  }
  function t_open() { return esc(S.open_label); }

  applyTheme();
  paintMeta();
  buildControls();
  render();
})();
