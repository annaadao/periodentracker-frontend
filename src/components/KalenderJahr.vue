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

// Von Monat zur Monatsansicht
function openMonth(index:number){
  router.push({ name: 'kalender-monat', query: { year: year.value, month: index } })
}
</script>

<template>
  <div class="page">
    <div class="topline">
      <span class="back" @click="router.push('/home')">
        &lt; Zurück zur Startseite
      </span>
    </div>

    <h2 class="deinKalender">♡ Dein Kalender</h2>

    <div class="contentGrid">
      <!-- links: Jahr -->
      <div class="left">
        <div class="yearNav">
          <button class="arrow" @click="prevYear">‹</button>
          <div class="yearBig">{{ year }}</div>
          <button class="arrow" @click="nextYear">›</button>
        </div>
      </div>

      <!-- rechts: Monats-Grid -->
      <div class="right">
        <div class="grid">
          <button
            v-for="(m,i) in months"
            :key="m"
            class="month"
            @click="openMonth(i)"
          >
            <div class="m-name">{{ m }}</div>
          </button>
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
}

.topline{
  display:flex;
  justify-content:space-between;
  align-items:center;
}

.back{
  font-size:12px;
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
  align-self: center;
  justify-self: center;
  display:grid;
  grid-template-columns: auto auto;
  gap:110px;
  align-items:center;
}

/* links: Jahr */
.yearNav{
  display:grid;
  grid-template-columns: 56px 1fr 56px;
  align-items:center;
  gap:18px;
}

.yearBig{
  font-size:100px;
  font-weight:700;
  color:var(--accent);
  line-height:1;
  text-align:center;
  min-width: 160px;
  margin-top: 250px;
  margin-right: 20px;
  margin-left: 20px;
}

.arrow{
  width:60px;
  height:70px;
  border-radius:16px;
  border:1px solid var(--border);
  background:var(--card);
  cursor:pointer;
  font-size:50px;
  margin-top: 270px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.arrow:hover{
  border-color:var(--accent);
}

/* rechts: Monatsgrid */
.right{
  padding-left: 40px;
}

.grid{
  display:grid;
  grid-template-columns: repeat(4, minmax(180px, 1fr));
  gap:25px;
  margin-top: 270px;
  margin-left: 10px;
}

.month{
  padding:18px;
  border-radius:16px;
  border:1px solid var(--border);
  background:var(--sidebar);
  cursor:pointer;
  text-align:left;
}
.month:hover{
  border-color:var(--accent);
}

.m-name{
  font-weight:500;
  font-size: 16px;
  color:var(--accent);
}

@media (max-width: 900px){
  .contentGrid{ grid-template-columns: 1fr; gap: 24px; }
  .right{ padding-left: 0; }
  .grid{ grid-template-columns: repeat(3, 1fr); }
  .yearBig{ text-align:center; }
}

@media (max-width: 650px){
  .grid{ grid-template-columns: repeat(2, 1fr); }
}
</style>
