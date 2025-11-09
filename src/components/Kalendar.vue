<script setup lang="ts">
import { computed, toRefs } from 'vue'

type Props = {
  year?: number
  month?: number // 0-11 (JS-Standard). 0=Jan, 9=Okt
}
const props = defineProps<Props>()
const { year, month } = toRefs(props)

// Fallback: aktueller Monat
const base = computed(() => {
  const now = new Date()
  return {
    y: year?.value ?? now.getFullYear(),
    m: month?.value ?? now.getMonth()
  }
})

// Anzahl Tage
const daysInMonth = computed(() => new Date(base.value.y, base.value.m + 1, 0).getDate())
const firstDay = computed(() => new Date(base.value.y, base.value.m, 1).getDay()) // 0=So, 1=Mo

const offset = computed(() => (firstDay.value + 6) % 7)

// Array mit Platzhalter (und echte Tage)
const cells = computed(() => {
  const blanks = Array.from({ length: offset.value }, () => null as number | null)
  const days = Array.from({ length: daysInMonth.value }, (_, i) => i + 1)
  return [...blanks, ...days]
})

// Auswahl nach oben melden jojo
const emit = defineEmits<{ (e: 'select', payload: { day: number, year: number, month: number }): void }>()
function selectDay(d: number | null) {
  if (d === null) return
  emit('select', { day: d, year: base.value.y, month: base.value.m })
}

// Anzeigenamen
const monthLabel = computed(() =>
  new Date(base.value.y, base.value.m, 1).toLocaleString('de-DE', { month: 'long', year: 'numeric' })
)
const weekdays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
</script>


<template>
  <div class = "kalendar">
    <div class="toolbar">
      <h3>{{ monthLabel }}</h3>
      <!-- später ein Next Button einfügen -->
    </div>

    <div class="grid header">
      <div v-for="w in weekdays" :key="w" class ="wk">{{ w }}</div>
    </div>

    <div class="grid">
      <button
        v-for = "(cell, i) in cells"
        :key = "i"
        class = "cell"
        :class="{ blank: cell === null }"
        type = "button"
        @click = "selectDay(cell)"
        :disabled="cell === null"
      >
        <span v-if="cell">{{ cell }}</span>
      </button>
    </div>
  </div>
</template>


<style scoped>
.kalendar { padding: 0.75rem; border: 1px solid var(--color-border); border-radius: 12px; }
.toolbar { display:flex; justify-content:space-between; align-items:center; margin-bottom: .5rem; }
.grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: .5rem;
}
.header { margin-bottom: .25rem; }
.wk { text-align:center; font-weight:600; opacity:.8; }
.cell {
  aspect-ratio: 1 / 1;
  border: 1px solid var(--color-border);
  border-radius: .5rem;
  background: var(--color-background);
  cursor: pointer;
  display:flex; align-items:center; justify-content:center;
  font: inherit;
}
.cell:hover { outline: 2px solid pink; }
.cell.blank { background: transparent; border-color: transparent; cursor: default; }
</style>
