// src/services/weatherService.ts

export type WeatherBoxData = {
  city: string;
  date: string; // YYYY-MM-DD
  temp: number; // Temp um ~12:00 (oder fallback)
  tempMin: number;
  tempMax: number;
  condition: string;
  description: string;
  iconUrl: string; // data:image/svg+xml,... (Emoji)
};

const BERLIN = {
  city: "Berlin",
  lat: 52.52,
  lon: 13.405,
  timezone: "Europe/Berlin",
};

const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const ARCHIVE_URL = "https://archive-api.open-meteo.com/v1/archive";

// ---------------- Date helpers ----------------

function assertISODate(dateISO: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateISO)) {
    throw new Error(`Ungültiges Datum (erwartet YYYY-MM-DD): ${dateISO}`);
  }
}

function parseISODate(dateISO: string): { y: number; m: number; d: number } {
  assertISODate(dateISO);
  const parts = dateISO.split("-");
  const y = Number(parts[0]);
  const m = Number(parts[1]);
  const d = Number(parts[2]);

  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) {
    throw new Error(`Ungültiges Datum: ${dateISO}`);
  }
  return { y, m, d };
}

function isoToLocalMidnight(dateISO: string): Date {
  const { y, m, d } = parseISODate(dateISO);
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

function toISODate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function diffDays(a: Date, b: Date): number {
  return Math.round((a.getTime() - b.getTime()) / 86_400_000);
}

// ---------------- Weather code mapping ----------------

function weatherCodeToGerman(code: number): string {
  if (code === 0) return "Klarer Himmel";
  if (code === 1) return "Überwiegend klar";
  if (code === 2) return "Teilweise bewölkt";
  if (code === 3) return "Bewölkt";
  if (code === 45) return "Nebel";
  if (code === 48) return "Reifnebel";

  if ([51, 53, 55].includes(code)) return "Nieselregen";
  if ([56, 57].includes(code)) return "Gefrierender Nieselregen";

  if ([61, 63, 65].includes(code)) return "Regen";
  if ([66, 67].includes(code)) return "Gefrierender Regen";

  if ([71, 73, 75].includes(code)) return "Schneefall";
  if (code === 77) return "Schneegriesel";

  if ([80, 81, 82].includes(code)) return "Regenschauer";
  if ([85, 86].includes(code)) return "Schneeschauer";

  if (code === 95) return "Gewitter";
  if ([96, 99].includes(code)) return "Gewitter mit Hagel";

  return `Wettercode ${code}`;
}

function weatherCodeToCondition(code: number): string {
  if ([0, 1, 2].includes(code)) return "Clear";
  if (code === 3) return "Clouds";
  if ([45, 48].includes(code)) return "Fog";
  if ([51, 53, 55, 56, 57].includes(code)) return "Drizzle";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "Rain";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "Snow";
  if ([95, 96, 99].includes(code)) return "Thunderstorm";
  return "Unknown";
}

function weatherCodeToEmoji(code: number): string {
  if (code === 0) return "☀️";
  if (code === 1) return "🌤️";
  if (code === 2) return "⛅";
  if (code === 3) return "☁️";
  if ([45, 48].includes(code)) return "🌫️";
  if ([51, 53, 55].includes(code)) return "🌦️";
  if ([56, 57].includes(code)) return "🌧️❄️";
  if ([61, 63, 65].includes(code)) return "🌧️";
  if ([66, 67].includes(code)) return "🌧️❄️";
  if ([71, 73, 75, 77].includes(code)) return "🌨️";
  if ([80, 81, 82].includes(code)) return "🌦️";
  if ([85, 86].includes(code)) return "🌨️";
  if (code === 95) return "⛈️";
  if ([96, 99].includes(code)) return "⛈️🧊";
  return "❔";
}

function svgDataUriFromEmoji(emoji: string): string {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64">
      <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" font-size="34">
        ${emoji}
      </text>
    </svg>
  `.trim();

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

// ---------------- Parsing helpers ----------------

function safeNumberAt(arr: unknown, idx: number): number | null {
  if (!Array.isArray(arr)) return null;
  const v = arr[idx];
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

function safeStringAt(arr: unknown, idx: number): string | null {
  if (!Array.isArray(arr)) return null;
  const v = arr[idx];
  return typeof v === "string" ? v : null;
}

function findDailyIndex(dailyTime: unknown, dateISO: string): number {
  if (!Array.isArray(dailyTime)) return -1;
  for (let i = 0; i < dailyTime.length; i++) {
    if (dailyTime[i] === dateISO) return i;
  }
  return -1;
}

function pickClosestToNoonForDate(
  hourlyTime: unknown,
  hourlyTemp: unknown,
  dateISO: string
): number | null {
  if (!Array.isArray(hourlyTime) || !Array.isArray(hourlyTemp)) return null;

  let best: number | null = null;
  let bestDiff = Number.POSITIVE_INFINITY;

  const n = Math.min(hourlyTime.length, hourlyTemp.length);
  for (let i = 0; i < n; i++) {
    const t = hourlyTime[i];
    const v = hourlyTemp[i];
    if (typeof t !== "string") continue;
    if (typeof v !== "number" || !Number.isFinite(v)) continue;

    // Open-Meteo time: "YYYY-MM-DDTHH:MM"
    if (!t.startsWith(dateISO)) continue;

    const hour = Number(t.slice(11, 13));
    if (!Number.isFinite(hour)) continue;

    const diff = Math.abs(hour - 12);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = v;
    }
  }

  return best;
}

// ---------------- Fetch functions ----------------

// Forecast: NICHT start_date/end_date mit past_days/forecast_days mischen! :contentReference[oaicite:2]{index=2}
async function fetchForecastForDay(dateISO: string): Promise<{ tempNoon: number | null; min: number | null; max: number | null; code: number | null }> {
  const url = new URL(FORECAST_URL);

  url.searchParams.set("latitude", String(BERLIN.lat));
  url.searchParams.set("longitude", String(BERLIN.lon));
  url.searchParams.set("timezone", BERLIN.timezone);

  url.searchParams.set("daily", "temperature_2m_min,temperature_2m_max,weather_code");
  url.searchParams.set("hourly", "temperature_2m,weather_code");

  url.searchParams.set("temperature_unit", "celsius");
  url.searchParams.set("timeformat", "iso8601");

  // genug Fenster, damit dein Eintragstag drin liegt (recent past + next forecast)
  url.searchParams.set("past_days", "92");
  url.searchParams.set("forecast_days", "16");

  const res = await fetch(url);
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Open-Meteo Forecast Fehler ${res.status}: ${txt}`);
  }

  const data = await res.json();

  const daily = (data?.daily ?? {}) as Record<string, unknown>;
  const hourly = (data?.hourly ?? {}) as Record<string, unknown>;

  const idx = findDailyIndex(daily["time"], dateISO);
  if (idx < 0) {
    throw new Error(`Forecast enthält Datum nicht: ${dateISO}`);
  }

  const min = safeNumberAt(daily["temperature_2m_min"], idx);
  const max = safeNumberAt(daily["temperature_2m_max"], idx);
  const code = safeNumberAt(daily["weather_code"], idx);

  const tempNoon = pickClosestToNoonForDate(hourly["time"], hourly["temperature_2m"], dateISO);

  return { tempNoon, min, max, code };
}

