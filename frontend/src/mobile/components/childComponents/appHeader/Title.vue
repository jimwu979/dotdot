<template>
  <h2
    class="component title"
    v-text="text"
    @dblclick.prevent
    @touchend.prevent
  />
</template>

<script lang="ts" setup>
  defineProps<{
    text: string
  }>()
</script>

<style lang="scss" scoped>
.component.title{
  height: 100%;
  @include h2();
  line-height: 100%;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
  @include flexbox(row, center, center);
}
</style>
