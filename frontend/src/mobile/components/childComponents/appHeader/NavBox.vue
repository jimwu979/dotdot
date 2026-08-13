<template>
  <div class="component navBox" :class="{'open': isOpen}">
    <button class="btn-click-effect" @click="toggleMenu">
      <hr>
      <hr>
      <hr>
    </button>
    <nav @click="isOpen = false">
      <router-link class="btn-click-effect list-btn-click-effect" :to="indexRoute">記帳</router-link>
      <router-link class="btn-click-effect list-btn-click-effect" :to="{ name: 'statistics' }">統計</router-link>
      <router-link class="btn-click-effect list-btn-click-effect" :to="{ name: 'settings' }">設定</router-link>
      <router-link class="btn-click-effect list-btn-click-effect" :to="{ name: 'saving' }">存款</router-link>
    </nav>
  </div>
</template>

<script lang="ts" setup>
  import { ref } from 'vue'
  import { useCloseOnBodyClick } from '@/shared/composables/useCloseOnBodyClick'

  const date = new Date()
  const indexRoute = {
    name: 'index',
    params: {
      year: String(date.getFullYear()),
      month: String(date.getMonth() + 1).padStart(2, '0'),
    },
  }

  const isOpen = ref<boolean>(false)
  const { markCurrentClick } = useCloseOnBodyClick(
    () => isOpen.value,
    () => { isOpen.value = false },
  )

  const toggleMenu = () => {
    const willOpen = !isOpen.value

    isOpen.value = willOpen
    if (willOpen) markCurrentClick()
  }
</script>

<style lang="scss" scoped>
.component.navBox{
  height: 100%;
  aspect-ratio: 1/1;
  position: relative;
  >button{
    gap: 7px;
    width: 100%;
    height: 100%;
    padding: 8px;
    border-radius: 8px;
    border: 2px solid $black;
    background-color: $white;
    @include flexbox(column, center, center);
    >hr{
      width: 100%;
      height: 2px;
      border-radius: 99px;
      background-color: $black;      
    }
  }
  >nav{
    left: 0;
    opacity: 0;
    width: 220px;
    padding: 10px 0;
    overflow: hidden;
    transition: .2s;
    position: absolute;
    border-radius: 8px;
    pointer-events: none;
    background-color: $white;
    bottom: calc(100% + 24px);
    transform: translateY(10px);
    @include flexbox(column, center, stretch);
    box-shadow: 0px 2px 8px rgba(0,0,0,.25);
    >a{
      height: 50px;
      padding: 0 20px;
      @include p();
      text-align: center;
      white-space: nowrap;
      @include flexbox(row, center, center);
    }
  }
  &.open{
    >button{
      >hr{

      }
    }
    >nav{
      opacity: 1;
      pointer-events: auto;
      transform: translateY(0px);
    }
  }
}
</style>
