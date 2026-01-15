import { createRouter, createWebHistory } from 'vue-router'
import Startseite from '../components/Startseite.vue'
import KalenderJahr from '../components/KalenderJahr.vue'
import KalenderAnzeige from '../components/KalenderAnzeige.vue'
import Eingabe from '../components/Eingabe.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/home' },
    { path: '/home', name: 'home', component: Startseite },

    { path: '/kalender', name: 'kalender-jahr', component: KalenderJahr },

    // 2. Tage im Monat
    { path: '/kalender/monat', name: 'kalender-monat', component: KalenderAnzeige },

    // 3. Eintrag
    { path: '/eintrag/:date', name: 'eintrag', component: Eingabe },
  ],
})

export default router
