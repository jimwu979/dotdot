<template>
  <div class="component monthSelector">
    <div class="title">
      <button><</button>
      <button>4月</button>
      <button>></button>
    </div>
    <div class="selector">
      <div class="options">
        <button class="now">NOW</button>
        <div class="year">
          <button><</button>
          <button>2026</button>
          <button>></button>
        </div>
        <button>close</button>
      </div>
      <div class="list">
        <router-link 
          v-for="i in 12" :key="i" 
          :class="{ 'now': i === 7 }" 
          :to="`/${2026}/${i}`"
        >
          {{ i }}月
        </router-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
</script>

<style lang="scss" scoped>
.component.monthSelector{

}
</style>
