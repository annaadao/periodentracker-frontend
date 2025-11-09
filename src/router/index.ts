import { createRouter, createWebHistory } from 'vue-router'
import Startseite from '../components/Startseite.vue'
import Eingabe from '../components/Eingabe.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Startseite,
    },
    {
      path: '/eintrag/:date',
      name: 'eintrag',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: Eingabe
    },
  ],
})

export default router
