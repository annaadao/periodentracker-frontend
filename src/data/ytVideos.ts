// src/data/ytVideos.ts
// -> Du speicherst hier die Video-LINKS + Titel.
// -> Thumbnail & Embed werden daraus automatisch generiert.

export type CategoryKey = "allgemein" | "tipps" | "zyklus" | "koerperzeichen";

export type VideoItem = {
  id: string;      // interne ID für Router (eindeutig)
  title: string;   // UI Titel
  url: string;     // YouTube Link (watch / youtu.be / embed / shorts)
};

export type Category = {
  key: CategoryKey;
  label: string;
  videos: VideoItem[];
};

export const CATEGORY_LABEL: Record<CategoryKey, string> = {
  allgemein: "Allgemein über Periode",
  tipps: "Tipps & Self-Care",
  zyklus: "Zyklus",
  koerperzeichen: "Körperzeichen",
};

// =======================
// Helpers
// =======================

// Robust: holt Video-ID aus gängigen YouTube-URL-Formaten
export function extractYouTubeId(input: string): string {
  if (!input) return "";

  const url = input.trim();

  // 1) youtu.be/<id>
  const short = url.match(/youtu\.be\/([A-Za-z0-9_-]{6,})/);
  if (short?.[1]) return short[1];

  // 2) youtube.com/watch?v=<id>
  const watch = url.match(/[?&]v=([A-Za-z0-9_-]{6,})/);
  if (watch?.[1]) return watch[1];

  // 3) youtube.com/embed/<id>
  const embed = url.match(/youtube\.com\/embed\/([A-Za-z0-9_-]{6,})/);
  if (embed?.[1]) return embed[1];

  // 4) youtube.com/shorts/<id>
  const shorts = url.match(/youtube\.com\/shorts\/([A-Za-z0-9_-]{6,})/);
  if (shorts?.[1]) return shorts[1];

  return "";
}

// ✅ Thumbnail, das wirklich existiert (hqdefault fast immer vorhanden)
export function youtubeThumb(url: string): string {
  const id = extractYouTubeId(url);
  if (!id) return "";
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

// ✅ Embed-URL für iFrame
export function youtubeEmbed(url: string): string {
  const id = extractYouTubeId(url);
  if (!id) return "";
  return `https://www.youtube.com/embed/${id}?rel=0`;
}

// Optional: Öffnen auf YouTube (falls Embedding blockiert)
export function youtubeWatch(url: string): string {
  const id = extractYouTubeId(url);
  if (!id) return url;
  return `https://www.youtube.com/watch?v=${id}`;
}

// =======================
// Daten (aus deiner DOCX)
// =======================

export const INFO_CATEGORIES: Category[] = [
  {
    key: "allgemein",
    label: CATEGORY_LABEL.allgemein,
    videos: [
      {
        id: "allgemein-1",
        title: "Menstruation: Was im Körper passiert, wenn es blutet | Sex & the Body 3 (von dw)",
        url: "https://www.youtube.com/watch?v=ts98p05t0eY",
      },
      {
        id: "allgemein-2",
        title: "Was ist Periode und Menstruationszyklus? (von always)",
        url: "https://www.youtube.com/watch?v=yFZQAYsw7xY",
      },
      {
        id: "allgemein-3",
        title: "Menstruation: Das solltest du über die Periode wissen | Quarks kompakt",
        url: "https://www.youtube.com/watch?v=Z1kIj45DM1Q&t=596s",
      },
      {
        id: "allgemein-4",
        title: "Alles rund um die 1. Periode | #doktorsex | DAK-Gesundheit",
        url: "https://www.youtube.com/watch?v=UjKtVkGH52w",
      },
    ],
  },

  {
    key: "zyklus",
    label: CATEGORY_LABEL.zyklus,
    videos: [
      {
        id: "zyklus-1",
        title: "Frauenärztin Dr. Eder erklärt, wie der Zyklus funktioniert | o.b.® Let’s do",
        url: "https://www.youtube.com/watch?v=eM6z8kwzGHY",
      },
      {
        id: "zyklus-2",
        title: "Menstruationszyklus - Ovulation - Hormonelle Regulation (GnRH, FSH, LH, Östradiol, Progesteron)",
        url: "https://www.youtube.com/watch?v=DOpoNkcrmfA&t=2s",
      },
      {
        id: "zyklus-3",
        title: "Was bei der Menstruation im Körper passiert | logo! einfach erklärt",
        url: "https://www.youtube.com/watch?v=n8Kau0G_fN0",
      },
      {
        id: "zyklus-4",
        title: "Weiblicher Zyklus - warum du dich jeden Tag anders fühlst | Hormone, Tipps, Ernährung",
        url: "https://www.youtube.com/watch?v=clk2Z8SUgzk&t=22s",
      },
    ],
  },

  {
    key: "koerperzeichen",
    label: CATEGORY_LABEL.koerperzeichen,
    videos: [
      {
        id: "koerperzeichen-1",
        title: "Riecht meine Scheide normal? 😱 Frauenärztin über Ausfluss & Geruch | erdbeerwoche 🍓",
        url: "https://www.youtube.com/watch?v=6_Cg_45uZB0",
      },
      {
        id: "koerperzeichen-2",
        title: "Das sagt Scheidenausfluss über deine Gesundheit aus | #doktorsex | DAK-Gesundheit",
        url: "https://www.youtube.com/watch?v=-QInxfRCOf8&t=118s",
      },
      {
        id: "koerperzeichen-3",
        title: "Hilfe, untenrum riecht es komisch | #doktorsex | DAK-Gesundheit",
        url: "https://www.youtube.com/watch?v=p1mSYvplQgE",
      },
      {
        id: "koerperzeichen-4",
        title: "Vaginaler Ausfluss – was normal ist & wann du handeln solltest | Mit Frau_gyn",
        url: "https://www.youtube.com/watch?v=mnCSZVBqD50",
      },
      {
        id: "koerperzeichen-5",
        title: "Deswegen kommt deine Periode manchmal später | #doktorsex | DAK-Gesundheit",
        url: "https://www.youtube.com/watch?v=_IqcKtcN-Bo",
      },
    ],
  },

  {
    key: "tipps",
    label: CATEGORY_LABEL.tipps,
    videos: [
      {
        id: "tipps-1",
        title: "Periodenschmerzen: Tipps für eine entspanntere Periode | #doktorsex | DAK-Gesundheit",
        url: "https://www.youtube.com/watch?v=29cvdrNHEMk",
      },
      {
        id: "tipps-2",
        title: "Schwimmen während der Periode – Tipps & Tricks",
        url: "https://www.youtube.com/watch?v=RUDrDnJPUGE",
      },
      {
        id: "tipps-3",
        title: "Starke Periode: Was tun? 3 Tipps zu starker Menstruation | 🍓erdbeerwoche",
        url: "https://www.youtube.com/watch?v=pIdf6x809ZE",
      },
      {
        id: "tipps-4",
        title: "PERIODEN TIPPS🩸😱|Tricks, Hacks, Erklärung & Girltalk Periode🤭",
        url: "https://www.youtube.com/watch?v=opQea0rukeM",
      },
      {
        id: "tipps-5",
        title: "8 Tipps gegen Regelschmerzen | Schmerzfrei durch die Periode",
        url: "https://www.youtube.com/watch?v=r8dBcyMZQEM",
      },
    ],
  },
];
