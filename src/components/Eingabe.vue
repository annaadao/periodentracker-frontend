<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'
import { saveEntry, loadEntry, deleteEntry, hasEntry, type DayEntry } from '../speichern/periodeSpeichern'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const dateParam = route.params.date as string // YYYY-MM-DD

const periode = ref(false)
const symptom = ref('')
const emotion = ref('')
const note = ref('')
const exists = ref(false)
const API = 'https://periodentracker.onrender.com/api/v1'

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

//M2:
async function save() {

  const entry: DayEntry = {
    date: dateParam,
    periode: periode.value,
    symptom: symptom.value,
    emotion: emotion.value,
    note: note.value
  }
  saveEntry(entry)

  // M4: in Backend speichern
  const payload = {
    date: isoToDe(dateParam),        // Backend erwaret nämlicl: DD-MM-YYYY
    symptom: symptom.value,
    note: note.value
  }

  try {
    const res = await axios.post(`${API}/entries`, payload)
    // M4: Frontend ruft POST auf
    // HTTP-POST vom Browser ans Spring-Backend
    /*
    Backend erwartet: date, symptom, note
    --> Das liefert payload
     */
    console.log('POST OK:', res.data)
    alert(`Eintrag gespeichert (DB) für ${dateParam}`)
  } catch (err: any) {
    console.error('POST failed:', err)
    console.error('Status:', err?.response?.status)
    console.error('Data:', err?.response?.data)
    alert('Backend-Speichern fehlgeschlagen (POST). Schau in die Konsole.')
  }
}

//M4: Delete Funktion (CRUD)
async function remove() {
  if (!confirm('Willst du den Eintrag wirklich löschen?')) return

  // erst aus der Datenbank löschen
  try {
    const deDate = isoToDe(dateParam) // Backend will dd-MM-yyyy
    await axios.delete(`${API}/entries/by-date/${encodeURIComponent(deDate)}`)

    console.log('Eintrag in der DB gelöscht')
  } catch (err: any) {
    console.error('DELETE hat nicht geklappt:', err)
    console.error('Status:', err?.response?.status)
    console.error('Antwort:', err?.response?.data)
    alert('Fehler (Konsole schauen)')
    return
  }

  // hier lokal löschen, damit es im frontend UI ebenfalls weg ist
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

function isoToDe(iso: string) { // M4: dient dazu, dass DD-MM-YYYY ausgeführt, weil Router YYYY-MM-DD liefrt und Backend nun DD...
  const [y, m, d] = iso.split('-')   // YYYY-MM-DD
  return `${d}-${m}-${y}` // DD-MM-YYYY
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
