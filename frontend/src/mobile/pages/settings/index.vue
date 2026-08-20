<template>
  <main class="page settings">
    <h1>設定</h1>
    <section v-for="group in settingGroups" :key="group.title">
      <h2>{{ group.title }}</h2>
      <div>
        <template v-for="item in group.items" :key="item.label">
          <button
            v-if="'action' in item"
            class="btn-click-effect list-btn-click-effect"
            type="button"
            @click="isLogoutConfirmOpen = true"
          >
            <h3>{{ item.label }}</h3>
            <ChevronRight />
          </button>
        <router-link
          v-else
          class="btn-click-effect list-btn-click-effect"
            :to="item.to"
        >
            <h3>{{ item.label }}</h3>
          <ChevronRight />
        </router-link>
        </template>
      </div>
    </section>
    <AppHeader title="設定" />
    <ConfirmDialog
      :open="isLogoutConfirmOpen"
      message="確定要登出點點記帳嗎？"
      confirm-text="登出"
      @cancel="isLogoutConfirmOpen = false"
      @confirm="confirmLogout"
    />
  </main>
</template>

<script lang="ts" setup>
  import { ref } from 'vue'
  import { ChevronRight } from '@lucide/vue'
  import { useRouter, type RouteLocationRaw } from 'vue-router'
  import AppHeader from '@/mobile/components/AppHeader.vue'
  import ConfirmDialog from '@/mobile/components/ConfirmDialog.vue'

  type SettingItem = {
    label: string
    to: RouteLocationRaw
  } | {
    label: string
    action: 'logout'
  }

  const router = useRouter()
  const isLogoutConfirmOpen = ref(false)
  const settingGroups: { title: string, items: SettingItem[] }[] = [
    {
      title: '帳號',
      items: [
        { label: '姓名', to: { path: '/mobile/settings/account', query: { view: 'name' } } },
        { label: 'Email', to: { path: '/mobile/settings/account', query: { view: 'email' } } },
        { label: '重設密碼', to: { path: '/mobile/settings/account', query: { view: 'password' } } },
        { label: '登出', action: 'logout' },
      ],
    },
    {
      title: '週期',
      items: [
        { label: '點點記帳', to: { path: '/mobile/settings/cycle-dotdot', query: { view: 'dotdot' } } },
        { label: '自動記帳', to: { path: '/mobile/settings/cycle-auto', query: { view: 'automatic' } } },
      ],
    },
    {
      title: '類別',
      items: [
        { label: '收入', to: { path: '/mobile/settings/category', query: { isExpense: 'false' } } },
        { label: '支出', to: { path: '/mobile/settings/category', query: { isExpense: 'true' } } },
      ],
    },
  ]

  const confirmLogout = () => {
    isLogoutConfirmOpen.value = false
    void router.push({ name: 'login' })
  }
</script>

<style lang="scss" scoped>
.page.settings{
  gap: 12px;
  @include flexbox(column, flex-start, stretch);
  >h1{
    @include h1();
  }
  >section{
    gap: 12px;
    overflow: hidden;
    border-radius: 8px;
    padding: 12px;
    border: 1px solid $stone;
    background-color: $white;
    @include flexbox(column, flex-start, stretch);
    ~section{

    }
    >h2{
      color: $grey-light;
      @include h3();
    }
    >div{
      margin: 0 -12px -12px;
      @include flexbox(column, flex-start, stretch);
      >a,
      >button{
        height: 52px;
        padding: 0 12px;
        @include flexbox(row, space-between, center);
        >h3{

        }
        >svg{
          width: 12px;
          opacity: .4;
          stroke: $black;
        }
      }
      >* ~ * {
        border-top: 1px solid $oat;
      }
    }
  }
}
</style>
