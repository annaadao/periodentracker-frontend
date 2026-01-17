<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import axios from "axios"

const route = useRoute()
const router = useRouter()

const API = (import.meta as any).env?.VITE_API_BASE_URL || "https://periodentracker.onrender.com/api/v1"
const OPENWEATHER_KEY = (import.meta as any).env?.VITE_OPENWEATHER_API_KEY as string | undefined

const isoDate = computed(() => route.params.date as string) // YYYY-MM-DD

function isoToDe(iso: string) {
  const [y, m, d] = iso.split("-")
  return `${d}-${m}-${y}` // dd-mm-yyyy (Backend)
}

type PeriodEntry = {
  id?: number
  date: string // dd-mm-yyyy
  symptom?: string
  note?: string
  periode?: boolean
  bleeding?: number // 1..3
  pain?: number // 0..3
  mood?: number // 1..5
  meds?: string[]
}

const entryId = ref<number | null>(null)

const periode = ref<boolean | null>(null)
const bleeding = ref<number>(2)
const pain = ref<number>(1)
const symptom = ref<string>("")
const mood = ref<number>(3)
const meds = ref<string[]>([])
const note = ref<string>("")

const moodOptions = [
  { v: 1, emoji: "😡", label: "wütend" },
  { v: 2, emoji: "😢", label: "traurig" },
  { v: 3, emoji: "😐", label: "neutral" },
  { v: 4, emoji: "🙂", label: "glücklich" },
  { v: 5, emoji: "😁", label: "sehr glücklich" },
]

const medOptions = ["Schmerzmittel", "Krampflöser", "Wärme", "Nichts"] as const

function toggleMed(m: string) {
  if (m === "Nichts") {
    meds.value = ["Nichts"]
    return
  }
  meds.value = meds.value.filter((x) => x !== "Nichts")

  if (meds.value.includes(m)) meds.value = meds.value.filter((x) => x !== m)
  else meds.value = [...meds.value, m]
}

function storageKey() {
  return `entryDraft:${isoDate.value}`
}

function saveLocalDraft() {
  const payload = {
    periode: periode.value,
    bleeding: bleeding.value,
    pain: pain.value,
    symptom: symptom.value,
    mood: mood.value,
    meds: meds.value,
    note: note.value,
  }
  localStorage.setItem(storageKey(), JSON.stringify(payload))
}

function loadLocalDraft() {
  const raw = localStorage.getItem(storageKey())
  if (!raw) return
  try {
    const d = JSON.parse(raw)
    if (typeof d.periode === "boolean") periode.value = d.periode
    if (typeof d.bleeding === "number") bleeding.value = d.bleeding
    if (typeof d.pain === "number") pain.value = d.pain
    if (typeof d.symptom === "string") symptom.value = d.symptom
    if (typeof d.mood === "number") mood.value = d.mood
    if (Array.isArray(d.meds)) meds.value = d.meds
    if (typeof d.note === "string") note.value = d.note
  } catch {}
}

async function loadFromBackend() {
  try {
    const res = await axios.get<PeriodEntry[]>(`${API}/entries`)
    const targetDe = isoToDe(isoDate.value)

    const candidates = (res.data ?? []).filter((e) => e?.date === targetDe)
    if (!candidates.length) {
      entryId.value = null
      return
    }

    const found = candidates.reduce((best, cur) =>
      (cur.id ?? 0) > (best.id ?? 0) ? cur : best
    )

    entryId.value = found.id ?? null
    symptom.value = found.symptom ?? ""
    note.value = found.note ?? ""

    if (typeof found.periode === "boolean") periode.value = found.periode
    if (typeof found.bleeding === "number") bleeding.value = found.bleeding
    if (typeof found.pain === "number") pain.value = found.pain
    if (typeof found.mood === "number") mood.value = found.mood
    if (Array.isArray(found.meds)) meds.value = found.meds
  } catch (err) {
    console.error("GET /entries failed:", err)
    entryId.value = null
  }
}

