<script setup lang="ts">
import { computed, toRefs } from 'vue'

type Props = {
  month?: number // 0-11
  year?: number
  periodDates?: Set<string> // DD-MM-YYYY der zu markierenden Tage
}
const props = defineProps<Props>()
const { month, year } = toRefs(props)

const base = computed(() => {
  const now = new Date()
  return {
    m: month?.value ?? now.getMonth(),
    y: year?.value ?? now.getFullYear()
  }
})

const firstDay = computed(() => new Date(base.value.y, base.value.m, 1).getDay()) // 0=So
const daysInMonth = computed(() => new Date(base.value.y, base.value.m + 1, 0).getDate())
const offset = computed(() => (firstDay.value + 6) % 7)

const cells = computed(() => {
  const blanks = Array.from({ length: offset.value }, () => null as number | null)
  const days = Array.from({ length: daysInMonth.value }, (_, i) => i + 1)
  return [...blanks, ...days]
})

const emit = defineEmits<{
  (e: 'select', payload:
   { day: number, month: number, year: number }
  ): void
}>()

function selectDay(d: number | null) {
  if (d === null) return
  emit('select', { day: d, month: base.value.m, year: base.value.y})
}

const monthLabel = computed(() =>
  new Date(base.value.y, base.value.m, 1).toLocaleString('de-DE', { month: 'long', year: 'numeric' })
)
const weekdays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

function toISO(d: number, m0: number,  y: number) {
  const dd = String(d).padStart(2, '0')
  const mm = String(m0 + 1).padStart(2, '0')
  return `${y}-${mm}-${dd}` // ISO YYYY-MM-DD
}
function isPeriod(d?: number | null) {
  if (!d) return false
  return props.periodDates?.has(toISO(d, base.value.m, base.value.y)) ?? false
}
</script>

<template>
  <div class="kalendar">
    <div class="toolbar"></div>
    <div class="grid header">
      <div v-for="w in weekdays" :key="w" class="wochentage">{{ w }}</div>
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

.kalendar{
  padding: 18px;
  border: 1px solid var(--border);
  border-radius: 18px;
  width: fit-content;
  background: var(--card);
  box-shadow: 0 1px 0 rgba(0,0,0,.02);
}

.toolbar{
  display:flex;
  justify-content:space-between;
  align-items:center;
  margin-bottom: 12px;
  color: var(--accent);
}

.grid{
  display:grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 10px;
}

.header{
  margin-bottom: 10px;
}

.wochentage{
  text-align:center;
  font-weight: 700;
  font-size: 20px;
  color: var(--accent);
  opacity: .55;
  gap: 20px;
}

.cell{
  position: relative;
  width: 50px;
  height: 50px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--sidebar);
  color: var(--accent);
  cursor:pointer;
  display:flex;
  align-items:center;
  justify-content:center;
  font: inherit;
  font-size: 16px;
  gap:25px;
  transition: transform .06s, border-color .15s, background .15s;
}

.cell:hover{
  border-color: var(--accent);
  transform: translateY(-1px);
}

.cell.blank{
  background: transparent;
  border-color: transparent;
  cursor: default;
}

.cell.has-period{
  background: var(--accent);
  border-color: var(--accent);
  color: var(--bg);
}

.dot{
  position:absolute;
  bottom: 5px;
  right: 6px;
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: var(--pink);
}

</style>
