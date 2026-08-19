<template>
  <div class="page settings">
    <DesktopHeader />
    <main>
      <header>
        <h1>設定</h1>
        <p>管理你的帳號、週期記帳與收支類別</p>
      </header>
      <section v-for="group in settingGroups" :key="group.title">
        <h2>{{ group.title }}</h2>
        <div>
          <button
            v-for="item in group.items"
            :key="item.label"
            class="btn-click-effect"
            :class="{ now: selectedView === item.view }"
            type="button"
            @click="selectSetting(item)"
          >
            <span>{{ item.label }}</span>
            <small v-if="item.value">{{ item.value }}</small>
            <ChevronRight />
          </button>
        </div>
      </section>
    </main>
    <aside>
      <SettingsPanel
        v-if="selectedView"
        :view="selectedView"
        @edit="openEditor"
      />
    </aside>
    <SettingsEditorPanel
      :editor="editor"
      @close="closeEditor"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { ChevronRight } from '@lucide/vue'
import { useRoute, useRouter } from 'vue-router'
import DesktopHeader from '@/desktop/components/header.vue'
import SettingsEditorPanel, {
  type SettingsEditorTarget,
} from '@/desktop/components/settings/SettingsEditorPanel.vue'
import SettingsPanel, {
  type SettingsView,
} from '@/desktop/components/settings/SettingsPanel.vue'

interface SettingItem {
  label: string
  value?: string
  view: Exclude<SettingsView, ''>
  query: Record<string, string>
}

const route = useRoute()
const router = useRouter()
const settingGroups: { title: string, items: SettingItem[] }[] = [
  {
    title: '帳號',
    items: [
      { label: '姓名', value: '歐巴馬', view: 'name', query: { view: 'name' } },
      { label: 'Email', value: 'obam@gmail.com', view: 'email', query: { view: 'email' } },
      { label: '重設密碼', view: 'password', query: { view: 'password' } },
      { label: '登出', view: 'logout', query: { view: 'logout' } },
    ],
  },
  {
    title: '週期',
    items: [
      { label: '點點記帳', view: 'dotdot', query: { view: 'dotdot' } },
      { label: '自動記帳', view: 'automatic', query: { view: 'automatic' } },
    ],
  },
  {
    title: '類別',
    items: [
      { label: '收入', view: 'income', query: { isExpense: 'false' } },
      { label: '支出', view: 'expense', query: { isExpense: 'true' } },
    ],
  },
]

const selectedView = computed<SettingsView>(() => {
  if (route.query.isExpense === 'false') return 'income'
  if (route.query.isExpense === 'true') return 'expense'

  const view = Array.isArray(route.query.view) ? route.query.view[0] : route.query.view

  return ['name', 'email', 'password', 'logout', 'dotdot', 'automatic'].includes(view ?? '')
    ? view as SettingsView
    : ''
})
const getQueryString = (value: unknown) => {
  const queryValue = Array.isArray(value) ? value[0] : value

  return typeof queryValue === 'string' ? queryValue : undefined
}
const getQueryId = (value: unknown) => {
  const id = Number(getQueryString(value))

  return Number.isInteger(id) && id > 0 ? id : undefined
}
const editor = computed<SettingsEditorTarget>(() => {
  const panel = getQueryString(route.query.panel)

  if (panel === 'dotdot') {
    return { kind: 'dotdot', id: getQueryId(route.query.dotdotId) }
  }
  if (panel === 'automatic') {
    return { kind: 'automatic', id: getQueryId(route.query.automaticId) }
  }
  if (panel === 'category') {
    return {
      kind: 'category',
      id: getQueryId(route.query.id),
      isExpense: route.query.isExpense !== 'false',
    }
  }

  return null
})
const withoutEditorQuery = () => {
  const query = { ...route.query }

  delete query.panel
  delete query.dotdotId
  delete query.automaticId
  delete query.id

  return query
}

const selectSetting = (item: SettingItem) => {
  void router.replace({ name: 'settings', query: item.query })
}

const openEditor = (target: Exclude<SettingsEditorTarget, null>) => {
  const query = withoutEditorQuery()

  query.panel = target.kind
  if (target.kind === 'dotdot' && target.id !== undefined) {
    query.dotdotId = String(target.id)
  }
  if (target.kind === 'automatic' && target.id !== undefined) {
    query.automaticId = String(target.id)
  }
  if (target.kind === 'category') {
    if (target.id !== undefined) query.id = String(target.id)
    if (target.isExpense !== undefined) query.isExpense = String(target.isExpense)
  }

  void router.push({ name: 'settings', query })
}
const closeEditor = () => {
  void router.replace({ name: 'settings', query: withoutEditorQuery() })
}
</script>

<style lang="scss" scoped>
.page.settings{
  position: relative;
  width: 100%;
  height: 100dvh;
  min-height: 100vh;
  overflow: hidden;
  @include flexbox(row, flex-start, stretch);
  >main{
    flex: 0 0 420px;
    gap: 14px;
    height: 100%;
    padding: 28px 24px;
    overflow-y: auto;
    border-right: 1px solid $oat;
    @include flexbox(column, flex-start, stretch);
    >header{
      margin-bottom: 4px;
      >h1{
        @include h2();
      }
      >p{
        color: $grey;
        margin-top: 8px;
        @include small();
      }
    }
    >section{
      overflow: hidden;
      border-radius: 12px;
      border: 1px solid $stone;
      background-color: $white;
      box-shadow: 0 6px 18px rgba(73,62,28,.05);
      >h2{
        color: $grey;
        padding: 12px 14px 8px;
        @include small();
        font-weight: 600;
      }
      >div{
        >button{
          gap: 10px;
          width: 100%;
          height: 48px;
          padding: 0 12px 0 14px;
          border-radius: 0;
          @include flexbox(row, flex-start, center);
          >span{
            font-weight: 600;
          }
          >small{
            flex: 1;
            color: $grey;
            min-width: 0;
            overflow: hidden;
            text-align: right;
            white-space: nowrap;
            text-overflow: ellipsis;
            @include small();
          }
          >svg{
            width: 15px;
            flex: 0 0 15px;
            margin-left: auto;
            stroke: $grey-light;
          }
          &.now{
            background-color: rgba($yellow,.18);
            >svg{
              stroke: $black;
            }
          }
          ~button{
            border-top: 1px solid $oat;
          }
        }
      }
    }
  }
  >aside{
    flex: 1;
    min-width: 0;
    height: 100%;
    overflow: hidden;
    background-color: $background;
  }
}
</style>
