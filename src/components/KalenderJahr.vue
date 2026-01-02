<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const year = computed(() => Number(route.query.year) || new Date().getFullYear())

const months = [
  'Januar','Februar','März','April','Mai','Juni',
  'Juli','August','September','Oktober','November','Dezember'
]

function setYear(y:number){
  router.replace({ name:'kalender-jahr', query:{ year: y } })
}

function prevYear(){ setYear(year.value - 1) }
function nextYear(){ setYear(year.value + 1) }

// Von Monat zur Tagesansicht
function openMonth(index:number){
  router.push({ path: '/kalender/monat', query: { year: year.value, month: index } })
}
</script>

<template>
  <div class="page">
    <div class="topline">
      <span class="back" @click="router.push('/home')">&lt; Zurück zur Startseite</span>
    </div>

    <div class="head">
      <button class="arrow" @click="prevYear">‹</button>
      <div class="year">{{ year }}</div>
      <button class="arrow" @click="nextYear">›</button>
    </div>

    <h2 class="title">♡ Dein Kalender</h2>

    <div class="grid">
      <button v-for="(m,i) in months" :key="m" class="month" @click="openMonth(i)">
        <div class="m-name">{{ m }}</div>
      </button>
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
.head{ display:flex; align-items:center; gap:16px; }
.year{ font-size:42px; font-weight:900; color:var(--accent); min-width:140px; text-align:center; }
.arrow{
  width:44px; height:44px; border-radius:14px;
  border:1px solid var(--border); background:var(--card);
  cursor:pointer; font-size:22px;
}
.arrow:hover{ border-color:var(--accent); }
.title{ margin:0; font-weight:900; color:var(--accent); }

.grid{
  display:grid;
  grid-template-columns: repeat(4, minmax(120px, 1fr));
  gap:16px;
}
@media (max-width: 900px){ .grid{ grid-template-columns:repeat(3,1fr);} }
@media (max-width: 650px){ .grid{ grid-template-columns:repeat(2,1fr);} }

.month{
  padding:18px;
  border-radius:16px;
  border:1px solid var(--border);
  background:var(--sidebar);
  cursor:pointer;
  text-align:left;
}
.month:hover{ border-color:var(--accent); }
.m-name{ font-weight:800; color:var(--accent); }
</style>
