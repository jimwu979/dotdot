<template>
  <button
    type="button"
    class="component prevPage"
    @click="goBack"
  >
    <ChevronLeft />
  </button>
</template>

<script lang="ts" setup>
  import { ChevronLeft } from '@lucide/vue'
  import { useRouter } from 'vue-router'

  const router = useRouter()
  const goBack = () => {
    router.back()
  }
</script>

<style lang="scss" scoped>
.component.prevPage{
  content: '';
  height: 100%;
  aspect-ratio: 1/1;
  border-radius: 8px;
  @include flexbox(row, center, center);
  >svg{
    width: 20px;
    stroke: $black;
  }
}
</style>
