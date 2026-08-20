<template>
  <main class="page not-found" />
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'

const router = useRouter()
const now = new Date()

void router.replace({
  name: 'index',
  params: {
    year: now.getFullYear(),
    month: String(now.getMonth() + 1).padStart(2, '0'),
  },
})
</script>

<style lang="scss" scoped>
</style>
