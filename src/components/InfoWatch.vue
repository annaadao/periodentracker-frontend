<script setup lang="ts">
import { computed } from "vue"
import { useRoute, useRouter } from "vue-router"
import { INFO_CATEGORIES, youtubeEmbed } from "@/data/ytVideos"

const route = useRoute()
const router = useRouter()

const videoId = computed(() => route.params.id as string)

const video = computed(() => {
  for (const c of INFO_CATEGORIES) {
    const hit = c.videos.find(v => v.id === videoId.value)
    if (hit) return hit
  }
  return null
})

const embedUrl = computed(() => (video.value ? youtubeEmbed(video.value.url) : ""))

function goBack() {
  router.back()
}

function openOnYouTube() {
  if (video.value?.url) window.open(video.value.url, "_blank", "noopener,noreferrer")
}
</script>

<template>
  <div class="page">
    <div class="topline">
      <span class="back" @click="goBack">&lt; Zurück</span>
    </div>

    <h2 class="title">♡ {{ video?.title ?? "Video" }}</h2>

    <div v-if="!video" class="empty">Video nicht gefunden.</div>

    <div v-else class="playerWrap">
      <iframe
        class="player"
        :src="embedUrl"
        title="YouTube video player"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen
      />
      <div class="actions">
        <button class="btn" type="button" @click="openOnYouTube">Auf YouTube öffnen</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page{ display:grid; gap:18px; grid-template-rows:auto auto 1fr; min-height:80vh; }
.topline{ display:flex; justify-content:space-between; align-items:center; }
.back{ font-size:18px; opacity:.75; cursor:pointer; }
.back:hover{ opacity:1; color:var(--accent); }
.title{ margin:0; font-size:28px; font-weight:900; color:var(--accent); }
.empty{ opacity:.8; font-size:18px; }
.playerWrap{ border:1px solid var(--border); background:var(--card); border-radius:18px; padding:16px; width:min(1100px,100%); }
.player{ width:100%; aspect-ratio:16/9; border-radius:14px; }
.actions{ margin-top:12px; display:flex; justify-content:flex-end; }
.btn{
  padding: 12px 18px;
  border-radius: 14px;
  border: 1px solid var(--border);
  background: var(--sidebar);
  color: var(--text);
  cursor: pointer;
  font-weight: 700;
}
.btn:hover{ border-color: var(--accent); }
</style>
