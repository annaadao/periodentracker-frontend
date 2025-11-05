<script setup lang="ts">
defineProps<{
  msg: string
}>()
</script>

<template>
  <div class="greetings">
    <h1 class="green">{{ msg }}</h1>
    <h3>
      Dein Zyklus im Überblick!
      <a href="https://vite.dev/" target="_blank" rel="noopener">Vite</a> +
      <a href="https://vuejs.org/" target="_blank" rel="noopener">Vue 3</a>. Hallooooo
    </h3>
  </div>
</template>

<style scoped>
h1 {
  font-weight: 250;
  font-size: 4.0rem;
  position: relative;
  top: -10px;
}

h3 {
  font-size: 1.4rem;
}

.greetings h1,
.greetings h3 {
  text-align: left;
}

@media (min-width: 1024px) {
  .greetings h1,
  .greetings h3 {
    text-align: left;
  }
}
</style>
