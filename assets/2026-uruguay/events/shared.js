// Shared event navigation for all transcript pages

// ── Theme toggle — Issue #77 ──────────────────────────────────────────────
// Runs immediately to avoid flash of wrong theme before DOMContentLoaded.
// Always starts from OS preference — no localStorage persistence.
(function() {
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
})();

function _updateThemeButton() {
    var btn = document.getElementById('theme-toggle-btn');
    if (!btn) return;
    var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    btn.textContent = isDark ? '\u2600\uFE0F' : '\uD83C\uDF19';
    btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    btn.title = btn.getAttribute('aria-label');
}

function toggleTheme() {
    var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    _updateThemeButton();
}

// GoatCounter analytics
(function() {
    var gc = document.createElement('script');
    gc.async = true;
    gc.src = '//gc.zgo.at/count.js';
    gc.setAttribute('data-goatcounter', 'https://yogicapproach.goatcounter.com/count');
    document.head.appendChild(gc);
})();

var _eventsCache = null;
var _currentProgram = '';

var _FORM_ID = '1FAIpQLSd0ZP73-dDwgR52tmMPd-wSwx-W7hlHFaOdR-vV72fDwlaUYA';
var _FORM_BASE = 'https://docs.google.com/forms/d/e/' + _FORM_ID + '/viewform';
var _LANG_MAP = { en: 'English', es: 'Spanish', ne: 'Nepali' };

function _formUrl(type, lang) {
    var params = [
        'entry.1318168213=' + encodeURIComponent(type === 'feedback' ? 'Share Feedback' : 'Report Issue'),
        'entry.119875362=' + encodeURIComponent(_LANG_MAP[lang] || 'English')
    ];
    if (_currentProgram) params.push('entry.625098476=' + encodeURIComponent(_currentProgram));
    return _FORM_BASE + '?' + params.join('&');
}

function _topbarStrings(lang) {
    var s = {
        en: { creditBefore: 'Made with 🧠❤️🙏 by ', creditAfter: '', feedback: 'Share feedback', report: 'Report issue' },
        es: { creditBefore: 'Hecho con 🧠❤️🙏 por ', creditAfter: '', feedback: 'Compartir comentarios', report: 'Reportar problema' },
        ne: { creditBefore: '', creditAfter: ' बाट 🧠❤️🙏 सँग बनाएको', feedback: 'प्रतिक्रिया दिनुहोस्', report: 'समस्या रिपोर्ट गर्नुहोस्' }
    };
    return s[lang] || s.en;
}

function _creditHtml(s) {
    return s.creditBefore + '<a href="https://yogicapproach.com" target="_blank" rel="noopener">YogicApproach</a>' + s.creditAfter;
}

function updateTopbar(lang) {
    var tb = document.getElementById('topbar');
    if (!tb) return;
    var s = _topbarStrings(lang);
    tb.querySelector('.topbar-credit').innerHTML = _creditHtml(s);
    tb.querySelector('#topbar-feedback').textContent = s.feedback;
    tb.querySelector('#topbar-feedback').href = _formUrl('feedback', lang);
    tb.querySelector('#topbar-feedback').setAttribute('aria-label', 'Share feedback (opens Google Form in new tab)');
    tb.querySelector('#topbar-report').textContent = s.report;
    tb.querySelector('#topbar-report').href = _formUrl('report', lang);
    tb.querySelector('#topbar-report').setAttribute('aria-label', 'Report an issue (opens Google Form in new tab)');
    updateFooterLinks(lang);
}

function updateFooterLinks(lang) {
    var s = _topbarStrings(lang);
    var ff = document.getElementById('footer-feedback');
    var fr = document.getElementById('footer-report');
    if (ff) { ff.textContent = s.feedback; ff.href = _formUrl('feedback', lang); ff.setAttribute('aria-label', 'Share feedback (opens Google Form in new tab)'); }
    if (fr) { fr.textContent = s.report; fr.href = _formUrl('report', lang); fr.setAttribute('aria-label', 'Report an issue (opens Google Form in new tab)'); }
}

async function _loadEvents(path) {
    if (_eventsCache) return _eventsCache;
    var r = await fetch(path);
    _eventsCache = await r.json();
    return _eventsCache;
}

