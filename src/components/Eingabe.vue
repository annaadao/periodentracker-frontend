<script setup lang="ts">
import { useRoute } from 'vue-router'
import { ref } from 'vue'

const route = useRoute()
const dateParam = route.params.date as string // YYYY-MM-DD

const periode = ref(false)
const symptom = ref('')
const emotion = ref('')
const note = ref('')

function save() {
  //hier für M3: fetch ans Backend
  console.log('speichern', { date: dateParam, periode: periode.value, symptom: symptom.value, emotion: emotion.value, note: note.value })
  alert(`Eintrag gespeichert für ${dateParam} (Demo)`)
}
</script>


<template>
  <main class="page">
    <h2>Eintrag für {{ dateParam }}</h2>

    <form @submit.prevent="save" class="card">
      <label class ="row">
        <span>Hast du deine Periode an diesem Tag? :(</span>
        <input type="checkbox" v-model="periode" />
      </label>

      <label class="row">
        <span>Symptome</span>
        <input v-model="symptom" placeholder="zB stare Unterleibschmerzen" />
      </label>

      <label class="row">
        <span>Notizen</span>
        <textarea v-model="note" rows="3" placeholder="weitere Details..."></textarea>
      </label>
    </form>

  </main>
</template>


<style scoped>
  .page { padding: 1rem; }
  .card { display:grid; gap:.75rem; border:1px solid var(--color-border); border-radius:12px; padding:1rem; }
  .row { display:grid; gap:.5rem; }
  input, textarea, button { font: inherit; padding: .5rem; }
  button { cursor: pointer; }
</style>