async function saveToBackend() {
  const payload: PeriodEntry = {
    date: isoToDe(isoDate.value),
    symptom: symptom.value,
    note: note.value,
    periode: periode.value ?? undefined,
    bleeding: bleeding.value,
    pain: pain.value,
    mood: mood.value,
    meds: meds.value,
  }

  const res = await axios.post(`${API}/entries`, payload)
  entryId.value = res.data?.id ?? entryId.value
}

async function deleteFromBackend() {
  const deDate = isoToDe(isoDate.value)
  await axios.delete(`${API}/entries/by-date/${encodeURIComponent(deDate)}`)
  entryId.value = null
}

/* ---------------------- WEATHER (OpenWeather) ---------------------- */
type WeatherState =
  | { status: "loading" }
  | { status: "no-key" }
  | { status: "error" }
  | {
  status: "ok"
  temp: number
  minTemp: number
  maxTemp: number
  text: string
  iconUrl: string | null
}

const weather = ref<WeatherState>({ status: "loading" })

function roundTemp(n: number) {
  return Number.isFinite(n) ? Math.round(n) : 0
}

function pickClosestToNoon(items: any[]) {
  let best = items[0]
  let bestDiff = 999
  for (const it of items) {
    const dt = String(it.dt_txt ?? "")
    const hour = Number(dt.slice(11, 13))
    const diff = Math.abs(hour - 12)
    if (diff < bestDiff) {
      bestDiff = diff
      best = it
    }
  }
  return best
}

async function loadWeather() {
  if (!OPENWEATHER_KEY || !OPENWEATHER_KEY.trim()) {
    weather.value = { status: "no-key" }
    return
  }

  weather.value = { status: "loading" }

  try {
    // Berlin fix
    const lat = 52.52
    const lon = 13.405

    // Forecast (3h) -> wir filtern auf den ausgewählten Tag
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&lang=de&appid=${encodeURIComponent(
      OPENWEATHER_KEY
    )}`

    const res = await fetch(url)
    if (!res.ok) throw new Error("OpenWeather forecast failed")
    const data = await res.json()

    const list = Array.isArray(data.list) ? data.list : []
    const target = isoDate.value // YYYY-MM-DD

    const dayItems = list.filter((it: any) => String(it.dt_txt ?? "").startsWith(target))
    if (!dayItems.length) {
      weather.value = { status: "error" }
      return
    }

    const temps = dayItems
      .map((it: any) => Number(it.main?.temp))
      .filter((n: number) => Number.isFinite(n))

    const minTemp = Math.min(...temps)
    const maxTemp = Math.max(...temps)

    const pick = pickClosestToNoon(dayItems)
    const temp = Number(pick?.main?.temp)

    const w = Array.isArray(pick?.weather) ? pick.weather[0] : null
    const text = String(w?.description ?? "unbekannt")
    const icon = String(w?.icon ?? "")
    const iconUrl = icon ? `https://openweathermap.org/img/wn/${icon}@2x.png` : null

    weather.value = {
      status: "ok",
      temp,
      minTemp,
      maxTemp,
      text,
      iconUrl,
    }
  } catch (e) {
    console.error("Weather load failed:", e)
    weather.value = { status: "error" }
  }
}

/* ------------------------------------------------------------------ */

async function onSave() {
  if (periode.value === null) {
    alert("Bitte wähle bei 'Periode' Ja oder Nein aus, bevor du speicherst.")
    return
  }

  saveLocalDraft()

  try {
    await saveToBackend()
    window.dispatchEvent(new Event("entries-updated"))

    alert("✅ Eintrag wurde in der DB gespeichert!")
    router.push({
      name: "kalender-monat",
      query: { year: isoDate.value.slice(0, 4), month: Number(isoDate.value.slice(5, 7)) - 1 },
    })
  } catch (err: any) {
    console.error("SAVE failed:", err)
    console.error("Status:", err?.response?.status)
    console.error("Data:", err?.response?.data)
    alert("❌ Speichern fehlgeschlagen. Schau in die Konsole (Network/Console).")
  }
}

