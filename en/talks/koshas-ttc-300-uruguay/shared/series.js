/* ============================================================================
   Series catalog — drives the home hub and cross-session links.
   Bilingual (EN / Uruguayan Spanish). `status`: "ready" | "upcoming".
   `href` is relative to the project root (where the home index.html lives).
   ============================================================================ */
window.KOSHAS_SERIES = {
  en: {
    title: "The Five Koshas",
    subtitle: "A Framework for Awareness",
    course: "300-Hour Teacher Training · Uruguay",
    teacher: "Satchidananda",
    host: "Ale",
    blurb: "A four-session journey through the five sheaths — from the traditional map toward a living, practical framework you can teach from and practise within.",
    recording: "https://www.youtube.com/watch?v=fDUM_Rr7H-Q",
    upcoming_label: "Notes appear after the class",
    open_label: "Open notes",
    sessions: [
      { n: 1, id: "session-1", title: "The Five Koshas", theme: "Theory — from the traditional presentation toward a modern reframe.", date: "10 Jun 2026", status: "ready", href: "sessions/session-1/" },
      { n: 2, id: "session-2", title: "Connection", theme: "The koshas from the perspective of how to connect — between students and teachers.", date: "16 Jun 2026", status: "upcoming", href: "sessions/session-2/" },
      { n: 3, id: "session-3", title: "Society", theme: "The koshas in relation to society, and how that affects us within these layers.", date: "—", status: "upcoming", href: "sessions/session-3/" },
      { n: 4, id: "session-4", title: "Integration", theme: "Exploring and deepening the koshas through what we’ve integrated in the earlier sessions.", date: "—", status: "upcoming", href: "sessions/session-4/" }
    ]
  },
  es: {
    title: "Los Cinco Koshas",
    subtitle: "Un marco para la conciencia",
    course: "Formación Docente de 300 horas · Uruguay",
    teacher: "Satchidananda",
    host: "Ale",
    blurb: "Un recorrido de cuatro clases por las cinco envolturas — desde el mapa tradicional hacia un marco vivo y práctico desde el cual enseñar y dentro del cual practicar.",
    recording: "https://www.youtube.com/watch?v=fDUM_Rr7H-Q",
    upcoming_label: "Los apuntes aparecen después de la clase",
    open_label: "Abrir apuntes",
    sessions: [
      { n: 1, id: "session-1", title: "Los Cinco Koshas", theme: "Teoría — de la presentación tradicional hacia una relectura moderna.", date: "10 jun 2026", status: "ready", href: "sessions/session-1/" },
      { n: 2, id: "session-2", title: "Conexión", theme: "Los koshas desde la perspectiva de cómo conectar — entre estudiantes y docentes.", date: "16 jun 2026", status: "upcoming", href: "sessions/session-2/" },
      { n: 3, id: "session-3", title: "Sociedad", theme: "Los koshas en relación con la sociedad, y cómo eso nos afecta dentro de estas capas.", date: "—", status: "upcoming", href: "sessions/session-3/" },
      { n: 4, id: "session-4", title: "Integración", theme: "Explorar y profundizar los koshas a través de lo integrado en las clases anteriores.", date: "—", status: "upcoming", href: "sessions/session-4/" }
    ]
  },

  /* --------------------------------------------------------------------------
     ne — Nepali (Devanagari). SCAFFOLD ONLY: translatable fields are flagged
     "⚠TODO[ne]: <EN source>" placeholders awaiting a human / translation pass.
     Structural fields (n, id, status, href, recording, teacher, host) verbatim.
     home.js deep-merges this over the EN catalog, so anything omitted falls back.
     -------------------------------------------------------------------------- */
  ne: {
    title: "⚠TODO[ne]: The Five Koshas",
    subtitle: "⚠TODO[ne]: A Framework for Awareness",
    course: "⚠TODO[ne]: 300-Hour Teacher Training · Uruguay",
    teacher: "Satchidananda",
    host: "Ale",
    blurb: "⚠TODO[ne]: A four-session journey through the five sheaths — from the traditional map toward a living, practical framework you can teach from and practise within.",
    recording: "https://www.youtube.com/watch?v=fDUM_Rr7H-Q",
    upcoming_label: "⚠TODO[ne]: Notes appear after the class",
    open_label: "⚠TODO[ne]: Open notes",
    sessions: [
      { n: 1, id: "session-1", title: "⚠TODO[ne]: The Five Koshas", theme: "⚠TODO[ne]: Theory — from the traditional presentation toward a modern reframe.", date: "⚠TODO[ne]: 10 Jun 2026", status: "ready", href: "sessions/session-1/" },
      { n: 2, id: "session-2", title: "⚠TODO[ne]: Connection", theme: "⚠TODO[ne]: The koshas from the perspective of how to connect — between students and teachers.", date: "⚠TODO[ne]: 16 Jun 2026", status: "upcoming", href: "sessions/session-2/" },
      { n: 3, id: "session-3", title: "⚠TODO[ne]: Society", theme: "⚠TODO[ne]: The koshas in relation to society, and how that affects us within these layers.", date: "—", status: "upcoming", href: "sessions/session-3/" },
      { n: 4, id: "session-4", title: "⚠TODO[ne]: Integration", theme: "⚠TODO[ne]: Exploring and deepening the koshas through what we’ve integrated in the earlier sessions.", date: "—", status: "upcoming", href: "sessions/session-4/" }
    ]
  },

  /* --------------------------------------------------------------------------
     pt — Portuguese. SCAFFOLD ONLY: translatable fields flagged
     "⚠TODO[pt]: <EN source>" awaiting a human / translation pass.
     -------------------------------------------------------------------------- */
  pt: {
    title: "⚠TODO[pt]: The Five Koshas",
    subtitle: "⚠TODO[pt]: A Framework for Awareness",
    course: "⚠TODO[pt]: 300-Hour Teacher Training · Uruguay",
    teacher: "Satchidananda",
    host: "Ale",
    blurb: "⚠TODO[pt]: A four-session journey through the five sheaths — from the traditional map toward a living, practical framework you can teach from and practise within.",
    recording: "https://www.youtube.com/watch?v=fDUM_Rr7H-Q",
    upcoming_label: "⚠TODO[pt]: Notes appear after the class",
    open_label: "⚠TODO[pt]: Open notes",
    sessions: [
      { n: 1, id: "session-1", title: "⚠TODO[pt]: The Five Koshas", theme: "⚠TODO[pt]: Theory — from the traditional presentation toward a modern reframe.", date: "⚠TODO[pt]: 10 Jun 2026", status: "ready", href: "sessions/session-1/" },
      { n: 2, id: "session-2", title: "⚠TODO[pt]: Connection", theme: "⚠TODO[pt]: The koshas from the perspective of how to connect — between students and teachers.", date: "⚠TODO[pt]: 16 Jun 2026", status: "upcoming", href: "sessions/session-2/" },
      { n: 3, id: "session-3", title: "⚠TODO[pt]: Society", theme: "⚠TODO[pt]: The koshas in relation to society, and how that affects us within these layers.", date: "—", status: "upcoming", href: "sessions/session-3/" },
      { n: 4, id: "session-4", title: "⚠TODO[pt]: Integration", theme: "⚠TODO[pt]: Exploring and deepening the koshas through what we’ve integrated in the earlier sessions.", date: "—", status: "upcoming", href: "sessions/session-4/" }
    ]
  }
};
