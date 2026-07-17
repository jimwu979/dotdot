<template>
  <header class="component appHeader">
    <section class="left">
      <NavBox />
      <PrevPage />
    </section>
    <section class="center">
      <MonthSelector />
    </section>
  </header>
</template>

<script lang="ts" setup>
  import NavBox        from './childComponents/appHeader/navBox.vue'
  import PrevPage      from './childComponents/appHeader/prevPage.vue'
  import MonthSelector from './childComponents/appHeader/monthSelector.vue'
</script>

<style lang="scss" scoped>
.appHeader {
  top: 0;
  left: 0;
  width: 100%;
  z-index: 10;
  position: fixed;
  padding: 0 20px;
  height: $header_height;
  background-color: $white;
  @include flexbox(row, flex-start, center);
  > .title {
    font-size: 20px;
    font-weight: 700;
  }
}
</style>