async function onDelete() {
  if (!confirm("Willst du den Eintrag wirklich löschen?")) return

  try {
    localStorage.removeItem(storageKey())
    await deleteFromBackend()

    window.dispatchEvent(new Event("entries-updated"))

    alert("🗑 Eintrag wurde in der DB gelöscht!")
    router.push({
      name: "kalender-monat",
      query: { year: isoDate.value.slice(0, 4), month: Number(isoDate.value.slice(5, 7)) - 1 },
    })
  } catch (err: any) {
    console.error("DELETE failed:", err)
    console.error("Status:", err?.response?.status)
    console.error("Data:", err?.response?.data)
    alert("❌ Löschen fehlgeschlagen. Schau in die Konsole (Network/Console).")
  }
}

onMounted(async () => {
  loadLocalDraft()
  await loadFromBackend()
  await loadWeather()
})

watch(
  () => isoDate.value,
  async () => {
    // wenn du zwischen Tagen wechselst
    loadLocalDraft()
    await loadFromBackend()
    await loadWeather()
  }
)
</script>

<template>
  <section class="entryCard">
    <div class="headerRow">
      <h2 class="entryTitle">Eintrag für {{ isoDate }}</h2>

      <!-- Wetter-Kästchen rechts neben Datum -->
      <div class="weatherCard">
        <div class="weatherTop">
          <div class="weatherIcon">
            <img
              v-if="weather.status === 'ok' && weather.iconUrl"
              :src="weather.iconUrl"
              alt="Wetter Icon"
            />
            <span v-else class="fallbackIcon">?</span>
          </div>

          <div class="weatherMain">
            <div class="tempLine">
              <span class="tempNow">
                {{ weather.status === 'ok' ? roundTemp(weather.temp) : "—" }}
              </span>
              <span class="tempUnit">°C</span>
            </div>

            <div class="minmaxLine">
              <span class="minmaxLabel">min</span>
              <span class="minmaxVal">{{ weather.status === 'ok' ? roundTemp(weather.minTemp) : "—" }}</span>
              <span class="sep">/</span>
              <span class="minmaxLabel">max</span>
              <span class="minmaxVal">{{ weather.status === 'ok' ? roundTemp(weather.maxTemp) : "—" }}</span>
            </div>

            <div class="desc">
              {{ weather.status === 'ok' ? weather.text : (weather.status === 'no-key' ? "API-Key fehlt" : "unbekannt") }}
            </div>
          </div>

          <div class="city">Berlin</div>
        </div>

        <div v-if="weather.status === 'loading'" class="hint">lädt…</div>
        <div v-if="weather.status === 'error'" class="hint error">Wetter nicht ladbar</div>
      </div>
    </div>

    <!-- Periode Ja/Nein -->
    <div class="block">
      <div class="labelBig">Hast du an dem Tag Deine Periode?</div>
      <div class="radioRow">
        <label class="radio">
          <input type="radio" name="periode" :checked="periode === true" @change="periode = true" />
          <span>Ja</span>
        </label>
        <label class="radio">
          <input type="radio" name="periode" :checked="periode === false" @change="periode = false" />
          <span>Nein</span>
        </label>
      </div>
    </div>

    <!-- Blutung -->
    <div class="block">
      <div class="labelBig">Stärke der Blutung:</div>
      <input class="range heartThumb" type="range" min="1" max="3" step="1" v-model="bleeding" />
      <div class="rangeLabels three">
        <span>leicht</span><span>mittel</span><span>stark</span>
      </div>
    </div>

    <!-- Schmerz -->
    <div class="block">
      <div class="labelBig">Schmerzlevel:</div>
      <input class="range heartThumb" type="range" min="0" max="3" step="1" v-model="pain" />
      <div class="rangeLabels four">
        <span>keine</span><span>leicht</span><span>mittel</span><span>stark</span>
      </div>
    </div>

    <!-- Symptome -->
    <div class="block">
      <div class="labelBig">Symptome:</div>
      <textarea class="text" v-model="symptom" placeholder="z.B. starke Unterleibsschmerzen" />
    </div>

    <!-- Stimmung -->
    <div class="block">
      <div class="labelBig">Wie geht es Dir?</div>
      <div class="moodRow">
        <button
          v-for="m in moodOptions"
          :key="m.v"
          class="moodBtn"
          :class="{ active: mood === m.v }"
          type="button"
          @click="mood = m.v"
          :aria-label="m.label"
          :title="m.label"
        >
          <span class="emoji">{{ m.emoji }}</span>
        </button>
      </div>
    </div>

    <!-- Medikamente -->
    <div class="block">
      <div class="labelBig">Nimmst du Medikamente?</div>
      <div class="chipRow">
        <button
          v-for="m in medOptions"
          :key="m"
          class="chip"
          :class="{ active: meds.includes(m) }"
          type="button"
          @click="toggleMed(m)"
        >
          {{ m }}
        </button>
      </div>
    </div>

    <!-- Notizen -->
    <div class="block">
      <div class="labelBig">Notizen:</div>
      <textarea class="area" v-model="note" placeholder="Weitere Details..."></textarea>
    </div>

    <div class="actions">
      <button class="btn ghost" type="button" @click="router.back()">Zurück</button>
      <button class="btn" type="button" @click="onSave">Speichern</button>
      <button class="btn danger" type="button" @click="onDelete" :disabled="!entryId">Löschen</button>
    </div>
  </section>
