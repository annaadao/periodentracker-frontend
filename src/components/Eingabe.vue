<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'
import { saveEntry, loadEntry, deleteEntry, hasEntry, type DayEntry } from '../speichern/periodeSpeichern'


const route = useRoute()
const router = useRouter()
const dateParam = route.params.date as string // YYYY-MM-DD

const periode = ref(false)
const symptom = ref('')
const emotion = ref('')
const note = ref('')
const exists = ref(false)

onMounted(() => {
  const existing = loadEntry(dateParam)
  exists.value = hasEntry(dateParam)
  if (existing) {
    periode.value = !!existing.periode
    symptom.value = existing.symptom ?? ''
    emotion.value = existing.emotion ?? ''
    note.value = existing.note ?? ''
  }
})

function save() {
  const entry: DayEntry = {
    date: dateParam,
    periode: periode.value,
    symptom: symptom.value,
    emotion: emotion.value,
    note: note.value
  }
  saveEntry(entry)
  alert(`Eintrag gespeichert für ${dateParam}`)
}

function remove() {
  if (!confirm('Eintrag wirklich löschen?')) return
  deleteEntry(dateParam)
  periode.value = false
  symptom.value = ''
  emotion.value = ''
  note.value = ''
  exists.value = false
  router.back()
}

function goBack() {
  router.back()
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
        <span>Symptome:</span>
        <input v-model="symptom" placeholder="z.B. starke Unterleibschmerzen" />
      </label>

      <label class="row">
        <span>Deine Notizen:</span>
        <textarea v-model="note" rows="3" placeholder="Weitere Details..."></textarea>
      </label>
      <div class="actions">
        <button type="button" @click="goBack">Zurück</button>
        <button type="submit" class="primary">Speichern</button>
        <button v-if="exists" type="button" class="danger" @click="remove">Löschen</button>
      </div>
    </form>

  </main>
</template>


<style scoped>
  .page {
    padding: 1rem;
  }

  .card {
    display:grid;
    gap:.75rem;
    border-color: #b3005a;
    border-radius:12px;
    padding:1rem;
    background-color: #f9ddd8;
  }

  .row {
    display:grid;
    gap:.5rem;
    color: #7a003c;
  }

  input, textarea, button {
    font: inherit;
    border-radius: 10px;
    padding: .5rem;
  }

  button {
    cursor: pointer;
    border-radius: 10px;
  }
</style>
