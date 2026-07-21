<template>
  <button
    type="button"
    class="component prevPage"
    aria-label="返回上一頁"
    @click="goBack"
  />
</template>

<script lang="ts" setup>
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
  display: inline-block;
  background-size: 20px;
  transform: rotateZ(-90deg);
  background-repeat: no-repeat;
  background-image: url('/arrow_line_black.png');
}
</style>
