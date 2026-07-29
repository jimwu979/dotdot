<template>
  <header class="component appHeader">
    <section class="left">
      <NavBox v-if="true" />
      <PrevPage v-if="false" />
    </section>
    <section class="center">
      <MonthSelector v-if="true" />
      <Title v-if="false" />
    </section>
    <section class="right">
      <slot name="right" />
    </section>
  </header>
</template>

<script lang="ts" setup>
  import Title         from '@/mobile/components/childComponents/appHeader/Title.vue'
  import NavBox        from '@/mobile/components/childComponents/appHeader/NavBox.vue'
  import PrevPage      from '@/mobile/components/childComponents/appHeader/PrevPage.vue'
  import MonthSelector from '@/mobile/components/childComponents/appHeader/MonthSelector.vue'
</script>

<style lang="scss" scoped>
.component.appHeader {
  left: 0;
  bottom: 0;
  z-index: 1;
  width: 100%;
  position: fixed;
  height: $header_height;
  padding: 12px 12px 32px;
  background-color: $yellow;
  box-shadow: 0px 0px 8px rgba(0,0,0,.2);
  @include flexbox(row, center, center);
  >section{
    &.left{
      left: 32px;
      position: absolute;
      height: calc(100% - 44px);
    }
    &.center{
      height: 100%;
      
    }
    &.right{
      height: calc(100% - 44px);
    }
  }
}
</style>
