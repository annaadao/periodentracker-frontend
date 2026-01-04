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
      <span
        class="back"
        @click="router.push({ name:'kalender-jahr', query:{ year } })"
      >
        &lt; {{ year }}
      </span>
    </div>

    <h2 class="deinKalender">♡ Dein Kalender</h2>

    <div class="contentGrid">
      <!-- links: Pfeil links + Monat (OHNE rechten Pfeil) -->
      <div class="left">
        <div class="monthNav">
          <button class="arrow" @click="prevMonth">‹</button>
          <div class="monthBig">{{ monthLabel }}</div>
        </div>
      </div>

      <!-- rechts: Kalender + rechter Pfeil daneben -->
      <div class="right">
        <div class="calendarWrap">
          <Kalendar
            :year="year"
            :month="month0"
            :periodDates="periodDates"
            @select="handleSelect"
          />
          <button class="arrow" @click="nextMonth">›</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page{
  display:grid;
  gap:18px;
  grid-template-rows: auto auto 1fr;
  min-height: 80vh;
}

.topline{
  display:flex;
  justify-content:space-between;
  align-items:center;
}

.back{
  font-size:20px;
  opacity:.75;
  cursor:pointer;
}
.back:hover{
  opacity:1;
  color:var(--accent);
}

.deinKalender{
  margin:0;
  font-size:40px;
  font-weight:900;
  color:var(--accent);
}

.contentGrid{
  --nav-gap: 34px;
  align-self: center;
  justify-self: center;
  display:grid;
  grid-template-columns: auto auto;
  gap:110px;
  align-items:center;
}

.left{
  display:flex;
  justify-content:center;
  align-items:center;
}

.monthNav{
  display:flex;
  align-items:center;
  justify-content:center;
  gap: var(--nav-gap);
}

.monthBig{
  width: clamp(420px, 30vw, 520px);
  text-align:center;
  white-space: nowrap;
  font-size:70px;
  font-weight:700;
  color:var(--accent);
  line-height:1;
}

.arrow{
  width:60px;
  height:70px;
  border-radius:16px;
  border:1px solid var(--border);
  background:var(--card);
  cursor:pointer;
  font-size:50px;
  display:flex;
  align-items:center;
  justify-content:center;
}

.arrow:hover{
  border-color:var(--accent);
}

.right{
  display:flex;
  justify-content:center;
  align-items:center;
}

.calendarWrap{
  display:flex;
  align-items:center;
  justify-content:center;
  gap:24px;
}

@media (max-width: 900px){
  .contentGrid{
    grid-template-columns: 1fr;
    gap: 24px;
  }
  .monthBig{
    width: 100%;
    max-width: 520px;
    font-size: 72px;
  }
  .calendarWrap{
    display:flex;
    align-items:center;
    justify-content:center;
    gap: var(--nav-gap);
  }
}
</style>
