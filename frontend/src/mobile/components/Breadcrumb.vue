<template>
  <nav class="component breadcrumb">
    <template v-for="(item, index) in items" :key="index">
      <span v-if="index > 0">/</span>
      <router-link class="btn-click-effect" :to="item.url">
        {{ item.text }}
      </router-link>
    </template>
  </nav>
</template>

<script lang="ts" setup>
defineProps<{
  items: {
    url: string
    text: string
  }[]
}>()
</script>

<style lang="scss" scoped>
.component.breadcrumb {
  >a{
    color: $brown;
    @include h3();
    text-underline-offset: 3px;
    text-decoration-color: $brown;
    text-decoration-line: underline;
    &:nth-last-of-type(1){
      color: $grey;
      pointer-events: none;
      text-decoration-line: none;
    }
  }
  >span{
    width: 20px;
    @include h3();
    text-align: center;
    display: inline-block;
  }
}
</style>
