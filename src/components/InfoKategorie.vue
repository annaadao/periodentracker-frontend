<script setup lang="ts">
import { computed } from "vue"
import { useRoute, useRouter } from "vue-router"
import { INFO_CATEGORIES, CATEGORY_LABEL, youtubeThumb, type CategoryKey } from "@/data/ytVideos"

const route = useRoute()
const router = useRouter()

const category = computed(() => route.params.category as CategoryKey)
const current = computed(() => INFO_CATEGORIES.find(c => c.key === category.value))

const headline = computed(() => CATEGORY_LABEL[category.value] ?? "Kategorie")

function backToHub() {
  router.push({ name: "info-hub" })
}

function openWatch(videoId: string) {
  router.push({ name: "info-watch", params: { id: videoId } })
}
</script>

<template>
  <div class="page">
    <div class="topline">
      <span class="back" @click="router.push('/home')">&lt; Zurück zur Startseite</span>
      <span class="back" @click="backToHub">&lt; Zurück zu Infos</span>
    </div>

    <h2 class="title">♡ {{ headline }}</h2>

    <div v-if="!current" class="empty">Kategorie nicht gefunden.</div>

    <div v-else class="grid">
      <button
        v-for="v in current.videos"
        :key="v.id"
        class="card"
        type="button"
        @click="openWatch(v.id)"
      >
        <img
          class="thumb"
          :src="youtubeThumb(v.url)"
          :alt="v.title"
          loading="lazy"
        />
        <div class="caption">{{ v.title }}</div>
      </button>
    </div>
  </div>
</template>

<style scoped>
.page{ display:grid; gap:18px; grid-template-rows:auto auto 1fr; min-height:80vh; }
.topline{ display:flex; flex-direction:column; gap:6px; align-items:flex-start; }
.back{ font-size:18px; opacity:.75; cursor:pointer; }
.back:hover{ opacity:1; color:var(--accent); }
.title{ margin:0; font-size:34px; font-weight:900; color:var(--accent); }
.empty{ opacity:.8; font-size:18px; }
.grid{ display:grid; grid-template-columns:repeat(3, minmax(260px,1fr)); gap:28px; align-items:start; margin-top:10px; }
.card{ border:1px solid var(--border); background:var(--card); border-radius:16px; padding:12px; cursor:pointer; text-align:left; }
.card:hover{ border-color:var(--accent); }
.thumb{ width:100%; border-radius:12px; display:block; }
.caption{ margin-top:10px; font-size:14px; color:var(--text); font-weight:600; line-height:1.25; }
</style>


