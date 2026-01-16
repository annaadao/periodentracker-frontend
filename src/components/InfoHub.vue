<!-- src/components/InfoHub.vue -->
<script setup lang="ts">
import { useRouter } from "vue-router"
import { INFO_CATEGORIES } from "@/data/ytVideos"

const router = useRouter()

function openCategory(key: string) {
  router.push({ name: "info-kategorie", params: { category: key } })
}
</script>

<template>
  <div class="page">
    <div class="topline">
      <span class="back" @click="router.push('/home')">&lt; Zurück zur Startseite</span>
    </div>

    <h2 class="title">♡ Infos</h2>

    <div class="grid">
      <button
        v-for="c in INFO_CATEGORIES"
        :key="c.key"
        class="catBtn"
        type="button"
        @click="openCategory(c.key)"
      >
        {{ c.label }}
      </button>
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

.title{
  margin:0;
  font-size:40px;
  font-weight:900;
  color:var(--accent);
}

.grid{
  align-self: center;
  justify-self: center;
  display:grid;
  grid-template-columns: repeat(2, minmax(260px, 360px));
  gap: 40px 80px;
  margin-top: 50px;
}

.catBtn{
  padding: 18px 22px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--sidebar);
  color: var(--text);
  cursor:pointer;
  font-weight: 700;
  font-size: 16px;
}
.catBtn:hover{
  border-color: var(--accent);
}
</style>

