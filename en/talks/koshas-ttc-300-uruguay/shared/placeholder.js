/* ============================================================================
   Placeholder page for sessions not yet taught/transcribed.
   The page sets <body data-session="session-2">. Reuses KOSHAS_SERIES + KOSHAS_UI
   and the shared locale/theme keys for a consistent look.
   ============================================================================ */
(function () {
  const SERIES = window.KOSHAS_SERIES || {};
  const UI = window.KOSHAS_UI || {};
  const view = document.getElementById("view");
  const sid = document.body.dataset.session;
  const KOSHA_HUES = { "session-1": 18, "session-2": 35, "session-3": 190, "session-4": 255 };

  let LOCALE = localStorage.getItem("kosha_lang") ||
    ((navigator.language || "").toLowerCase().startsWith("es") ? "es" : "en");
  if (!SERIES[LOCALE]) LOCALE = "en";
  let THEME = document.documentElement.dataset.theme || "dark";

  const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
  const t = (key) => (UI[LOCALE] && UI[LOCALE][key]) || (UI.en && UI.en[key]) || key;
  const sess = () => SERIES[LOCALE].sessions.find((s) => s.id === sid) || SERIES[LOCALE].sessions[0];

  document.documentElement.style.setProperty("--hue", KOSHA_HUES[sid] || 38);

  function paintMeta() {
    const s = sess(), S = SERIES[LOCALE];
    document.getElementById("eyebrow").textContent = S.course;
    document.getElementById("mastTitle").textContent = S.title;
    document.getElementById("mastSub").textContent = `${S.subtitle} · ${S.teacher}, ${S.host}`;
    const hl = document.getElementById("homeLink"); if (hl) hl.textContent = "‹ " + t("home_link");
    document.title = `${s.title} · ${S.title}`;
    document.documentElement.lang = LOCALE;
  }
  function buildControls() {
    const c = document.getElementById("controls");
    c.innerHTML = `
      <div class="lang-seg" role="group" aria-label="${esc(t("lang_label"))}">
        <button data-lang="en" class="${LOCALE === "en" ? "on" : ""}">EN</button>
        <button data-lang="es" class="${LOCALE === "es" ? "on" : ""}">ES</button>
      </div>
      <button class="theme-btn" id="themeBtn" aria-label="${esc(t("theme_label"))}">${THEME === "dark" ? "☾" : "☀"}</button>`;
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
    LOCALE = lang; localStorage.setItem("kosha_lang", lang);
    paintMeta(); buildControls(); render();
  }
  function render() {
    const s = sess();
    view.innerHTML = `<div class="reveal placeholder-wrap">
      <div class="ph-n">${s.n}</div>
      <h2 class="section-h">${esc(s.title)}</h2>
      <p class="lead">${esc(s.theme)}</p>
      <p class="ph-status">${esc(SERIES[LOCALE].upcoming_label)}${s.date && s.date !== "—" ? " · " + esc(s.date) : ""}</p>
      <a class="ph-back" href="../../index.html">‹ ${esc(t("home_link"))}</a>
    </div>`;
  }

  applyTheme();
  paintMeta();
  buildControls();
  render();
})();
