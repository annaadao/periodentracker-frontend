<script setup lang="ts">
import { useRouter } from 'vue-router'
import { onMounted, ref, type Ref} from 'vue'
import axios from 'axios'
import AppLogo from '@/components/Logo.vue'

const router = useRouter()

type PeriodEntry = {
  id: number;
  date: string; // in dd-mm-yyyy wegen backend
  symptom: string;
  note: string;
}

const periodEntry: Ref<PeriodEntry[]> = ref([])

// Backend aufrufen M3: Einträge aus Backend laden und anzeigen
function requestEntries() {
  axios
    .get<PeriodEntry[]>('https://periodentracker.onrender.com/api/v1/entries')
    .then((response) => (periodEntry.value = response.data))
    .catch((error) => console.log(error))
}

function deToIso(de: string) {
  const [dd, mm, yyyy] = de.split('-')
  return `${yyyy}-${mm}-${dd}`
}

function openEntry(entry: PeriodEntry) {
  router.push({ name: 'eintrag', params: { date: deToIso(entry.date) } })
}

onMounted(() => requestEntries())
</script>

<template>
  <section class="hero">
    <AppLogo />
    <h1 class="title">PeriodenTracker</h1>
    <p class="sub">♡ Tracke Deinen Zyklus – Tag für Tag ♡</p>
    <button @click="router.push('/kalender')">Zum Kalender</button>
  </section>

  <!-- M3: Einträge sichtbar aus Backend -->
  <section class="entries-box">
    <h3 class="entries-title">Deine Einträge (aus DB)</h3>

    <p v-if="!periodEntry.length" class="muted">
      Keine Einträge da – füge welche hinzu! ^^
    </p>

    <ul v-else class="entries-list">
      <li
        v-for="e in periodEntry"
        :key="e.id"
        class="entry-item"
        @click="openEntry(e)"
      >
        <div class="entry-date">{{ e.date }}</div>
        <div class="entry-symptom">
          Symptome: <strong>{{ e.symptom }}</strong>
        </div>
        <div class="entry-note" v-if="e.note">
          Notizen: {{ e.note }}
        </div>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.hero{
  min-height: 60vh;
  display:grid;
  place-items:center;
  text-align:center;
  gap:10px;
  margin-bottom: 30px;
}

.title{ margin:0; color:var(--accent); font-weight:900; }
.sub{ margin:0; opacity:.85; }

.cta{
  margin-top:10px;
  padding:10px 22px;
  border-radius:999px;
  border:1px solid var(--border);
  background: var(--sidebar);
  color: var(--text);
  cursor:pointer;
}
.cta:hover{ border-color:var(--accent); }

/* M3 Box Styling (passt zum neuen Look) */
.entries-box{
  padding: 16px;
  border: 1px solid var(--border);
  border-radius: 16px;
  background: var(--card);
}

.entries-title{
  margin: 0 0 12px 0;
  font-weight: 900;
  color: var(--accent);
}

.muted{ opacity: .75; }

.entries-list{
  list-style:none;
  padding:0;
  margin:0;
  display:grid;
  gap:10px;
}

.entry-item{
  padding: 12px 14px;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--sidebar);
  cursor:pointer;
}
.entry-item:hover{ border-color: var(--accent); }

.entry-date{
  font-size: 12px;
  font-weight: 900;
  color: var(--accent);
  margin-bottom: 4px;
}

.entry-symptom, .entry-note{
  font-size: 13px;
}
.entry-note{ opacity: .85; }
</style>
