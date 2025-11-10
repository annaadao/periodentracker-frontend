import { createRouter, createWebHistory } from 'vue-router'
import Startseite from '../components/Startseite.vue'
import Kalender from '../components/KalenderAnzeige.vue'
import Eingabe from '../components/Eingabe.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/home', name: 'home', component: Startseite },
    { path: '/kalender', name: 'kalender', component: Kalender},
    { path: '/eintrag/:date', name: 'eintrag', component: Eingabe },
  ],
})

export default router
