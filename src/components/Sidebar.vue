<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from "vue"
import { useRouter, useRoute } from "vue-router"
import axios from "axios"

const router = useRouter()
const route = useRoute()

const open = ref(false)

type PeriodEntry = {
  id: number
  date: string
  symptom: string
  note: string
}

const entries = ref<PeriodEntry[]>([])
const API = (import.meta as any).env?.VITE_API_BASE_URL || "https://periodentracker.onrender.com/api/v1"

function deToIso(de: string) {
  const [dd, mm, yyyy] = de.split("-")
  return `${yyyy}-${mm}-${dd}`
}

async function loadEntries() {
  try {
    const res = await axios.get<PeriodEntry[]>(`${API}/entries`)

    const map = new Map<string, PeriodEntry>()
    for (const e of res.data) {
      const existing = map.get(e.date)
      if (!existing || e.id > existing.id) map.set(e.date, e)
    }

    entries.value = Array.from(map.values()).sort((a, b) =>
      deToIso(b.date).localeCompare(deToIso(a.date))
    )
  } catch {}
}

function go(path: string) {
  router.push(path)
}

function openEntry(e: PeriodEntry) {
  router.push({ name: "eintrag", params: { date: deToIso(e.date) } })
}

function refreshEntries() {
  loadEntries()
}

onMounted(() => {
  loadEntries()
  window.addEventListener("entries-updated", refreshEntries)
})

onBeforeUnmount(() => {
  window.removeEventListener("entries-updated", refreshEntries)
})

watch(open, (isOpen) => {
  if (isOpen) loadEntries()
})

watch(
  () => route.fullPath,
  () => {
    if (open.value) loadEntries()
  }
)
</script>

<template>
  <aside class="sidebar" :class="{ open }">
    <div class="iconbar">
      <button class="iconbtn" @click="open = !open" title="Menü">☰</button>
      <button class="iconbtn" @click="go('/home')" title="Startseite">⌂</button>
      <button class="iconbtn" @click="go('/kalender')" title="Kalender">▦</button>

      <!-- NEU: Info -->
      <button class="iconbtn" @click="go('/info')" title="Infos">ⓘ</button>

      <div class="spacer"></div>
    </div>

    <div class="panel" v-if="open">
      <h4 class="panel-title">Eintragsübersicht</h4>

      <p v-if="!entries.length" class="muted">Hier ist noch leer. Erstelle deinen ersten Eintrag!</p>

      <ul v-else class="list">
        <li v-for="e in entries" :key="e.id" class="item" @click="openEntry(e)">
          <div class="date">{{ e.date }}</div>

          <div class="block">
            <div class="label">Symptome:</div>
            <div class="value">{{ e.symptom }}</div>
          </div>

          <div class="block">
            <div class="label">Notizen:</div>
            <div class="value">{{ e.note }}</div>
          </div>
        </li>
      </ul>
    </div>
  </aside>
</template>

<style scoped>
.sidebar{
  width: 100px;
  background: var(--sidebar);
  border-right: 1px solid var(--border);
  display: flex;
  overflow: hidden;
}

.sidebar.open{
  width: 450px;
}

.iconbar{
  width: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 25px 0;
  gap: 14px;
}

.iconbtn{
  width: 60px;
  height: 60px;
  border-radius: 14px;
  border: 1px solid var(--border);
  background: var(--card);
  cursor: pointer;
  font-size: 25px;

  display:flex;
  align-items:center;
  justify-content:center;
}

.iconbtn:hover{
  border-color: var(--accent);
}

.spacer{
  flex: 1;
}

.panel{
  flex: 1;
  padding: 18px 16px;
  overflow: auto;
}

.panel-title{
  margin-top: 10px;
  margin-bottom: 80px;
  font-size: 30px;
  font-weight: 700;
  letter-spacing: .2px;
  color: var(--accent);
}

.muted{
  opacity: .7;
  font-size: 20px;
}

.list{
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 10px;
}

.item{
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--card);
  cursor: pointer;
}

.item:hover{
  border-color: var(--accent);
}

.date{
  font-weight: 800;
  color: var(--accent);
  font-size: 20px;
}

.block{
  margin-top: 10px;
}

.label{
  font-weight: 700;
  font-size: 15px;
  color: var(--accent);
}

.value{
  margin-top: 4px;
  font-size: 15px;
  opacity: .9;
  white-space: pre-line;
}
</style>