async function fetchArchiveForDay(dateISO: string): Promise<{ tempNoon: number | null; min: number | null; max: number | null; code: number | null }> {
  const url = new URL(ARCHIVE_URL);

  url.searchParams.set("latitude", String(BERLIN.lat));
  url.searchParams.set("longitude", String(BERLIN.lon));
  url.searchParams.set("timezone", BERLIN.timezone);

  // Archive: start_date/end_date sind korrekt (kein past_days hier)
  url.searchParams.set("start_date", dateISO);
  url.searchParams.set("end_date", dateISO);

  url.searchParams.set("daily", "temperature_2m_min,temperature_2m_max,weather_code");
  url.searchParams.set("hourly", "temperature_2m,weather_code");

  url.searchParams.set("temperature_unit", "celsius");
  url.searchParams.set("timeformat", "iso8601");

  const res = await fetch(url);
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Open-Meteo Archive Fehler ${res.status}: ${txt}`);
  }

  const data = await res.json();

  const daily = (data?.daily ?? {}) as Record<string, unknown>;
  const hourly = (data?.hourly ?? {}) as Record<string, unknown>;

  // bei start=end gibt’s genau 1 Tag -> index 0
  const min = safeNumberAt(daily["temperature_2m_min"], 0);
  const max = safeNumberAt(daily["temperature_2m_max"], 0);
  const code = safeNumberAt(daily["weather_code"], 0);

  const tempNoon = pickClosestToNoonForDate(hourly["time"], hourly["temperature_2m"], dateISO);

  return { tempNoon, min, max, code };
}

// ---------------- Public API ----------------

export async function fetchBerlinWeatherForDate(dateISO: string): Promise<WeatherBoxData> {
  assertISODate(dateISO);

  const target = isoToLocalMidnight(dateISO);
  const today = isoToLocalMidnight(toISODate(new Date()));
  const days = diffDays(target, today);

  // sehr weit zurück -> Archive
  const useArchive = days < -92;

  // sehr weit in der Zukunft -> Forecast kann das nicht
  if (days > 16) {
    throw new Error(`Datum liegt zu weit in der Zukunft für Forecast: ${dateISO}`);
  }

  const { tempNoon, min, max, code } = useArchive
    ? await fetchArchiveForDay(dateISO)
    : await fetchForecastForDay(dateISO);

  const safeMin = typeof min === "number" ? min : NaN;
  const safeMax = typeof max === "number" ? max : NaN;

  const fallbackTemp =
    typeof tempNoon === "number"
      ? tempNoon
      : (Number.isFinite(safeMin) && Number.isFinite(safeMax) ? (safeMin + safeMax) / 2 : NaN);

  const safeCode = typeof code === "number" ? code : 0;

  return {
    city: BERLIN.city,
    date: dateISO,
    temp: Math.round(fallbackTemp),
    tempMin: Math.round(safeMin),
    tempMax: Math.round(safeMax),
    condition: weatherCodeToCondition(safeCode),
    description: weatherCodeToGerman(safeCode),
    iconUrl: svgDataUriFromEmoji(weatherCodeToEmoji(safeCode)),
  };
}
