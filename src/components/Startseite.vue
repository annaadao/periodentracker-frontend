<script setup lang="ts">
import { useRouter } from 'vue-router'
import Kalendar from '@/components/Kalendar.vue'

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
  <main>
    <h2>Kalendar</h2>
    <Kalendar @select = "handleSelect" />
  </main>
</template>

<style scoped>
main { padding: 1rem; }
</style>
