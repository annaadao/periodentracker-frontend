<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Kalendar from '@/components/Kalendar.vue'
import { periodDatesForMonth } from '@/speichern/periodeSpeichern'

const route = useRoute()
const router = useRouter()

const year = computed(() => Number(route.query.year) || new Date().getFullYear())
const month0 = computed(() => {
  const m = Number(route.query.month)
  return Number.isFinite(m) ? Math.max(0, Math.min(11, m)) : new Date().getMonth()
})

const periodDates = computed(() => periodDatesForMonth(year.value, month0.value))

function setMonth(y:number, m0:number){
  router.replace({ name:'kalender-monat', query:{ year: y, month: m0 } })
}

function prevMonth(){
  const d = new Date(year.value, month0.value, 1)
  d.setMonth(d.getMonth() - 1)
  setMonth(d.getFullYear(), d.getMonth())
}

function nextMonth(){
  const d = new Date(year.value, month0.value, 1)
  d.setMonth(d.getMonth() + 1)
  setMonth(d.getFullYear(), d.getMonth())
}

function handleSelect({ day, year, month }: { day:number; year:number; month:number }) {
  const m = String(month + 1).padStart(2,'0')
  const d = String(day).padStart(2,'0')
  router.push({ name: 'eintrag', params: { date: `${year}-${m}-${d}` } })
}

const monthLabel = computed(() =>
  new Date(year.value, month0.value, 1).toLocaleString('de-DE', { month: 'long' })
)
</script>

<template>
  <div class="page">
    <div class="topline">
      <span class="back" @click="router.push({ name:'kalender-jahr', query:{ year } })">&lt; {{ year }}</span>
      <div class="bubble">♡</div>
    </div>

    <h2 class="title">♡ Dein Kalender</h2>

    <div class="head">
      <button class="arrow" @click="prevMonth">‹</button>
      <div class="m-title">{{ monthLabel }}</div>
      <button class="arrow" @click="nextMonth">›</button>
    </div>

    <div class="calendar-wrap">
      <Kalendar :year="year" :month="month0" :periodDates="periodDates" @select="handleSelect" />
    </div>
  </div>
</template>

<style scoped>
.page{ display:grid; gap:18px; }
.topline{ display:flex; justify-content:space-between; align-items:center; }
.back{ font-size:12px; opacity:.75; cursor:pointer; }
.back:hover{ opacity:1; color:var(--accent); }
.bubble{
  width:34px; height:34px; border-radius:999px;
  border:2px solid var(--accent); display:grid; place-items:center;
}
.title{ margin:0; font-weight:900; color:var(--accent); }

.head{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:16px;
  max-width:520px;
}

.m-title{
  flex:1;
  text-align:center;
  font-size:44px;
  font-weight:900;
  color:var(--accent);
}

.arrow{
  width:44px; height:44px; border-radius:14px;
  border:1px solid var(--border); background:var(--card);
  cursor:pointer; font-size:22px;
}
.arrow:hover{ border-color:var(--accent); }

.calendar-wrap{ display:grid; place-items:center; }
</style>
