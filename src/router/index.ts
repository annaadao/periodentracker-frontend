import { createRouter, createWebHistory } from 'vue-router'
import Startseite from '../components/Startseite.vue'
import KalenderJahr from '../components/KalenderJahr.vue'
import KalenderAnzeige from '../components/KalenderAnzeige.vue'
import Eingabe from '../components/Eingabe.vue'

// INFO
import InfoHub from "../components/InfoHub.vue"
import InfoKategorie from "../components/InfoKategorie.vue"
import InfoWatch from "../components/InfoWatch.vue"


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

    // INFO ROUTES
    { path: "/info", name: "info-hub", component: InfoHub },
    { path: "/info/:category", name: "info-kategorie", component: InfoKategorie },
    { path: "/info/watch/:id", name: "info-watch", component: InfoWatch },
  ],
})

export default router