async function loadTranscript(lang) {
    var isEs = lang === 'es';
    var isNe = lang === 'ne';

    document.getElementById('btn-en').classList.toggle('active', lang === 'en');
    document.getElementById('btn-es').classList.toggle('active', isEs);
    var btnNe = document.getElementById('btn-ne');
    if (btnNe) btnNe.classList.toggle('active', isNe);
    document.querySelectorAll('.lang-toggle button').forEach(function(btn) {
        btn.setAttribute('aria-pressed', btn.classList.contains('active') ? 'true' : 'false');
    });

    updateTopbar(lang);
    document.documentElement.lang = lang === 'ne' ? 'ne' : (lang === 'es' ? 'es' : 'en');

    // Load title/subtitle from events.json cache
    try {
        var events = await _loadEvents('../events.json');
        var folder = window.location.pathname.split('/').filter(Boolean).pop();
        var ev = events.find(function(e) { return e.folder === folder; });
        if (ev) {
            _currentProgram = ev.date + ' \u2014 ' + ev.location + ' \u2014 ' + ev.title_short;
            updateTopbar(lang);
            var h1 = document.querySelector('header h1');
            if (h1) {
                h1.textContent = isNe ? ev.title_ne : (isEs ? ev.title_es : ev.title);
            }
            var sub = document.getElementById('header-subtitle');
            if (sub) {
                var subtitle = isNe ? ev.subtitle_ne : (isEs ? ev.subtitle_es : ev.subtitle_en);
                if (subtitle) sub.innerHTML = subtitle;
            }
        }
    } catch(err) {
        // events.json unavailable — title stays as static HTML fallback
    }

    // "Select another talk" label — single span, content set by lang
    var labelEl = document.getElementById('other-talks-label');
    if (labelEl) {
        var href = labelEl.dataset.href || '../';
        if (isNe) {
            labelEl.innerHTML = 'अर्को चर्चा <a href="' + href + '">छान्नुहोस्</a>:';
        } else if (isEs) {
            labelEl.innerHTML = 'Ver <a href="' + href + '">otra charla</a>:';
        } else {
            labelEl.innerHTML = 'Select <a href="' + href + '">another talk</a>:';
        }
    }
    // Hide old ES label span if present (backwards compat)
    var labelEs = document.getElementById('other-talks-label-es');
    if (labelEs) labelEs.style.display = 'none';

    // Localize footer navigation link
    var footerNav = document.getElementById('footer-nav');
    if (footerNav) {
        footerNav.innerHTML = isNe
            ? '&#8592; कार्यक्रमहरूमा फर्कनुहोस्'
            : (isEs ? '&#8592; Volver a los eventos' : '&#8592; Back to Events');
    }

    // Localize site credit
    var siteCredit = document.getElementById('site-credit');
    if (siteCredit) {
        var creditLink = '<a href="https://yogicapproach.com" target="_blank" rel="noopener">YogicApproach</a>';
        siteCredit.innerHTML = isNe
            ? creditLink + ' बाट 🧠❤️🙏 सँग बनाएको'
            : (isEs ? 'Hecho con 🧠❤️🙏 por ' + creditLink + '.' : 'Made with 🧠❤️🙏 by ' + creditLink + '.');
    }

    loadTalkSelector(lang);

    var url = new URL(window.location);
    url.searchParams.set('lang', lang);
    history.replaceState(null, '', url);

    var el = document.getElementById('content');
    el.innerHTML = '<p id="loading">Loading...</p>';
    try {
        var res = await fetch('transcript-' + lang + '.md');
        if (!res.ok) throw new Error('File not found');
        var md = await res.text();
        el.innerHTML = marked.parse(md);
        if (window.location.hash) {
            var target = document.querySelector(window.location.hash);
            if (target) target.scrollIntoView({ behavior: 'smooth' });
        }
    } catch (e) {
        el.innerHTML = '<p class="error-message">Could not load transcript. Please try again.</p>';
    }
    loadResources(lang);
}

