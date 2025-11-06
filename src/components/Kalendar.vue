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
const daysInMonth = computed(() => {
  return new Date(base.value.y, base.value.m + 1, 0).getDate()
  }
)

// Array [1..N] für v-for
const days = computed(() =>
  Array.from({ length: daysInMonth.value }, (_, i) => i + 1)
)

// Auswahl nach oben melden jojo
const emit = defineEmits<{ (e: 'select', payload: { day: number, year: number, month: number }): void }>()
function selectDay(day: number) {
  emit('select', { day, year: base.value.y, month: base.value.m })
}
</script>


<template>
  <div class = "grid">
    <button
      v-for = "d in days"
      :key = "d"
      class = "cell"
      type = "button"
      @click = "selectDay(d)"
      :aria-label = "`Tag ${d}`"
    >
      {{ d }}
    </button>
  </div>
</template>


<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: .5rem;
  padding: .5rem;
}
.cell {
  aspect-ratio: 1 / 1;
  border: 1px solid var(--color-border);
  border-radius: .5rem;
  background: var(--color-background);
  cursor: pointer;
  font: inherit;
}
.cell:hover {
  outline: 2px solid pink;
}
</style>
