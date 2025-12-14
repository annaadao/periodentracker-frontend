<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Kalendar from '@/components/Kalendar.vue'

const route = useRoute()
const router = useRouter()

// ?year=2025&month=0  (Monat 0..11)
const year   = computed(() => Number(route.query.year) || new Date().getFullYear())
const month0 = computed(() => {
  const m = Number(route.query.month)
  return Number.isFinite(m) ? Math.max(0, Math.min(11, m)) : new Date().getMonth()
})

function handleSelect({ day, year, month }: { day:number; year:number; month:number }) {
  const m = String(month + 1).padStart(2,'0')
  const d = String(day).padStart(2,'0')
  router.push({ name: 'eintrag', params: { date: `${year}-${m}-${d}` } })
}
</script>


<template>
  <main class="page">
    <h2 class="page-title">Kalender</h2>
    <div class="calendar-area">
      <Kalendar :year="year" :month="month0" @select="handleSelect" />
    </div>
  </main>
</template>

<style scoped>
.page {
  max-width: 1100px;     /* Breite */
  margin: 0 auto;        /* zentrierte Lage */
  padding: 0 1rem 3rem;  /* Seitenabstand */
}

.page-title {
  margin: 0 0 .75rem 0;
  font-weight: 900;
  color: #426e55;
}

.calendar-area {
  display: grid;
  place-items: center;
}
</style>
