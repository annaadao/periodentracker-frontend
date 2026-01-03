<script setup lang="ts">
import { useRouter } from 'vue-router'
import AppLogo from '@/components/Logo.vue'

const router = useRouter()
</script>

<template>
  <section class="start">
    <AppLogo class="logo" />
    <h1 class="title">PeriodenTracker</h1>
    <p class="sub">♡ Tracke Deinen Zyklus – Tag für Tag ♡</p>
    <button class="zumKalender" @click="router.push('/kalender')">Zum Kalender</button>
  </section>
</template>

<style scoped>
.start{
  min-height: 60vh;
  display:grid;
  place-items:center;
  text-align:center;
  gap:4px;
  margin-bottom: 30px;
}

.logo{
  transform: scale(3.5);
  transform-origin: center;
  margin-bottom: 100px;
  margin-top: 200px;
}

.title{
  font-size: 75px;
  color:var(--accent);
  font-weight:700;
  line-height: 0;
  margin-top: 80px;
}

.sub{
  margin-top: 30px;
  margin-bottom: 150px;
  font-size: 30px;
  opacity:.85;
  line-height: 0;
}

.zumKalender{
  margin-top: 20px;
  padding: 20px 80px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--sidebar);
  color: var(--text);
  cursor: pointer;
  font-weight: 700;
  font-size: 20px;
  letter-spacing: .2px;
}
.zumKalender:hover{
  border-color:var(--accent);
}
</style>
