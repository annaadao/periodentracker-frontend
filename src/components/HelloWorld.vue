<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  msg: string
}>()
</script>

<template>
  <div class="greetings">
    <h1 class="dunkelmagenta">{{ msg }}</h1>
    <h3>
      Dein Zyklus im Überblick!
      <!--a href="https://vite.dev/" target="_blank" rel="noopener">Vite</a-->
      <!--a href="https://vuejs.org/" target="_blank" rel="noopener">Vue 3</a-->
    </h3>
  </div>
</template>

<style scoped>
h1 {
  font-weight: 250;
  font-size: 4.0rem;
  position: relative;
  top: -10px;
  color: #9c225d;
}

h3 {
  font-size: 1.4rem;
}

.greetings h1,
.greetings h3 {
  text-align: left;
}

/* Umrahmung bei Symptoms
 */
.card {
  margin-top: 1rem;
  padding: 1rem;
  border: 1px solid var(--color-border);
  border-radius: 10px;
}

@media (min-width: 1024px) {
  .greetings h1,
  .greetings h3 {
    text-align: left;
  }
}
</style>
