<script setup lang="ts">
import { useRouter } from 'vue-router'
import Kalender from '@/components/Kalendar.vue'

const router = useRouter()

// gewählte Tagesinfo
function handleSelect(payload: { day: number, year: number, month: number }) {
  // Datum einbauen
  const m = String(payload.month + 1).padStart(2, '0')
  const d = String(payload.day).padStart(2, '0')
  const iso = `${payload.year}-${m}-${d}`
  router.push({ name: 'eintrag', params: { date: iso } })
}
</script>

<template>
  <main class="page">
    <h2 class="page-title">Kalender</h2>
    <div class="calendar-area">
      <Kalender @select = "handleSelect" />
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
