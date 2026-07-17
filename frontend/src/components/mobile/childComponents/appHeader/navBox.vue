<template>
  <div class="component navBox">
    <button>
      <hr>
      <hr>
      <hr>
    </button>
    <nav>
      <router-link to="/index">記帳</router-link>
      <router-link to="/statistics">統計</router-link>
      <router-link to="/settings">設定</router-link>
      <router-link to="/savings">金庫</router-link>
    </nav>
  </div>
</template>

<script lang="ts" setup>
</script>

<style lang="scss" scoped>
.component.navBox{

}
</style>
