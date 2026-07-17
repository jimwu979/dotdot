<template>
  <main class="page index">
    <h1>INDEX</h1>
    <p>年:{{ year }}, 月:{{ month }}</p>
    <AppHeader />
  </main>
</template>

<script lang="ts" setup>
  import { computed } from 'vue'
  import { useRoute } from 'vue-router'
  import AppHeader from '../components/mobile/appHeader.vue'

  const route = useRoute()
  const year  = computed(() => route.params.year )
  const month = computed(() => route.params.month)
</script>

<style lang="scss" scoped>
</style>