</template>

<style scoped>
.entryCard{
  border:1px solid var(--border);
  background: var(--card);
  border-radius: 18px;
  padding: 30px;
  max-width: 1100px;
  margin-left: 120px;
}

/* Header row (Titel links, Wetter rechts) */
.headerRow{
  display:flex;
  align-items:flex-start;
  justify-content: space-between;
  gap: 18px;
}

/* Eintrag für xxxx */
.entryTitle{
  margin: 0;
  margin-bottom: 60px;
  color: var(--accent);
  font-weight: 900;
  font-size: 40px;
}

/* Wetterbox */
.weatherCard{
  width: 260px;
  border-radius: 16px;
  border: 1px solid var(--border);
  background: var(--sidebar);
  padding: 12px 12px 10px;
}

.weatherTop{
  display:grid;
  grid-template-columns: 54px 1fr auto;
  gap: 10px;
  align-items:center;
}

.weatherIcon{
  width: 54px;
  height: 54px;
  border-radius: 14px;
  border: 1px solid var(--border);
  background: var(--card);
  display:flex;
  align-items:center;
  justify-content:center;
  overflow:hidden;
}

.weatherIcon img{
  width: 54px;
  height: 54px;
}

.fallbackIcon{
  font-weight: 900;
  color: var(--accent);
  opacity: .6;
  font-size: 22px;
}

.weatherMain{
  display:flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.tempLine{
  display:flex;
  align-items: baseline;
  gap: 6px;
  color: var(--accent);
  font-weight: 900;
}

.tempNow{
  font-size: 26px;
  line-height: 1;
}

.tempUnit{
  font-size: 14px;
  opacity: .7;
}

.minmaxLine{
  display:flex;
  gap: 4px;
  align-items:center;
  font-size: 12px;
  color: var(--accent);
  opacity: .8;
}

.sep{
  opacity: .6;
  padding: 0 2px;
}

.desc{
  font-size: 12px;
  color: var(--accent);
  opacity: .85;
  white-space: nowrap;
  overflow:hidden;
  text-overflow: ellipsis;
}

.city{
  font-weight: 900;
  color: var(--accent);
  opacity: .9;
  font-size: 14px;
  align-self: end;
}

.hint{
  margin-top: 8px;
  font-size: 12px;
  color: var(--accent);
  opacity: .7;
}

.hint.error{
  color: #a24b4b;
  opacity: .95;
}

/* Rest dein Style unverändert */
.block{
  margin-top: 16px;
}

.labelBig{
  font-weight: 750;
  font-size: 18px;
  color: var(--accent);
  margin-bottom: 8px;
  margin-top: 40px;
}

.radioRow{
  display:flex;
  gap:90px;
  align-items:center;
}

.radio{
  display:flex;
  gap:10px;
  align-items:center;
  font-weight: 600;
  font-size: 16px;
  color: var(--text);
}

.text{
  width: 100%;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--sidebar);
  color: var(--text);
  font-size: 16px;
  outline: none;
}

.area{
  width: 100%;
  min-height: 120px;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--sidebar);
  color: var(--text);
  font-size: 16px;
  outline: none;
  resize: vertical;
}

.moodRow{
  display:flex;
  gap:200px;
  align-items:center;
}