async function loadResources(lang, resourcesBasePath) {
    var _lang = lang || 'en';
    var _strings = {
        en: {
            audioHeading: 'Audio Resources',
            translationRef: 'Translation Reference',
            download: 'Download',
            listenOn: 'Listen on'
        },
        es: {
            audioHeading: 'Recursos de Audio',
            translationRef: 'Referencia de Traducción',
            download: 'Descargar',
            listenOn: 'Escuchar en'
        },
        ne: {
            audioHeading: 'अडियो स्रोतहरू',
            translationRef: 'अनुवाद सन्दर्भ',
            download: 'डाउनलोड',
            listenOn: 'सुन्नुहोस्'
        }
    };
    var s = _strings[_lang] || _strings.en;
    var _basePath = resourcesBasePath || 'resources/';

    try {
        var res = await fetch('resources.json');
        if (!res.ok) return;
        var data = await res.json();
        if (!data.resources || data.resources.length === 0) return;

        var audioItems  = data.resources.filter(function(r) { return r.type === 'audio' || r.type === 'audio-external'; });
        var fullPdfs    = data.resources.filter(function(r) { return r.type === 'pdf' && !r.compact; });
        var compactPdfs = data.resources.filter(function(r) { return r.type === 'pdf' && r.compact; });

        var audioEl = document.getElementById('resources-audio');
        if (!audioEl) return;

        // Set the section heading dynamically
        var sectionHeading = document.querySelector('#resources-section .resources-heading');
        if (sectionHeading) sectionHeading.textContent = s.audioHeading;

        var audioHtml = '';
        audioItems.forEach(function(r) {
            if (r.type === 'audio-external') {
                var desc = (_lang === 'ne' && r.description_ne) ? r.description_ne : (_lang === 'es' && r.description_es) ? r.description_es : r.description;
                var metaParts = [desc, r.source].filter(Boolean);
                audioHtml += `
                    <div class="resource-audio-card">
                        <div class="resource-body">
                            <div class="resource-title">${r.title}</div>
                            <div class="resource-meta">${metaParts.join(' &middot; ')}</div>
                            <a class="resource-download" href="${r.url}" target="_blank" rel="noopener">${s.listenOn} ${r.source} &rarr;</a>
                        </div>
                    </div>`;
            } else {
                var fileSrc    = _basePath + encodeURIComponent(r.file);
                var coverSrc   = r.cover ? _basePath + encodeURIComponent(r.cover) + '?v=1' : '';
                var licenseStr = r.license_url
                    ? `<a class="resource-download" href="${r.license_url}" target="_blank" rel="noopener">${r.license}</a>`
                    : (r.license || '');
                var desc = (_lang === 'ne' && r.description_ne) ? r.description_ne : (_lang === 'es' && r.description_es) ? r.description_es : r.description;
                var metaPartsA = [desc, r.artist, licenseStr].filter(Boolean);
                var downloadLink = r.no_download
                    ? (r.external_url ? ` &middot; <a class="resource-download" href="${r.external_url}" target="_blank" rel="noopener">${s.listenOn} ${r.external_source} &rarr;</a>` : '')
                    : ` &middot; <a class="resource-download" href="${fileSrc}" download>${s.download}</a>`;
                var mime       = r.file.endsWith('.mp3') ? 'audio/mpeg' : 'audio/mp4';
                audioHtml += `
                    <div class="resource-audio-card">
                        ${coverSrc ? `<img class="resource-cover" src="${coverSrc}" alt="${r.title}" data-modal="true">` : ''}
                        <div class="resource-body">
                            <div class="resource-title">${r.title}</div>
                            <div class="resource-meta">${metaPartsA.join(' &middot; ')}${downloadLink}</div>
                        </div>
                        <audio class="resource-player" controls preload="none">
                            <source src="${fileSrc}" type="${mime}">
                        </audio>
                    </div>`;
            }
        });
        audioEl.innerHTML = audioHtml;

        audioEl.querySelectorAll('img[data-modal]').forEach(function(img) {
            img.addEventListener('click', function() {
                var modal = document.getElementById('img-modal');
                var modalImg = document.getElementById('img-modal-img');
                if (modal && modalImg) {
                    modalImg.src = img.src;
                    modalImg.alt = img.alt;
                    modal.classList.add('open');
                }
            });
        });

        // Exclusive playback: starting one track pauses all others
        document.querySelectorAll('.resource-player').forEach(function(player) {
            player.addEventListener('play', function() {
                document.querySelectorAll('.resource-player').forEach(function(other) {
                    if (other !== player) other.pause();
                });
            });
        });

        if (fullPdfs.length > 0 || compactPdfs.length > 0) {
            var pdfsEl = document.getElementById('resources-pdfs');
            if (pdfsEl) {
                var pdfsHtml = '<div class="resources-heading">' + s.translationRef + '</div>';
                fullPdfs.forEach(function(r) {
                    var fileSrc = _basePath + encodeURIComponent(r.file);
                    var badge   = r.lang ? `<span class="lang-badge">${r.lang.toUpperCase()}</span>` : '';
                    pdfsHtml += `
                        <div class="resource-pdf-item">
                            <i class="pdf-icon">PDF</i>
                            <a href="${fileSrc}" target="_blank">${r.title}</a>${badge}
                        </div>`;
                });
                if (compactPdfs.length > 0) {
                    pdfsHtml += '<details class="compact-pdfs"><summary>Compact versions</summary><div class="compact-list">';
                    compactPdfs.forEach(function(r) {
                        var fileSrc = _basePath + encodeURIComponent(r.file);
                        var badge   = r.lang ? `<span class="lang-badge">${r.lang.toUpperCase()}</span>` : '';
                        pdfsHtml += `
                            <div class="resource-pdf-item">
                                <i class="pdf-icon">PDF</i>
                                <a href="${fileSrc}" target="_blank">${r.title}</a>${badge}
                            </div>`;
                    });
                    pdfsHtml += '</div></details>';
                }
                pdfsEl.innerHTML = pdfsHtml;
            }
        }

        document.getElementById('resources-section').style.display = 'block';
    } catch (e) {
        // No resources.json — section stays hidden
    }
}

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        var modal = document.getElementById('img-modal');
        if (modal) modal.classList.remove('open');
    }
});


