export type DayEntry = {
  date: string;        // YYYY-MM-DD
  periode: boolean;
  symptom: string;
  emotion?: string;
  note?: string;
};

const KEY = 'cycle-entries-v1' as const;

function safeParse<T>(raw: string | null, fallback: T): T {
  try {
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function readAll(): Record<string, DayEntry> {
  // streng getypt zurückgeben
  return safeParse<Record<string, DayEntry>>(localStorage.getItem(KEY), {});
}

function writeAll(all: Record<string, DayEntry>) {
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function saveEntry(e: DayEntry) {
  const all = readAll();
  all[e.date] = e;
  writeAll(all);
}

export function loadEntry(date: string): DayEntry | undefined {
  return readAll()[date];
}

export function periodDatesForMonth(year: number, month0: number): Set<string> {
  const all = readAll();
  const set = new Set<string>();


  for (const [k, entry] of Object.entries(all) as [string, DayEntry][]) {
    if (!entry.periode) continue;

    const y = Number(k.slice(0, 4));
    const m0 = Number(k.slice(5, 7)) - 1;

    if (y === year && m0 === month0) set.add(k);
  }
  return set;
}

/* ---- NEU: Löschen & Existenzcheck ---- */
export function deleteEntry(date: string) {
  const all = readAll();
  if (all[date]) {
    delete all[date];
    writeAll(all);
  }
}

export function hasEntry(date: string): boolean {
  return !!readAll()[date];
}
