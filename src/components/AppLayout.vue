<script setup lang="ts">
import { computed } from "vue"
import { useRouter, useRoute } from "vue-router"
import Sidebar from "@/components/Sidebar.vue"
import AppLogo from "@/components/Logo.vue"

const router = useRouter()
const route = useRoute()

const isHome = computed(() => route.name === "home")

function goHome() {
  router.push("/home")
}
</script>

<template>
  <div class="layout">
    <Sidebar />

    <main class="content">
      <!-- Logo steht rechts oben -->
      <button
        v-if="!isHome"
        class="logo-btn"
        type="button"
        @click="goHome"
        aria-label="Zur Startseite"
        title="Zur Startseite"
      >
        <AppLogo />
      </button>

      <div class="stage">
        <slot />
      </div>
    </main>
  </div>
</template>

<style scoped>
.layout{ display:flex; min-height:100vh; }

.content{
  flex:1;
  display:grid;
  place-items:center;
  padding:40px 20px;
  position: relative;
}

.logo-btn{
  position: absolute;
  top: 22px;
  right: 28px;        /* rechts oben */
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;
}

.logo-btn:hover{ opacity: .9; }

.stage{
  width:100%;
  max-width:1100px;
}
</style>