function eventLabel(e, lang) {
    var date  = lang === 'ne' ? e.date_ne  : (lang === 'es' ? e.date_es  : e.date);
    var title = lang === 'ne' ? e.title_short_ne : (lang === 'es' ? e.title_short_es : e.title_short);
    return date + ' \u2014 ' + e.location + ' \u2014 ' + title;
}

function loadTalkSelector(lang) {
    var inEventSubpage = window.location.pathname.indexOf('/events/') !== -1 &&
        window.location.pathname.split('/events/')[1].split('/').filter(Boolean).length > 0;
    var inEventsDir = !inEventSubpage && window.location.pathname.indexOf('/events') !== -1;

    var jsonPath, prefix, synthPath;
    if (inEventSubpage) {
        jsonPath   = '../events.json';
        prefix     = '../';
        synthPath  = '../../';
    } else if (inEventsDir) {
        jsonPath   = 'events.json';
        prefix     = '';
        synthPath  = '../';
    } else {
        // Root / synthesis / glossary page
        jsonPath   = 'events/events.json';
        prefix     = 'events/';
        synthPath  = './';
    }

    fetch(jsonPath).then(function(r) { return r.json(); }).then(function(events) {
        var sel = document.getElementById('talk-select');
        if (!sel) return;
        var current = window.location.pathname.split('/').filter(Boolean).pop();
        var isEs = lang === 'es';
        var isNe = lang === 'ne';
        var onSynthesisPage = !inEventSubpage && !inEventsDir && window.location.pathname.endsWith('/');

        var synthLabel = isNe
            ? 'सबै कुराहरूको सारांश — सबै चर्चाका मुख्य विचार'
            : (isEs
                ? 'Resumen de Charlas — Informe IA de ideas principales de todas las charlas'
                : 'Summary of Talks — AI-generated report of main ideas from all the talks');
        var glossPath = synthPath + 'glossary.html?lang=' + lang;
        var glossLabel = isNe
            ? 'शब्दावली — योग र संस्कृत शब्दहरूको परिभाषा'
            : (isEs
                ? 'Glosario de Términos — Definiciones de términos del yoga y sánscrito'
                : 'Glossary of Terms — Definitions of yoga and Sanskrit terms');
        var choosePlaceholder = isNe ? '-- छान्नुहोस् --' : (isEs ? '-- Elegir --' : '-- Choose --');

        var synthOption = onSynthesisPage ? '' :
            '<option value="' + synthPath + '?lang=' + lang + '">' + synthLabel + '</option>';

        var glossOption = '<option value="' + glossPath + '" data-newtab="true">' + glossLabel + '</option>';
        sel.innerHTML = '<option value="">' + choosePlaceholder + '</option>' +
            synthOption +
            events.filter(function(e) { return e.folder !== current; }).map(function(e) {
                return '<option value="' + prefix + e.folder + '/?lang=' + lang + '">' + eventLabel(e, lang) + '</option>';
            }).join('') +
            glossOption;
    }).catch(function() {});
}

function handleTalkSelect(sel) {
    var opt = sel.options[sel.selectedIndex];
    if (!opt || !opt.value) return;
    if (opt.dataset && opt.dataset.newtab) {
        window.open(opt.value, '_blank');
        sel.selectedIndex = 0;
    } else {
        window.location.href = opt.value;
    }
}

function loadEventsList(lang) {
    fetch('events.json').then(function(r) { return r.json(); }).then(function(events) {
        var el = document.getElementById('events');
        if (!el) return;
        el.innerHTML = '<ul>' + events.map(function(e) {
            return '<li><a href="' + e.folder + '/?lang=' + lang + '">' + eventLabel(e, lang) + '</a></li>';
        }).join('') + '</ul>';
    }).catch(function() {
        var el = document.getElementById('events');
        if (el) el.innerHTML = '<p class="error-message">Could not load events.</p>';
    });
}

