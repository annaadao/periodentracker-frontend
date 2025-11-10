<script setup lang="ts">
import
{ RouterLink, RouterView } from 'vue-router'
import HelloWorld from './components/HelloWorld.vue'
</script>

<template>npm
  <header>
    <div class="wrapper">
      <HelloWorld msg="PeriodenTracker" />

      <nav class="top-nav">
        <RouterLink to="/home">Startseite</RouterLink>
        <RouterLink to="/about">Kalender</RouterLink>
      </nav>
    </div>
  </header>

  <RouterView />
</template>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

/* später logo einbauen! */
.logo {
  display: block;
  margin: 0 auto 2rem;
}

.top-nav {
  margin-top: .75rem;
  display: flex;
  gap: .75rem;
}

.top-nav a {
  text-decoration: none;
  padding: .35rem .9rem;
  border-radius: 8px;
  background: #a7b59e;
  color: #2d4839;
}

nav a:hover {
  background-color: #799567;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>

<style>
body {
  /* background: #b2d9c4 */
  background: #a7b59e;
}
</style>
