/* ============================================================================
   THE FIVE KOSHAS — student notes · renderer (bilingual + theming)
   Content:  window.KOSHAS_I18N[locale]   (koshas.en.js / koshas.es.js)
   UI chrome: window.KOSHAS_UI[locale]    (i18n.js)
   Locale + theme persist in localStorage; <html lang> + data-theme are set.
   ============================================================================ */
(function () {
  const I18N = window.KOSHAS_I18N || {};
  const UI = window.KOSHAS_UI || {};
  const view = document.getElementById("view");
  const tabsEl = document.getElementById("tabs");

  /* Languages offered in the selector. A button only shows if its data bundle
     loaded (I18N[code] present) and its UI strings exist (UI[code]).
     SYNC NOTE: keep this array in sync with data/i18n/language-manifest.json
     at the repo root. The manifest is the authoritative source for language
     metadata (label, native, status); this array controls what the app renders.
     To add a language: add it to the manifest AND add it here.              */
  const LANGS = [
    { code: "en", label: "EN" },
    { code: "es", label: "ES" },
    { code: "ne", label: "ने" }    // Nepali (Devanagari)
    // pt (Portuguese) held — re-add when pursued
  ];

  /* ---- graceful EN fallback ---------------------------------------------
     Stub locales (e.g. ne / pt) may be partial. Deep-merge the locale's
     content OVER the EN content so any key still missing falls back to EN
     rather than rendering `undefined`. EN is the base for every locale.    */
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
    return over === undefined ? base : over;   // primitive: prefer locale, fall back to EN
  }
  const dataFor = (lang) =>
    (lang === "en" || !I18N.en) ? I18N[lang] : deepFallback(I18N.en, I18N[lang]);

  /* ---- state ------------------------------------------------------------- */
  let LOCALE = localStorage.getItem("kosha_lang") ||
    ((navigator.language || "").toLowerCase().startsWith("es") ? "es" : "en");
  if (!I18N[LOCALE]) LOCALE = "en";
  let THEME = document.documentElement.dataset.theme || "dark";
  let current = (location.hash.slice(1) || "overview");

  let D = dataFor(LOCALE);
  const t = (key, vars) => {
    let s = (UI[LOCALE] && UI[LOCALE][key]) || (UI.en && UI.en[key]) || key;
    if (vars) Object.keys(vars).forEach((k) => { s = s.replace("{" + k + "}", vars[k]); });
    return s;
  };

  /* ---- helpers ----------------------------------------------------------- */
  const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
  const el = (html) => { const d = document.createElement("template"); d.innerHTML = html.trim(); return d.content.firstElementChild; };
  const badge = (src) => `<span class="badge ${src}">${src === "talk" ? t("badge_talk") : t("badge_expansion")}</span>`;
  const quoteBlock = (q) => `<blockquote class="pull">“${esc(q.text)}”<span class="ref">— ${esc(q.ref)}</span></blockquote>`;
  const qaList = (qa) => (qa && qa.length)
    ? `<div class="qa">${qa.map((x, i) => `<details class="qitem"${i === 0 ? " open" : ""}><summary>${esc(x.q)}</summary><p>${esc(x.a)}</p></details>`).join("")}</div>`
    : "";

  /* ---- static masthead bits (from content meta) -------------------------- */
  function paintMeta() {
    const m = D.meta;
    document.getElementById("eyebrow").textContent = `${m.session} · ${m.course}`;
    document.getElementById("mastTitle").textContent = m.title;
    document.getElementById("mastSub").textContent = `${m.teacher}, ${t("by_host")} ${m.host} · ${m.date}`;
    document.getElementById("footNote").textContent = m.note;
    document.getElementById("footMeta").innerHTML = t("foot_meta").replace("{lang}", LOCALE);
    document.title = `${m.title} · ${m.session}`;
    document.documentElement.lang = LOCALE;
    const hl = document.getElementById("homeLink");
    if (hl) hl.textContent = "‹ " + t("home_link");
  }

  /* concentric sheath sigil — built once */
  const sigil = document.getElementById("sigil");
  I18N.en.koshas.forEach((k, i) => {
    const s = document.createElement("span");
    s.style.inset = i * 5 + "px"; s.style.setProperty("--sh", k.hue); s.dataset.k = k.id;
    sigil.appendChild(s);
  });

  /* ---- controls: language + theme + recording ---------------------------- */
  function buildControls() {
    const c = document.getElementById("controls");
    c.innerHTML = `
      <div class="lang-seg" role="group" aria-label="${esc(t("lang_label"))}">
        ${LANGS.filter((l) => I18N[l.code]).map((l) => `<button data-lang="${l.code}" lang="${l.code}" class="${LOCALE === l.code ? "on" : ""}" aria-pressed="${LOCALE === l.code}">${l.label}</button>`).join("")}
      </div>
      <button class="theme-btn" id="themeBtn" aria-label="${esc(t("theme_label"))}" title="${esc(t("theme_label"))}">${THEME === "dark" ? "☾" : "☀"}</button>
      <a class="rec-link" href="${esc(D.meta.recording)}" target="_blank" rel="noopener"><span class="rec-dot"></span> ${esc(t("recording"))}</a>`;
    c.querySelectorAll("[data-lang]").forEach((b) => b.addEventListener("click", () => setLocale(b.dataset.lang)));
    c.querySelector("#themeBtn").addEventListener("click", toggleTheme);
  }

  function applyTheme() {
    document.documentElement.dataset.theme = THEME;
    const b = document.getElementById("themeBtn");
    if (b) b.textContent = THEME === "dark" ? "☾" : "☀";
  }
  function toggleTheme() { THEME = THEME === "dark" ? "light" : "dark"; localStorage.setItem("kosha_theme", THEME); applyTheme(); }

  function setLocale(lang) {
    if (lang === LOCALE || !I18N[lang]) return;
    LOCALE = lang; localStorage.setItem("kosha_lang", lang); D = dataFor(lang);
    paintMeta(); buildTabs(); buildControls(); go(current);
  }

  /* ---- tabs -------------------------------------------------------------- */
  function tabDefs() {
    return [
      { id: "overview", label: t("tab_overview") },
      ...D.koshas.map((k) => ({ id: k.id, label: k.sanskrit, num: k.n })),
      { id: "between", label: t("tab_between") },
      { id: "awareness", label: t("tab_awareness") },
      { id: "practices", label: t("tab_practices") }
    ];
  }
  function buildTabs() {
    tabsEl.innerHTML = "";
    tabDefs().forEach((tb) => {
      const b = el(`<button class="tab" role="tab" data-id="${tb.id}" aria-selected="${tb.id === current}">
        ${tb.num ? `<span class="num">${tb.num}</span>` : ""}<span>${esc(tb.label)}</span></button>`);
      b.addEventListener("click", () => go(tb.id));
      tabsEl.appendChild(b);
    });
  }

  /* ---- renderers --------------------------------------------------------- */
  function renderOverview() {
    const o = D.overview;
    const rows = D.koshas.map((k) => `
      <tr data-go="${k.id}">
        <td><span class="dot" style="background:hsl(${k.hue} 70% 60%)"></span>${esc(k.sanskrit)}</td>
        <td>${esc(k.english.replace(/^The |^La |^El /, ""))}</td>
        <td class="lens">${esc(k.modernLens.name)}</td>
        <td>${esc((k.carMetaphor.split(" — ")[0]) || k.carMetaphor)}</td>
      </tr>`).join("");
    const arc = o.courseArc.map((a) => `
      <div class="arc-step ${a.n === 1 ? "is-now" : ""}">
        <div class="n">${a.n}</div><div class="l">${esc(a.label)}</div><p>${esc(a.body)}</p>
      </div>`).join("");
    return `
      <h2 class="section-h">${esc(t("overview_title"))}</h2>
      <p class="lead">${esc(o.lead)}</p>
      ${quoteBlock({ text: o.framework.quote, ref: o.framework.ref })}
      <div style="height:22px"></div>
      <div class="cols">
        <div class="card"><p class="card-label">${esc(t("col_traditional"))}</p><p>${esc(o.tradition.quote)} <span class="ref-tag refmut">(${esc(o.tradition.ref)})</span></p></div>
        <div class="card modern"><p class="card-label">${esc(t("col_modernlens"))}</p><p>${esc(o.why.quote)} <span class="ref-tag refmut">(${esc(o.why.ref)})</span></p></div>
      </div>
      <div class="metaphor"><span class="ic">⌖</span><p>${esc(o.carAnalogy)}</p></div>
      <h3 class="sub-h">${esc(t("overview_glance"))}</h3>
      <p class="muted-line">${esc(t("overview_tap"))}</p>
      <table class="reframe-table"><thead><tr><th>${esc(t("col_kosha"))}</th><th>${esc(t("col_traditional"))}</th><th>${esc(t("col_modernlens"))}</th><th>${esc(t("col_car"))}</th></tr></thead><tbody>${rows}</tbody></table>
      <h3 class="sub-h">${esc(t("overview_sessions"))}</h3>
      <div class="arc">${arc}</div>`;
  }

  function renderKosha(k) {
    const etym = Object.entries(k.etymology).map(([w, def]) => `<span class="chip"><b>${esc(w)}</b> · ${esc(def)}</span>`).join("");
    const axis = (name, a) => `
      <div class="axis"><div class="axis-head"><span class="axis-name">${esc(name)}</span>${badge(a.source)}</div><p>${esc(a.text)}</p></div>`;
    return `
      <div class="k-hero">
        <div class="k-deva">${esc(k.devanagari)}</div>
        <div class="k-titlewrap">
          <div class="k-index">${esc(t("kosha_index", { n: k.n }))}</div>
          <h2 class="k-sanskrit">${esc(k.sanskrit)}</h2>
          <p class="k-english">${esc(k.english)}</p>
          <div class="etym">${etym}</div>
          <span class="reframe-badge">${esc(t("reframe_traditional"))} <span class="arrow">→</span> ${esc(k.modernLens.name)}</span>
        </div>
      </div>
      <div class="cols">
        <div class="card"><p class="card-label">${esc(t("trad_presentation"))}</p><p>${esc(k.traditional)}</p></div>
        <div class="card modern"><p class="card-label">${esc(t("modern_lens"))} · ${esc(k.modernLens.name)}</p><h3>${esc(k.modernLens.name)}</h3><p>${esc(k.modernLens.body)}</p></div>
      </div>
      <div class="metaphor"><span class="ic">⌁</span><p><b>${esc(t("in_car"))}</b> ${esc(k.carMetaphor)}</p></div>
      <div class="axes">
        ${axis(t("axis_scale"), k.scale)}
        ${axis(t("axis_density"), k.density)}
        ${axis(t("axis_nourishment"), k.nourishment)}
      </div>
      <div class="quotes">${k.quotes.map(quoteBlock).join("")}</div>
      <div class="practice"><p class="card-label">${esc(t("try_this"))}</p><p>${esc(k.practice)}</p></div>
      <h3 class="qa-h">${esc(t("five_questions"))}</h3>
      ${qaList(k.qa)}`;
  }

  function renderBetween() {
    const b = D.between;
    const cards = b.sections.map((s) => `
      <div class="bsection">
        <div class="bsection-head"><h3>${esc(s.title)}</h3>${badge(s.source)}</div>
        <p class="body">${esc(s.body)}</p>
        ${(s.quotes || []).map(quoteBlock).join("")}
        ${s.aside ? `<p class="aside-note">${esc(s.aside)}</p>` : ""}
        ${s.flag ? `<span class="flag">⚑ ${esc(s.flag)}</span>` : ""}
      </div>`).join("");
    return `
      <h2 class="section-h">${esc(t("between_title"))}</h2>
      <p class="lead">${esc(b.lead)}</p>
      <div class="between-grid">${cards}</div>
      <h3 class="qa-h">${esc(t("five_questions_between"))}</h3>
      ${qaList(b.qa)}`;
  }

  function renderAwareness() {
    const aw = D.awareness;
    const groups = aw.groups.map((g) => `
      <div class="awgroup" style="--hue:${g.hue}">
        <h3 class="awg-title">${esc(g.kosha)}</h3>
        <ul class="awlist">${g.items.map((it) => `<li><p>${esc(it.text)}</p><span class="ref-tag awref">${esc(it.ref)}</span></li>`).join("")}</ul>
      </div>`).join("");
    return `
      <h2 class="section-h">${esc(t("awareness_title"))}</h2>
      <p class="lead">${esc(aw.lead)}</p>
      <div class="awgrid">${groups}</div>`;
  }

  function renderPractices() {
    const cards = D.practices.map((p) => `
      <div class="pcard">
        <h3>${esc(p.title)}</h3><div class="kind">${esc(p.kind)}</div>
        <ol class="psteps">${p.steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>
        <p class="pref">${esc(p.ref)}</p>
      </div>`).join("");
    return `
      <h2 class="section-h">${esc(t("practices_title"))}</h2>
      <p class="lead">${esc(t("practices_lead"))}</p>
      ${cards}`;
  }

  /* ---- routing ----------------------------------------------------------- */
  function go(id) {
    const kosha = D.koshas.find((k) => k.id === id);
    const hue = kosha ? kosha.hue : (id === "between" ? 280 : id === "practices" ? 160 : id === "awareness" ? 45 : 38);
    document.documentElement.style.setProperty("--hue", hue);

    let html;
    if (id === "overview") html = renderOverview();
    else if (kosha) html = renderKosha(kosha);
    else if (id === "between") html = renderBetween();
    else if (id === "awareness") html = renderAwareness();
    else if (id === "practices") html = renderPractices();
    else { id = "overview"; html = renderOverview(); }

    current = id;
    view.innerHTML = `<div class="reveal">${html}</div>`;
    [...tabsEl.children].forEach((tb) => tb.setAttribute("aria-selected", tb.dataset.id === id));
    [...sigil.children].forEach((s) => { s.style.opacity = (!kosha || s.dataset.k === id) ? "1" : ".25"; });
    view.querySelectorAll("[data-go]").forEach((r) => r.addEventListener("click", () => go(r.dataset.go)));

    if (location.hash.slice(1) !== id) history.replaceState(null, "", "#" + id);
  }

  /* ---- boot -------------------------------------------------------------- */
  applyTheme();
  paintMeta();
  buildControls();
  buildTabs();
  window.addEventListener("hashchange", () => { const h = location.hash.slice(1) || "overview"; if (h !== current) go(h); });
  go(current);
})();
