<template>
  <main class="page index">
    <h1>電腦版!</h1>
    <p>{{ currentYearMonth }}</p>
  </main>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const currentYearMonth = computed(() => `${route.params.year} 年 ${route.params.month} 月`)
</script>

<style lang="scss" scoped>
</style>
