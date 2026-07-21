<template>
  <h2
    class="component title"
    v-text="'記帳'"
    @dblclick.prevent
    @touchend.prevent
  />
</template>

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
