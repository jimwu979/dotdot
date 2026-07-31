<template>
  <nav class="component breadcrumb">
    <template v-for="(item, index) in items" :key="index">
      <router-link :to="item.url">
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
    ~a{
      margin-left: 20px;
      position: relative;
      &:before{
        left: -20px;
        width: 20px;
        content: '/';
        @include h3();
        position: absolute;
        text-align: center;
        display: inline-block;
      }
    }
    &:nth-last-of-type(1){
      color: $grey;
      pointer-events: none;
      text-decoration-line: none;
    }
  }
}
</style>
