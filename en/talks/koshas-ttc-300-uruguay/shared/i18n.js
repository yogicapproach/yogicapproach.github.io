/* ============================================================================
   UI chrome strings (interface labels), separate from content.
   Content lives in koshas.<locale>.js. These are the app's own strings.
   Spanish = Uruguayan / rioplatense (voseo, ustedes).
   Use {n} / {host} placeholders; app.js fills them.
   ============================================================================ */
window.KOSHAS_UI = {
  en: {
    tab_overview: "Overview",
    tab_between: "Between",
    tab_awareness: "Awareness",
    tab_practices: "Practices",
    recording: "recording",
    by_host: "hosted by",

    overview_title: "The Five Sheaths",
    overview_glance: "Traditional → modern, at a glance",
    overview_tap: "Tap a row to open that kosha.",
    col_kosha: "Kosha",
    col_traditional: "Traditional",
    col_modernlens: "Modern lens",
    col_car: "In the car",
    overview_sessions: "The four sessions",

    kosha_index: "Kosha {n} of 5",
    trad_presentation: "Traditional presentation",
    modern_lens: "Modern lens",
    in_car: "In the car analogy:",
    reframe_traditional: "traditional",
    axis_scale: "Scale",
    axis_density: "Density",
    axis_nourishment: "Nourishment",
    try_this: "Try this",
    five_questions: "Five questions",
    five_questions_between: "Five questions across the koshas",

    between_title: "Between the Koshas",
    awareness_title: "Awareness Work",
    practices_title: "Practices",
    practices_lead: "The container around the theory — open by settling through the sheaths, close by breathing through them with OM, and carry a little awareness work between sessions.",

    badge_talk: "● from the talk",
    badge_expansion: "◐ to develop",

    foot_meta: "Living document · content in data/notes.{lang}.js · build to single-file for export",
    lang_label: "Language",
    theme_label: "Theme",
    home_link: "All sessions"
  },

  es: {
    tab_overview: "Resumen",
    tab_between: "Entre",
    tab_awareness: "Conciencia",
    tab_practices: "Prácticas",
    recording: "grabación",
    by_host: "con la guía de",

    overview_title: "Las cinco envolturas",
    overview_glance: "De lo tradicional a lo moderno, de un vistazo",
    overview_tap: "Tocá una fila para abrir esa kosha.",
    col_kosha: "Kosha",
    col_traditional: "Tradicional",
    col_modernlens: "Lente moderno",
    col_car: "En el auto",
    overview_sessions: "Las cuatro clases",

    kosha_index: "Kosha {n} de 5",
    trad_presentation: "Presentación tradicional",
    modern_lens: "Lente moderno",
    in_car: "En la analogía del auto:",
    reframe_traditional: "tradicional",
    axis_scale: "Escala",
    axis_density: "Densidad",
    axis_nourishment: "Nutrición",
    try_this: "Probá esto",
    five_questions: "Cinco preguntas",
    five_questions_between: "Cinco preguntas entre las koshas",

    between_title: "Entre las koshas",
    awareness_title: "Trabajo de conciencia",
    practices_title: "Prácticas",
    practices_lead: "El marco alrededor de la teoría: abrí asentándote a través de las envolturas, cerrá respirando a través de ellas con OM, y llevá un poco de trabajo de conciencia entre las clases.",

    badge_talk: "● de la charla",
    badge_expansion: "◐ a desarrollar",

    foot_meta: "Documento vivo · contenido en data/notes.{lang}.js · compilá a archivo único para exportar",
    lang_label: "Idioma",
    theme_label: "Tema",
    home_link: "Todas las clases"
  },

  /* --------------------------------------------------------------------------
     ne — Nepali (Devanagari).  SCAFFOLD ONLY: every value is a flagged
     placeholder "⚠TODO[ne]: <EN source>" awaiting a human / translation pass.
     The renderer already falls back to UI.en per key, so omitted keys are safe;
     these carry the EN source forward so translators see context in place.
     -------------------------------------------------------------------------- */
  ne: {
    tab_overview: "परिचय",
    tab_between: "बीचमा",
    tab_awareness: "सजगता",
    tab_practices: "अभ्यासहरू",
    recording: "रेकर्डिङ",
    by_host: "को मार्गदर्शनमा",
    overview_title: "पाँच कोशहरू",
    overview_glance: "परम्परागतदेखि आधुनिकसम्म, एक नजरमा",
    overview_tap: "त्यो कोश खोल्न एउटा पङ्क्तिमा ट्याप गर्नुहोस्।",
    col_kosha: "कोश",
    col_traditional: "परम्परागत",
    col_modernlens: "आधुनिक लेन्स",
    col_car: "कारमा",
    overview_sessions: "चार सत्रहरू",
    kosha_index: "कोश {n} / ५",
    trad_presentation: "परम्परागत प्रस्तुति",
    modern_lens: "आधुनिक लेन्स",
    in_car: "कारको उपमामा:",
    reframe_traditional: "परम्परागत",
    axis_scale: "स्केल",
    axis_density: "घनत्व",
    axis_nourishment: "पोषण",
    try_this: "यो प्रयास गर्नुहोस्",
    five_questions: "पाँच प्रश्नहरू",
    five_questions_between: "कोशहरूभरि पाँच प्रश्नहरू",
    between_title: "कोशहरूको बीचमा",
    awareness_title: "सजगता अभ्यास",
    practices_title: "अभ्यासहरू",
    practices_lead: "सिद्धान्तको वरिपरिको आधार — कोशहरूमा स्थिर भएर सुरु गर्नुहोस्, OM सहित तिनीहरूमा सास फेर्दै अन्त्य गर्नुहोस्, र सत्रहरूका बीचमा थोरै सजगता अभ्यास गर्नुहोस्।",
    badge_talk: "● प्रवचनबाट",
    badge_expansion: "◐ विकास गर्न बाँकी",
    foot_meta: "जीवन्त दस्तावेज · सामग्री data/notes.{lang}.js मा · निर्यातका लागि एकल-फाइलमा बनाउनुहोस्",
    lang_label: "भाषा",
    theme_label: "थिम",
    home_link: "सबै सत्रहरू"
  },

  /* --------------------------------------------------------------------------
     pt — Portuguese.  SCAFFOLD ONLY: every value is a flagged placeholder
     "⚠TODO[pt]: <EN source>" awaiting a human / translation pass.
     -------------------------------------------------------------------------- */
  pt: {
    tab_overview: "⚠MT[pt]: Visão Geral",
    tab_between: "⚠MT[pt]: Entre",
    tab_awareness: "⚠MT[pt]: Consciência",
    tab_practices: "⚠MT[pt]: Práticas",
    recording: "⚠MT[pt]: gravação",
    by_host: "⚠MT[pt]: hostado por",

    overview_title: "⚠MT[pt]: As Cinco Camadas",
    overview_glance: "⚠MT[pt]: Tradicional → moderno, de um vistozinho",
    overview_tap: "⚠MT[pt]: Toque uma linha para abrir aquele kosha.",
    col_kosha: "⚠MT[pt]: Cósha",
    col_traditional: "⚠MT[pt]: Tradicional",
    col_modernlens: "⚠MT[pt]: Lente moderna",
    col_car: "⚠MT[pt]: No carro",
    overview_sessions: "⚠MT[pt]: As quatro sessões",

    kosha_index: "⚠MT[pt]: Kosha {n} de 5",
    trad_presentation: "⚠MT[pt]: Presentação tradicional",
    modern_lens: "⚠MT[pt]: Lente moderna",
    in_car: "⚠MT[pt]: No análogo de carro:",
    reframe_traditional: "⚠MT[pt]: tradicional",
    axis_scale: "⚠MT[pt]: Escala",
    axis_density: "⚠MT[pt]: Densidade",
    axis_nourishment: "⚠MT[pt]: Alimentação",
    try_this: "⚠MT[pt]: Tente isso",
    five_questions: "⚠MT[pt]: Cinco perguntas",
    five_questions_between: "⚠MT[pt]: Cinco perguntas sobre os koshas",

    between_title: "⚠MT[pt]: Entre os Koshas",
    awareness_title: "⚠MT[pt]: Trabalho de Consciência",
    practices_title: "⚠MT[pt]: Práticas",
    practices_lead: "⚠MT[pt]: O contêiner ao redor da teoria — abra-se por meio do estabelecimento através das camadas, feche-se respirando nelas com OM, e leve um pouco de trabalho de consciência entre as sessões.",

    badge_talk: "⚠MT[pt]: ● do discurso",
    badge_expansion: "⚠MT[pt]: para desenvolver",

    foot_meta: "⚠MT[pt]: Documento vivo · conteúdo em data/notes.{lang}.js · construído para arquivo único para exportação",
    lang_label: "⚠MT[pt]: Língua",
    theme_label: "⚠MT[pt]: Tema",
    home_link: "⚠MT[pt]: Todas as sessões"
  }
};