.moodBtn{
  width: 46px;
  height: 46px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--sidebar);
  cursor: pointer;
  display:flex;
  align-items:center;
  justify-content:center;
  transition: transform .06s, border-color .15s;
}

.moodBtn:hover{
  border-color: var(--accent);
  transform: translateY(-1px);
}

.moodBtn.active{
  border-color: var(--accent);
  box-shadow: 0 0 0 3px color-mix(in oklab, var(--accent) 20%, transparent);
}

.emoji{
  font-size: 22px;
}

.chipRow{
  display:flex;
  flex-wrap: wrap;
  gap:150px;
  margin-top: 20px;
}

.chip{
  padding: 12px 30px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--sidebar);
  color: var(--text);
  cursor:pointer;
  font-weight: 600;
  font-size: 16px;
}

.chip.active{
  background: var(--accent);
  border-color: var(--accent);
  color: var(--bg);
}

.actions{
  margin-top: 18px;
  display:flex;
  gap: 12px;
}

.btn{
  padding: 15px 30px;
  border-radius: 20px;
  border: 1px solid var(--border);
  background: var(--sidebar);
  color: var(--text);
  cursor:pointer;
  font-weight: 800;
  font-size:16px;
}

.btn:hover{
  border-color: var(--accent);
}

.btn.ghost{
  background: transparent;
}

.btn.danger{
  opacity: .9;
}

.btn:disabled{
  opacity: .5;
  cursor: not-allowed;
}

.range{
  width: 100%;
  -webkit-appearance: none;
  appearance: none;
  height: 14px;
  border-radius: 999px;
  background: color-mix(in oklab, var(--accent) 18%, var(--sidebar));
  border: 1px solid var(--border);
  outline: none;
}

.range::-webkit-slider-runnable-track{
  height: 14px;
  border-radius: 999px;
  background: color-mix(in oklab, var(--accent) 18%, var(--sidebar));
}

.range::-webkit-slider-thumb{
  -webkit-appearance: none;
  appearance: none;
  width: 28px;
  height: 28px;
  border-radius: 999px;
  border: 2px solid var(--accent);
  background: var(--card);
  cursor: pointer;
  margin-top: -7px;
}

.range::-moz-range-track{
  height: 14px;
  border-radius: 999px;
  background: color-mix(in oklab, var(--accent) 18%, var(--sidebar));
  border: 1px solid var(--border);
}
.range::-moz-range-thumb{
  width: 28px;
  height: 28px;
  border-radius: 999px;
  border: 2px solid var(--accent);
  background: var(--card);
  cursor: pointer;
}

/* Herz statt Punkt */
.heartThumb::-webkit-slider-thumb{
  background: var(--card);
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path fill='%23d06a88' d='M12 21s-7.2-4.6-9.6-8.7C.6 9 .9 6.2 3 4.5 4.9 3 7.6 3.3 9.3 5c.6.6 1.1 1.3 1.4 2 .3-.7.8-1.4 1.4-2 1.7-1.7 4.4-2 6.3-.5 2.1 1.7 2.4 4.5.6 7.8C19.2 16.4 12 21 12 21z'/></svg>");
  background-repeat: no-repeat;
  background-position: center;
  background-size: 16px 16px;
}

.heartThumb::-moz-range-thumb{
  background: var(--card);
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path fill='%23d06a88' d='M12 21s-7.2-4.6-9.6-8.7C.6 9 .9 6.2 3 4.5 4.9 3 7.6 3.3 9.3 5c.6.6 1.1 1.3 1.4 2 .3-.7.8-1.4 1.4-2 1.7-1.7 4.4-2 6.3-.5 2.1 1.7 2.4 4.5.6 7.8C19.2 16.4 12 21 12 21z'/></svg>");
  background-repeat: no-repeat;
  background-position: center;
  background-size: 16px 16px;
}

.rangeLabels{
  margin-top: 8px;
  display:grid;
  font-size: 12px;
  opacity: .8;
}

.rangeLabels.three{
  grid-template-columns: repeat(3, 1fr);
}

.rangeLabels.four{
  grid-template-columns: repeat(4, 1fr);
}

.rangeLabels span{
  text-align: center;
}
</style>
