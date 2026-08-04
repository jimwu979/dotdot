<template>
  <button
    type="button"
    :class="['component btn', type]"
  >
    {{ text }}
  </button>
</template>

<script setup lang="ts">
  defineProps<{
    text: string
    type: 'confirm' | 'cancel' | 'delete'
  }>()
</script>

<style scoped lang="scss">
  .component.btn {
    height: 48px;
    @include h3();
    padding: 0 10px;
    min-width: 88px;
    border-radius: 10px;
    @include flexbox(row, center, center);
    transition: background-color .2s, transform .1s;
    &:active {
      transform: scale(.98);
    }
    &.confirm {
      color: $black;
      background-color: $yellow;
      &:active {
        background-color: $yellow-hover;
      }
    }
    &.cancel {
      color: $grey;
      border: 1px solid $stone;
      background-color: $white;
      &:active {
        background-color: $white-hover;
      }
    }
    &.delete {
      color: $white;
      background-color: $red;
    }
  }
</style>
