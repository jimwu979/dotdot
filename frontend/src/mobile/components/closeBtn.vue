<template>
  <button class="component closeBtn btn-click-effect">
    <X />
  </button>
</template>

<script lang="ts" setup>
  import { X } from '@lucide/vue'
</script>

<style lang="scss" scoped>
.component.closeBtn {
  width: 30px;
  transition: .2s;
  aspect-ratio: 1/1;
  position: relative;
  border-radius: 50%;
  background-color: rgba(255,255,255,.4);
  @include flexbox(row, center, center);
  >svg{
    width: 22px;
  }
  &:hover{
    background-color: $yellow-hover;
  }
}
</style>
