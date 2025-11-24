<script setup lang="ts">
import { useRouter } from 'vue-router'
import { onMounted, ref, type Ref} from 'vue'
import axios from 'axios'

defineProps<{ title: string }>()

type PeriodEntry = {
  date: string;
  symptom: string;
  note: string
}

const router = useRouter()
const periodEntry: Ref<PeriodEntry[]> = ref([])

// Backend aufrufen
function requestEntries() {
  axios
    .get<PeriodEntry[]>('https://periodentracker.onrender.com/api/v1/entries')
    .then((response) => (periodEntry.value = response.data))
    .catch((error) => console.log(error))
}

// hier werden alle Monate in Kalenderform angezeigt
const monate = [
  'Januar','Februar','März','April','Mai','Juni',
  'Juli','August','September','Oktober','November','Dezember'
]
const jahr = new Date().getFullYear()

function openMonat(index: number) {
  router.push({ name: 'kalender', query: { year: jahr, month: index } })
}

onMounted(() => requestEntries())
</script>

<template>
  <main class="page">
    <h2 class="page-title">Startseite</h2>
    <div class="months-grid">
      <button v-for="(m,i) in monate" :key="m" class="knopf-monat" @click="openMonat(i)">
        <div class="m-name">{{ m }}</div>
        <div class="m-year">{{ jahr }}</div>
      </button>
    </div>
  </main>
</template>

<style scoped>
.page { max-width:1100px; margin:0 auto; padding:0 1rem 3rem; }
.page-title { margin:0 0 .75rem 0; font-weight:900; color:#426e55; }

.months-grid {
  display:grid;
  grid-template-columns:repeat(4,minmax(180px,1fr));
  gap:1rem;
}

@media (max-width:900px){
  .months-grid{
    grid-template-columns:repeat(2,minmax(160px,1fr))
  }
}

@media (max-width:520px){
  .months-grid{
    grid-template-columns:1fr
  }
}

.knopf-monat{
  border:1px solid var(--color-border);
  background: #f9ddd8;
  border-color: #f3baba;
  border-radius:12px;
  padding:1rem;
  text-align:left;
  cursor:pointer;
  transition:transform .06s, background .2s, border-color .2s;
}

.knopf-monat:hover{
  transform:translateY(-1px);
  background: #f3baba;
  border-color:#cb748e;
}

.m-name{
  font-weight:700;
  color: #cb748e;
}

.m-year{
  opacity:.75;
  font-weight: 300;
  color: #d698ab;
}
</style>
