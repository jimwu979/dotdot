<template>
  <header class="component header">
    <div>
      <img src="/favicon.svg" alt="">
      <h2>點點記帳</h2>
    </div>
    <nav>
      <router-link
        class="btn-click-effect"
        :class="{ now: route.name === 'index' }"
        :to="currentMonthRoute"
      >
        <BookOpenText />
        <h2>記帳</h2>
      </router-link>
      <router-link
        class="btn-click-effect"
        :class="{ now: route.name === 'statistics' }"
        :to="{ name: 'statistics' }"
      >
        <ChartPie />
        <h2>統計</h2>
      </router-link>
      <router-link
        class="btn-click-effect"
        :class="{ now: route.name === 'saving' }"
        :to="{ name: 'saving' }"
      >
        <Landmark />
        <h2>存款</h2>
      </router-link>
      <router-link
        class="btn-click-effect"
        :class="{ now: route.name === 'settings' }"
        :to="{ name: 'settings' }"
      >
        <Settings />
        <h2>設定</h2>
      </router-link>
    </nav>
    <section>
      <b>{{ userStore.initial }}</b>
      <div>
        <h3>{{ userStore.name }}</h3>
        <p>{{ userStore.email }}</p>
      </div>
    </section>
  </header>
</template>

<script setup lang="ts">
import { BookOpenText, ChartPie, Landmark, Settings } from '@lucide/vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/shared/stores/user'

const route = useRoute()
const userStore = useUserStore()
const now = new Date()
const currentMonthRoute = {
  name: 'index',
  params: {
    year: now.getFullYear(),
    month: String(now.getMonth() + 1).padStart(2, '0'),
  },
}
</script>

<style scoped lang="scss">
  .component.header{
    flex: 0 0 220px;
    gap: 24px;
    width: 220px;
    min-width: 220px;
    max-width: 220px;
    height: 100dvh;
    padding: 24px 12px 16px;
    background-color: $yellow;
    box-shadow: 4px 0 20px rgba(73,62,28,.12);
    @include flexbox(column, flex-start, stretch);
    >div{
      gap: 8px;
      height: 56px;
      padding: 0 8px;
      @include flexbox(row, flex-start, center);
      >img{
        width: 40px;
        height: 40px;
        border-radius: 12px;
      }
      >h2{
        font-size: 20px;
        font-weight: 600;
        letter-spacing: 2px;
      }
    }
    >nav{
      gap: 8px;
      @include flexbox(column, flex-start, stretch);
      >a{
        gap: 12px;
        height: 52px;
        padding: 0 14px;
        transition: .2s;
        border-radius: 12px;
        @include flexbox(row, flex-start, center);
        &.now{
          background-color: $white;
          box-shadow: 0 6px 18px rgba(73,62,28,.1);
        }
        >svg{
          width: 22px;
          height: 22px;
          stroke: $black;
          flex: 0 0 22px;
        }
        >h2{
          font-size: 16px;
          font-weight: 600;
        }
      }
    }
    >section{
      gap: 6px;
      padding: 6px;
      min-width: 0;
      overflow: hidden;
      min-height: 72px;
      margin-top: auto;
      border: 1px solid $oat;
      border-radius: 12px;
      background-color: $white;
      @include flexbox(row, flex-start, center);
      box-shadow: 0 6px 18px rgba(73,62,28,.08);
      >b{
        width: 40px;
        height: 40px;
        font-size: 16px;
        flex: 0 0 40px;
        font-weight: 600;
        border-radius: 50%;
        background-color: $oat;
        @include flexbox(row, center, center);
      }
      >div{
        flex: 1;
        min-width: 0;
        @include flexbox(column, center, stretch);
        >h3{
          font-size: 14px;
          line-height: 20px;
          font-weight: 600;
        }
        >p{
          width: 100%;
          color: $grey;
          font-size: 12px;
          overflow: hidden;
          line-height: 18px;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
      }
    }
  }
</style>
