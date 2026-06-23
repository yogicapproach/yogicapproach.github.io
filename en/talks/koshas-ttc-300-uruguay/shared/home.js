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

  const LANGS = window.KoshaLocale.LANGS;   // single source: shared/locale.js

  /* Deep EN fallback so partial (stub) locales render cleanly — missing keys
     fall back to the EN catalog rather than showing `undefined`.            */
  const deepFallback = window.KoshaLocale.deepFallback;   // single source: shared/locale.js
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
      <a class="rec-link" href="${esc(S.recording)}" target="_blank" rel="noopener"><span class="rec-dot"></span> ${esc(t("recording"))}</a>
      <a class="rec-link graph-link" href="graph/"><span class="rec-dot"></span> ${esc({ en: "Knowledge Graph", es: "Grafo de conocimiento", ne: "ज्ञान ग्राफ" }[LOCALE] || "Knowledge Graph")}</a>`;
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
    const gLabel = { en: "Knowledge Graph", es: "Grafo de conocimiento", ne: "ज्ञान ग्राफ" }[LOCALE] || "Knowledge Graph";
    const gSub = {
      en: "Explore how the koshas connect across all four sessions — tap a node, follow a thread, jump to the moment in the recording.",
      es: "Explora cómo se conectan los koshas a lo largo de las cuatro sesiones — toca un nodo, sigue un hilo, salta al momento de la grabación.",
      ne: "चारवटै सत्रमा कोशहरू कसरी जोडिन्छन् अन्वेषण गर्नुहोस् — नोडमा थिच्नुहोस्, सूत्र पछ्याउनुहोस्।",
    }[LOCALE] || "Explore how the koshas connect across all four sessions.";
    view.innerHTML = `<div class="reveal">
      <h2 class="section-h home-h">${esc(S.subtitle)}</h2>
      <p class="lead home-lead">${esc(S.blurb)}</p>
      <div class="scard-grid">${cards}</div>
      <section class="graph-embed">
        <h2 class="section-h">${esc(gLabel)}</h2>
        <p class="lead">${esc(gSub)}</p>
        <div class="graph-frame-wrap">
          <iframe class="graph-frame" src="graph/" title="${esc(gLabel)}" loading="lazy"></iframe>
        </div>
        <p class="graph-cta"><a class="scard-cta" href="graph/" target="_blank" rel="noopener">${esc(gLabel)} <span class="scard-arrow">↗</span></a></p>
      </section>
    </div>`;
  }
  function t_open() { return esc(S.open_label); }

  applyTheme();
  paintMeta();
  buildControls();
  render();
})();
