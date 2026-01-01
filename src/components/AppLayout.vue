<script setup lang="ts">
import Sidebar from '@/components/Sidebar.vue'
</script>

<template>
  <div class="layout">
    <Sidebar />
    <main class="content">
      <div class="stage">
        <slot />
      </div>
    </main>
  </div>
</template>

<style scoped>
.layout{ display:flex; min-height:100vh; }
.content{ flex:1; display:grid; place-items:center; padding:40px 20px; }
.stage{ width:100%; max-width:1100px; }
</style>
