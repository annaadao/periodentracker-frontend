// src/services/weatherService.ts

export type WeatherBoxData = {
  city: string;
  date: string; // YYYY-MM-DD
  temp: number; // current temp
  tempMin: number;
  tempMax: number;
  condition: string;    // e.g. "Clouds"
  description: string;  // e.g. "overcast clouds"
  iconUrl: string;      // full URL for icon
};

// Berlin fixed coords
const BERLIN = {
  city: "Berlin",
  lat: 52.52,
  lon: 13.405,
};

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY as string | undefined;

// OpenWeather: OneCall 3.0 (needs key). If your key doesn't have OneCall,
// fallback to 2.5 forecast is possible (we keep it simple: OneCall first).
const ONECALL_URL = "https://api.openweathermap.org/data/3.0/onecall";

function toISODate(d: Date): string {
  // YYYY-MM-DD
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function iconUrl(iconCode: string): string {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}

export async function fetchBerlinWeatherForDate(dateISO: string): Promise<WeatherBoxData> {
  if (!API_KEY || API_KEY.trim() === "") {
    throw new Error("VITE_OPENWEATHER_API_KEY fehlt in .env");
  }

  // OneCall gives daily array for ~7 days from now.
  // For your UI: you only need current + daily[min/max] + daily[weather].
  const url =
    `${ONECALL_URL}?lat=${BERLIN.lat}&lon=${BERLIN.lon}` +
    `&units=metric&exclude=minutely,alerts,hourly` +
    `&appid=${encodeURIComponent(API_KEY)}`;

  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenWeather API Fehler: ${res.status} ${text}`);
  }

  const data = await res.json();

  // find matching daily item by date
  const targetDay = dateISO;

  const daily = Array.isArray(data.daily) ? data.daily : [];
  let best = daily[0];

  // OpenWeather gives dt as unix seconds.
  // We'll map each to ISO date and pick exact match; if none match, pick first.
  for (const d of daily) {
    const dt = typeof d.dt === "number" ? d.dt : null;
    if (!dt) continue;
    const iso = toISODate(new Date(dt * 1000));
    if (iso === targetDay) {
      best = d;
      break;
    }
  }

  const currentTemp = typeof data.current?.temp === "number" ? data.current.temp : NaN;
  const min = typeof best?.temp?.min === "number" ? best.temp.min : NaN;
  const max = typeof best?.temp?.max === "number" ? best.temp.max : NaN;

  const weather0 = Array.isArray(best?.weather) ? best.weather[0] : null;
  const condition = typeof weather0?.main === "string" ? weather0.main : "Unknown";
  const desc = typeof weather0?.description === "string" ? weather0.description : "unbekannt";
  const icon = typeof weather0?.icon === "string" ? weather0.icon : "01d";

  return {
    city: BERLIN.city,
    date: dateISO,
    temp: Math.round(currentTemp),
    tempMin: Math.round(min),
    tempMax: Math.round(max),
    condition,
    description: desc,
    iconUrl: iconUrl(icon),
  };
}