function injectLangSelectMobile() {
    var toggle = document.querySelector('.lang-toggle');
    if (!toggle) return;

    // Detect current lang from URL path (e.g. /2026-uruguay/en/ or /events/2026-uruguay/es/foo/)
    var pathMatch = window.location.pathname.match(/\/(en|es|ne)\//);
    if (!pathMatch) return;
    var currentLang = pathMatch[1];

    var optionLabels = {
        en: 'English \u2014 Original',
        es: 'Espa\u00f1ol \u2014 IA Traducido',
        ne: '\u0928\u0947\u092a\u093e\u0932\u0940 \u2014 AI \u0905\u0928\u0941\u0935\u093e\u0926\u093f\u0924'
    };
    var selectLabels = {
        en: 'Select language:',
        es: 'Seleccionar idioma:',
        ne: '\u092d\u093e\u0937\u093e \u091b\u093e\u0928\u094d\u0928\u0941\u0939\u094b\u0938\u094d:'
    };

    var sel = document.createElement('select');
    sel.className = 'lang-select-mobile';
    sel.setAttribute('aria-label', selectLabels[currentLang] || selectLabels.en);
    ['en', 'es', 'ne'].forEach(function(l) {
        var opt = document.createElement('option');
        // Swap the lang segment in the current path — works for any URL depth
        opt.value = window.location.pathname.replace('/' + currentLang + '/', '/' + l + '/');
        opt.textContent = optionLabels[l];
        if (l === currentLang) opt.selected = true;
        sel.appendChild(opt);
    });
    sel.addEventListener('change', function() { window.location.href = this.value; });

    var labelEl = document.createElement('span');
    labelEl.className = 'lang-select-label';
    labelEl.textContent = selectLabels[currentLang] || selectLabels.en;

    var wrapper = document.createElement('div');
    wrapper.className = 'lang-select-wrapper';
    wrapper.appendChild(labelEl);
    wrapper.appendChild(sel);
    toggle.parentNode.insertBefore(wrapper, toggle.nextSibling);
}

document.addEventListener('DOMContentLoaded', function() {
    var lang = new URLSearchParams(window.location.search).get('lang')
               || (window.location.pathname.match(/\/(en|es|ne)\//) || [])[1]
               || 'es';
    var s = _topbarStrings(lang);
    var tb = document.createElement('div');
    tb.id = 'topbar';
    tb.className = 'topbar';
    tb.innerHTML =
        '<div class="topbar-credit">' + _creditHtml(s) + '</div>' +
        '<div class="topbar-links">' +
            '<a id="topbar-feedback" href="' + _formUrl('feedback', lang) + '" target="_blank" rel="noopener" aria-label="Share feedback (opens Google Form in new tab)">' + s.feedback + '</a>' +
            '<span class="topbar-sep">&middot;</span>' +
            '<a id="topbar-report" href="' + _formUrl('report', lang) + '" target="_blank" rel="noopener" aria-label="Report an issue (opens Google Form in new tab)">' + s.report + '</a>' +
            '<span class="topbar-sep">&middot;</span>' +
            '<button id="theme-toggle-btn" class="theme-toggle-btn" onclick="toggleTheme()">&#x1F311;</button>' +
        '</div>';
    document.body.insertBefore(tb, document.body.firstChild);
    _updateThemeButton();

    var footerEl = document.querySelector('footer');
    if (footerEl) {
        var bar = document.createElement('div');
        bar.className = 'footer-bar';
        var siteCredit = footerEl.querySelector('.site-credit');
        if (siteCredit) bar.appendChild(siteCredit);
        var fl = document.createElement('div');
        fl.id = 'footer-links';
        fl.className = 'footer-links';
        fl.innerHTML =
            '<a id="footer-feedback" href="' + _formUrl('feedback', lang) + '" target="_blank" rel="noopener" aria-label="Share feedback (opens Google Form in new tab)">' + s.feedback + '</a>' +
            '<span class="topbar-sep">&middot;</span>' +
            '<a id="footer-report" href="' + _formUrl('report', lang) + '" target="_blank" rel="noopener" aria-label="Report an issue (opens Google Form in new tab)">' + s.report + '</a>';
        bar.appendChild(fl);
        footerEl.appendChild(bar);
    }

    injectLangSelectMobile();
});
