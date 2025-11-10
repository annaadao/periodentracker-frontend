<script setup lang="ts">
import { computed, toRefs } from 'vue'

type Props = {
  year?: number
  month?: number // 0-11
  periodDates?: Set<string> // ISO YYYY-MM-DD der zu markierenden Tage
}
const props = defineProps<Props>()
const { year, month } = toRefs(props)

const base = computed(() => {
  const now = new Date()
  return {
    y: year?.value ?? now.getFullYear(),
    m: month?.value ?? now.getMonth()
  }
})

const daysInMonth = computed(() => new Date(base.value.y, base.value.m + 1, 0).getDate())
const firstDay = computed(() => new Date(base.value.y, base.value.m, 1).getDay()) // 0=So
const offset = computed(() => (firstDay.value + 6) % 7)

const cells = computed(() => {
  const blanks = Array.from({ length: offset.value }, () => null as number | null)
  const days = Array.from({ length: daysInMonth.value }, (_, i) => i + 1)
  return [...blanks, ...days]
})

const emit = defineEmits<{
  (e: 'select', payload: { day: number, year: number, month: number }): void
}>()

function selectDay(d: number | null) {
  if (d === null) return
  emit('select', { day: d, year: base.value.y, month: base.value.m })
}

const monthLabel = computed(() =>
  new Date(base.value.y, base.value.m, 1).toLocaleString('de-DE', { month: 'long', year: 'numeric' })
)
const weekdays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

function toISO(y: number, m0: number, d: number) {
  const mm = String(m0 + 1).padStart(2, '0')
  const dd = String(d).padStart(2, '0')
  return `${y}-${mm}-${dd}`
}

function isPeriod(d?: number | null) {
  if (!d) return false
  return props.periodDates?.has(toISO(base.value.y, base.value.m, d)) ?? false
}
</script>

<template>
  <div class="kalendar">
    <div class="toolbar">
      <h3>{{ monthLabel }}</h3>
      <!-- Nächster Monat Button einbauen später -->
    </div>

    <div class="grid header">
      <div v-for="w in weekdays" :key="w" class="wk">{{ w }}</div>
    </div>

    <div class="grid">
      <button
        v-for="(cell, i) in cells"
        :key="i"
        class="cell"
        :class="{ blank: cell === null, 'has-period': isPeriod(cell as number) }"
        type="button"
        @click="selectDay(cell)"
        :disabled="cell === null"
      >
        <span v-if="cell">{{ cell }}</span>
        <span v-if="isPeriod(cell as number)" class="dot" aria-label="Periode am Tag"></span>
      </button>
    </div>
  </div>
</template>

<style scoped>

.kalendar {
  padding: .75rem;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  width: fit-content;
  background-color: #f9ddd8;
}

.toolbar {
  color: #cb748e;
  display:flex;
  justify-content:space-between;
  align-items:center;
  margin-bottom: .5rem;
}

.grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: .5rem;
}

.header {
  margin-bottom: .25rem;
}

.wk {
  color: #d698ab;
  opacity: 1;
  font-weight: 500;
  text-align:center;
  font-weight:600;
  opacity:.8;
}

/* wochentage */
.cell {
  position: relative;
  aspect-ratio: 1/1;
  background: #d698ab;
  color: #f9ddd8;
  border: 1px solid #cb748e;
  border-radius: .5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font: inherit;
}

.cell:hover { outline: 2px solid #e6a3bb; }

.cell.blank {
  background: transparent;
  border-color: transparent;
  cursor: default;
}

/* Markierung für Tage mit Periode */
.cell.has-period {
  background: #b3005a;    /* dunkleres Magenta */
  border-color: #7a003c;
}

.dot {
  position: absolute;
  bottom: .25rem;
  right: .25rem;
  width: .5rem;
  height: .5rem;
  border-radius: 999px;
  background: #fff;       /* auf dunklem Magenta sichtbar */
}

.toolbar h3 {
  font-weight: 700;
}

</style>

