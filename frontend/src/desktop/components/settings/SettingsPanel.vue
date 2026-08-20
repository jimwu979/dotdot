<template>
  <section class="component settings-panel">
    <template v-if="accountContent">
      <header>
        <h1>{{ accountContent.title }}</h1>
        <p>{{ accountContent.description }}</p>
      </header>
      <form v-if="view !== 'logout'" @submit.prevent="saveAccount">
        <label v-for="field in accountContent.fields" :key="field.key">
          <span>{{ field.label }}</span>
          <input
            v-model="accountValues[field.key]"
            :class="{ error: accountErrors[field.key] }"
            :autocomplete="field.autocomplete"
            :readonly="field.readonly"
            :type="field.type"
          >
          <p class="error-message">
            <span :class="{ show: accountErrors[field.key] }">
              {{ accountErrors[field.key] }}
            </span>
          </p>
        </label>
        <p v-if="accountMessage" class="form-message">{{ accountMessage }}</p>
        <button class="btn-click-effect primary" type="submit">儲存</button>
      </form>
      <div v-else class="logout-content">
        <p>確定要登出點點記帳嗎？</p>
        <button class="btn-click-effect primary" type="button" @click="logout">登出</button>
      </div>
    </template>

    <template v-else-if="view === 'dotdot'">
      <header>
        <h1>點點記帳</h1>
        <p>管理首頁的快速記帳項目、顯示狀態與排列順序。</p>
      </header>
      <div class="scroll-content dotdot-content">
        <section v-for="fixed in [true, false]" :key="String(fixed)" :class="['record-group', { fixed }]">
          <h2>{{ fixed ? '已釘選' : '未釘選' }}</h2>
          <TransitionGroup tag="ul" name="settings-list" @selectstart.prevent>
            <li
              v-for="item in displayedDotdotItems(fixed)"
              :key="item.id"
              :class="[{ show: item.show }, { 'drag-placeholder': dragKind === 'dotdot' && draggedId === item.id }]"
              :data-drag-id="item.id"
            >
              <Transaction v-bind="item.record" />
              <div class="option">
                <button class="btn-click-effect" type="button" :aria-label="item.show ? '隱藏' : '顯示'" @click="dotdotStore.toggleDotdotVisibility(item.id)">
                  <Eye v-if="item.show" /><EyeOff v-else />
                </button>
                <button class="btn-click-effect edit" type="button" aria-label="編輯" @click="emit('edit', { kind: 'dotdot', id: item.id })"><Pencil /></button>
                <button class="drag" type="button" aria-label="拖曳排序" @pointerdown="startListDrag($event, 'dotdot', item.id, fixed)"><GripVertical /></button>
              </div>
            </li>
          </TransitionGroup>
        </section>
        <button class="btn-click-effect add-button" type="button" @click="emit('edit', { kind: 'dotdot' })">添加點點記帳</button>
      </div>
    </template>

    <template v-else-if="view === 'automatic'">
      <header>
        <h1>自動記帳</h1>
        <p>設定固定時間自動建立的記帳項目與執行週期。</p>
      </header>
      <div class="scroll-content automatic-content">
        <TransitionGroup tag="ul" name="settings-list" @selectstart.prevent>
          <li
            v-for="item in automaticItems"
            :key="item.id"
            :class="[{ enabled: item.enabled }, { 'drag-placeholder': dragKind === 'automatic' && draggedId === item.id }]"
            :data-drag-id="item.id"
          >
            <button class="drag btn-click-effect" type="button" aria-label="拖曳排序" @pointerdown="startListDrag($event, 'automatic', item.id)"><GripVertical /></button>
            <div class="content">
              <div class="transaction-box"><Transaction v-bind="item.record" status="automatic" /></div>
              <div class="timing-box">
                <div class="timing-content">
                  <div><b>頻率</b><span>{{ formatFrequency(item) }}</span></div>
                  <div><b>時間</b><span class="time">{{ formatTime(item.timing.time) }}</span></div>
                </div>
                <button class="edit btn-click-effect" type="button" @click="emit('edit', { kind: 'automatic', id: item.id })"><Pencil />編輯</button>
              </div>
            </div>
          </li>
        </TransitionGroup>
        <button class="btn-click-effect add-button" type="button" @click="emit('edit', { kind: 'automatic' })"><Plus />添加自動記帳</button>
      </div>
    </template>

    <template v-else>
      <header>
        <h1>{{ view === 'income' ? '收入類別' : '支出類別' }}</h1>
        <p>管理記帳時可選擇的類別、圖示、顏色與標籤。</p>
      </header>
      <div class="scroll-content category-content">
        <TransitionGroup tag="ul" name="settings-list" @selectstart.prevent>
          <li
            v-for="category in categoryItems"
            :key="category.id"
            :class="{ 'drag-placeholder': dragKind === 'category' && draggedId === category.id }"
            :data-drag-id="category.id"
          >
            <i :style="{ backgroundColor: categoryColors[category.color] }"><component :is="categoryIcons[category.icon]" /></i>
            <strong>{{ category.name }}</strong>
            <button class="btn-click-effect edit" type="button" aria-label="編輯" @click="emit('edit', { kind: 'category', id: category.id })"><Pencil /></button>
            <button class="drag" type="button" aria-label="拖曳排序" @pointerdown="startListDrag($event, 'category', category.id)"><GripVertical /></button>
          </li>
        </TransitionGroup>
        <button class="btn-click-effect add-button" type="button" @click="emit('edit', { kind: 'category', isExpense: view === 'expense' })">添加新類別</button>
      </div>
    </template>

    <Teleport to="body">
      <Transition name="drag-preview">
        <div
          v-if="dotdotDragPreview || automaticDragPreview || categoryDragPreview"
          ref="dragPreviewElement"
          :class="[
            'settings-drag-preview',
            dragKind,
            {
              enabled: automaticDragPreview?.enabled,
              dropping: isDropping,
            },
          ]"
          :style="dragPreviewStyle"
        >
          <template v-if="dotdotDragPreview">
            <Transaction v-bind="dotdotDragPreview.record" />
            <div class="option"><span><Eye v-if="dotdotDragPreview.show" /><EyeOff v-else /></span><span><Pencil /></span><span><GripVertical /></span></div>
          </template>
          <template v-else-if="automaticDragPreview">
            <span class="drag"><GripVertical /></span>
            <div class="content">
              <div class="transaction-box"><Transaction v-bind="automaticDragPreview.record" status="automatic" /></div>
              <div class="timing-box">
                <div class="timing-content"><div><b>頻率</b><span>{{ formatFrequency(automaticDragPreview) }}</span></div><div><b>時間</b><span class="time">{{ formatTime(automaticDragPreview.timing.time) }}</span></div></div>
                <span class="edit"><Pencil />編輯</span>
              </div>
            </div>
          </template>
          <template v-else-if="categoryDragPreview">
            <i :style="{ backgroundColor: categoryColors[categoryDragPreview.color] }"><component :is="categoryIcons[categoryDragPreview.icon]" /></i>
            <strong>{{ categoryDragPreview.name }}</strong><span><Pencil /></span><span><GripVertical /></span>
          </template>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>

<script lang="ts" setup>
import { computed, nextTick, onBeforeUnmount, reactive, ref, watch, type CSSProperties } from 'vue'
import { Eye, EyeOff, GripVertical, Pencil, Plus } from '@lucide/vue'
import { useRouter } from 'vue-router'
import Transaction from '@/mobile/components/transaction.vue'
import { categoryColors } from '@/shared/colors/category'
import { categoryIcons } from '@/shared/icons/category'
import { useAutomaticStore, type AutomaticItem } from '@/shared/stores/automatic'
import { useCategoryStore, type Category } from '@/shared/stores/category'
import { useDotdotStore, type DotdotItem } from '@/shared/stores/dotdot'
import { useUserStore } from '@/shared/stores/user'
import type { SettingsEditorTarget } from '@/desktop/components/settings/SettingsEditorPanel.vue'

export type SettingsView = 'name' | 'email' | 'password' | 'logout' | 'dotdot' | 'automatic' | 'income' | 'expense' | ''
type DragKind = 'dotdot' | 'automatic' | 'category'
interface AccountField {
  key: 'name' | 'oldEmail' | 'newEmail' | 'emailPassword' | 'oldPassword' | 'newPassword'
  label: string
  type: 'text' | 'email' | 'password'
  autocomplete: string
  readonly?: boolean
}
interface AccountContent { title: string, description: string, fields: AccountField[] }

const props = defineProps<{ view: Exclude<SettingsView, ''> }>()
const emit = defineEmits<{ edit: [target: Exclude<SettingsEditorTarget, null>] }>()
const router = useRouter()
const categoryStore = useCategoryStore()
const dotdotStore = useDotdotStore()
const automaticStore = useAutomaticStore()
const userStore = useUserStore()
const accountMessage = ref('')
const accountValues = reactive<Record<AccountField['key'], string>>({ name: userStore.name, oldEmail: userStore.email, newEmail: '', emailPassword: '', oldPassword: '', newPassword: '' })
const accountErrors = reactive<Record<AccountField['key'], string>>({ name: '', oldEmail: '', newEmail: '', emailPassword: '', oldPassword: '', newPassword: '' })
const draggedId = ref<number>()
const dragKind = ref<DragKind>()
const dragFixed = ref(false)
const dragOrder = ref<number[]>()
const dragPreviewElement = ref<HTMLDivElement>()
const dragPreviewStyle = ref<CSSProperties>({})
const isDropping = ref(false)
let dragListElement: HTMLUListElement | null = null
let removeDragListeners: (() => void) | null = null

const accountContentMap: Partial<Record<SettingsView, AccountContent>> = {
  name: { title: '姓名', description: '這是你的顯示名稱，會顯示在應用程式中。', fields: [{ key: 'name', label: '顯示名稱', type: 'text', autocomplete: 'name' }] },
  email: {
    title: 'Email', description: '修改登入信箱前，請輸入目前的密碼完成驗證。', fields: [
      { key: 'oldEmail', label: '舊 Email', type: 'email', autocomplete: 'email', readonly: true },
      { key: 'newEmail', label: '新 Email', type: 'email', autocomplete: 'email' },
      { key: 'emailPassword', label: '密碼', type: 'password', autocomplete: 'current-password' },
    ],
  },
  password: {
    title: '重設密碼', description: '輸入目前的密碼，再設定一組新的登入密碼。', fields: [
      { key: 'oldPassword', label: '原密碼', type: 'password', autocomplete: 'current-password' },
      { key: 'newPassword', label: '新密碼', type: 'password', autocomplete: 'new-password' },
    ],
  },
  logout: { title: '登出', description: '登出後，需要再次輸入帳號密碼才能使用點點記帳。', fields: [] },
}
const accountContent = computed(() => accountContentMap[props.view] ?? null)
const getRecord = (record: { categoryId: number, tagIds: number[], note: string, amount: number }) => {
  const category = categoryStore.categoryList.find(item => item.id === record.categoryId)
  return {
    icon: category?.icon ?? 'LayoutDashboard', color: category ? categoryColors[category.color] : categoryColors.grey,
    category: category?.name ?? '未分類', isExpense: category?.isExpense ?? true,
    tag: category?.tags.filter(tag => record.tagIds.includes(tag.id)).sort((a, b) => a.index - b.index).map(tag => tag.name) ?? [],
    note: record.note, amount: record.amount,
  }
}
const getDotdotDisplayItem = (item: DotdotItem) => ({ ...item, record: getRecord(item.record) })
const getAutomaticDisplayItem = (item: AutomaticItem) => ({ ...item, record: getRecord(item.record) })
const displayedDotdotItems = (fixed: boolean) => {
  const items = dotdotStore.getDotdotList(fixed)
  if (dragKind.value !== 'dotdot' || dragFixed.value !== fixed || !dragOrder.value) return items.map(getDotdotDisplayItem)
  return dragOrder.value.map(id => items.find(item => item.id === id)).filter((item): item is DotdotItem => Boolean(item)).map(getDotdotDisplayItem)
}
const automaticItems = computed(() => {
  const items = automaticStore.getAutomaticList()
  const ordered = dragKind.value === 'automatic' && dragOrder.value
    ? dragOrder.value.map(id => items.find(item => item.id === id)).filter((item): item is AutomaticItem => Boolean(item)) : items
  return ordered.map(getAutomaticDisplayItem)
})
const sortedCategoryItems = computed(() => categoryStore.categoryList.filter(category => category.isExpense === (props.view === 'expense')).slice().sort((a, b) => a.index - b.index))
const categoryItems = computed(() => dragKind.value === 'category' && dragOrder.value
  ? dragOrder.value.map(id => sortedCategoryItems.value.find(category => category.id === id)).filter((category): category is Category => Boolean(category))
  : sortedCategoryItems.value)
const dotdotDragPreview = computed(() => {
  if (dragKind.value !== 'dotdot' || draggedId.value === undefined) return null
  const item = dotdotStore.dotdotList.find(item => item.id === draggedId.value)
  return item ? getDotdotDisplayItem(item) : null
})
const automaticDragPreview = computed(() => {
  if (dragKind.value !== 'automatic' || draggedId.value === undefined) return null
  const item = automaticStore.automaticList.find(item => item.id === draggedId.value)
  return item ? getAutomaticDisplayItem(item) : null
})
const categoryDragPreview = computed(() => {
  if (dragKind.value !== 'category' || draggedId.value === undefined) return null
  return categoryStore.categoryList.find(category => category.id === draggedId.value) ?? null
})

const saveAccount = () => {
  accountMessage.value = ''
  accountContent.value?.fields.forEach(field => { accountErrors[field.key] = '' })
  if (props.view === 'name' && !accountValues.name.trim()) {
    accountErrors.name = '此欄位不得空白'
    return
  }
  if (props.view === 'email') {
    if (!accountValues.newEmail.trim()) accountErrors.newEmail = '此欄位不得空白'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(accountValues.newEmail)) accountErrors.newEmail = 'Email 格式填寫錯誤'
    if (!accountValues.emailPassword) accountErrors.emailPassword = '此欄位不得空白'
    if (accountErrors.newEmail || accountErrors.emailPassword) return
  }
  if (props.view === 'password') {
    if (!accountValues.oldPassword) accountErrors.oldPassword = '此欄位不得空白'
    if (!accountValues.newPassword) accountErrors.newPassword = '此欄位不得空白'
    if (accountErrors.oldPassword || accountErrors.newPassword) return
  }
  if (props.view === 'name') userStore.updateName(accountValues.name)
  if (props.view === 'email') {
    userStore.updateEmail(accountValues.newEmail)
    accountValues.oldEmail = userStore.email
    accountValues.newEmail = ''
    accountValues.emailPassword = ''
  }
  // 前端欄位驗證通過後，Email 與密碼正確性由帳號 API 驗證。
  accountMessage.value = '已儲存變更'
}
const logout = () => { void router.push({ name: 'login' }) }
const clearDrag = () => {
  draggedId.value = undefined; dragKind.value = undefined; dragOrder.value = undefined
  dragPreviewStyle.value = {}; isDropping.value = false; dragListElement = null
}
const startListDrag = (event: PointerEvent, kind: DragKind, itemId: number, fixed = false) => {
  if (event.button !== 0 || draggedId.value !== undefined) return
  const row = (event.currentTarget as HTMLButtonElement).closest<HTMLLIElement>('[data-drag-id]')
  if (!row || !(row.parentElement instanceof HTMLUListElement)) return
  event.preventDefault()
  const rowRect = row.getBoundingClientRect()
  const pointerOffsetY = event.clientY - rowRect.top
  dragListElement = row.parentElement; draggedId.value = itemId; dragKind.value = kind; dragFixed.value = fixed
  dragOrder.value = Array.from(dragListElement.querySelectorAll<HTMLLIElement>('[data-drag-id]')).map(element => Number(element.dataset.dragId))
  dragPreviewStyle.value = { top: `${rowRect.top}px`, left: `${rowRect.left}px`, width: `${rowRect.width}px` }
  const preventPageScroll = (touchEvent: TouchEvent) => { touchEvent.preventDefault() }
  const moveItem = (pointerEvent: PointerEvent) => {
    pointerEvent.preventDefault()
    dragPreviewStyle.value = { ...dragPreviewStyle.value, top: `${pointerEvent.clientY - pointerOffsetY}px` }
    const targets = Array.from(dragListElement?.querySelectorAll<HTMLLIElement>('[data-drag-id]') ?? []).filter(element => Number(element.dataset.dragId) !== itemId)
    let targetIndex = targets.findIndex(element => { const rect = element.getBoundingClientRect(); return pointerEvent.clientY < rect.top + rect.height / 2 })
    if (targetIndex === -1) targetIndex = targets.length
    const nextOrder = [...(dragOrder.value ?? [])]
    nextOrder.splice(nextOrder.indexOf(itemId), 1); nextOrder.splice(targetIndex, 0, itemId)
    if (nextOrder.join() !== dragOrder.value?.join()) dragOrder.value = nextOrder
  }
  const endItemDrag = async () => {
    removeDragListeners?.(); removeDragListeners = null
    const targetIndex = dragOrder.value?.indexOf(itemId) ?? -1
    if (targetIndex >= 0 && kind === 'dotdot') dotdotStore.moveDotdot(itemId, fixed, targetIndex)
    if (targetIndex >= 0 && kind === 'automatic') automaticStore.moveAutomatic(itemId, targetIndex)
    if (targetIndex >= 0 && kind === 'category' && dragOrder.value) categoryStore.updateCategoryOrder(dragOrder.value)
    await nextTick()
    const placeholder = dragListElement?.querySelector<HTMLLIElement>(`[data-drag-id="${itemId}"]`)
    const placeholderRect = placeholder?.getBoundingClientRect(); const previewRect = dragPreviewElement.value?.getBoundingClientRect()
    if (!placeholderRect || !previewRect || !dragPreviewElement.value) return clearDrag()
    let finished = false; let fallbackTimer: number | undefined
    const finishDrop = (transitionEvent?: TransitionEvent) => {
      if (transitionEvent && transitionEvent.propertyName !== 'top') return
      if (finished) return; finished = true; window.clearTimeout(fallbackTimer)
      dragPreviewElement.value?.removeEventListener('transitionend', finishDrop); clearDrag()
    }
    if (Math.abs(placeholderRect.top - previewRect.top) < 1) return finishDrop()
    isDropping.value = true; dragPreviewElement.value.addEventListener('transitionend', finishDrop)
    fallbackTimer = window.setTimeout(finishDrop, 250)
    requestAnimationFrame(() => { dragPreviewStyle.value = { ...dragPreviewStyle.value, top: `${placeholderRect.top}px`, width: `${placeholderRect.width}px` } })
  }
  removeDragListeners = () => {
    window.removeEventListener('pointermove', moveItem); window.removeEventListener('pointerup', endItemDrag)
    window.removeEventListener('pointercancel', endItemDrag); window.removeEventListener('touchmove', preventPageScroll)
  }
  window.addEventListener('touchmove', preventPageScroll, { passive: false }); window.addEventListener('pointermove', moveItem, { passive: false })
  window.addEventListener('pointerup', endItemDrag); window.addEventListener('pointercancel', endItemDrag)
}
const formatTime = (value: string) => {
  const [hour, minute] = value.split(':').map(Number); const period = hour >= 12 ? 'PM' : 'AM'
  return `${String(hour % 12 || 12).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${period}`
}
const formatFrequency = (item: { timing: AutomaticItem['timing'] }) => {
  if (item.timing.frequency === 'daily') return '每天'
  if (item.timing.frequency === 'weekly') { const labels = ['日', '一', '二', '三', '四', '五', '六']; return `每週 ${item.timing.weekdays.map(day => labels[day]).join('、')}` }
  return `每月 ${item.timing.monthDay} 號`
}
watch(() => props.view, () => {
  accountMessage.value = ''
  Object.keys(accountErrors).forEach(key => { accountErrors[key as AccountField['key']] = '' })
  removeDragListeners?.()
  removeDragListeners = null
  clearDrag()
})
onBeforeUnmount(() => { removeDragListeners?.() })
</script>

<style lang="scss" scoped>
@mixin automatic-card(){
  min-height: 150px; overflow: hidden; border-radius: 12px; border: 1px solid $stone; background-color: $white;
  box-shadow: 0 2px 6px rgba(42,36,24,.06); @include flexbox(row, flex-start, stretch);
  >.drag{ width: 38px; flex: 0 0 38px; cursor: grab; touch-action: none; background-color: $oat; @include flexbox(row, center, center); >svg{ width: 20px; stroke: $grey; } }
  >.content{ min-width: 0; flex: 1; @include flexbox(column, flex-start, stretch);
    >.transaction-box{ height: 58px; padding: 10px 12px; opacity: .35; transition: opacity .2s; border-bottom: 1px solid $oat; }
    >.timing-box{ flex: 1; position: relative; padding: 10px 12px;
      >.timing-content{ gap: 8px; opacity: .35; transition: opacity .2s; @include flexbox(column, flex-start, stretch);
        >div{ gap: 8px; min-height: 28px; @include flexbox(row, flex-start, center); >b{ width: 38px; color: $grey; } >.time{ padding: 6px 8px; border-radius: 8px; border: 1px solid $stone; } }
      }
      >.edit{ right: 12px; bottom: 10px; height: 38px; gap: 4px; padding: 0 10px; position: absolute; border-radius: 8px; border: 1px solid $yellow-dark; background-color: $yellow; @include flexbox(row, center, center); >svg{ width: 15px; } }
    }
  }
  &.enabled >.content >.transaction-box, &.enabled >.content >.timing-box >.timing-content{ opacity: 1; }
}
.component.settings-panel{
  width: 100%; height: 100%; background-color: $white; @include flexbox(column, flex-start, stretch);
  >header{ padding: 36px 40px 26px; border-bottom: 1px solid $oat; >h1{ @include h2(); } >p{ color: $grey; max-width: 680px; margin-top: 12px; font-size: 16px; line-height: 1.6; } }
  >form, >.logout-content{ gap: 12px; width: 100%; max-width: 820px; padding: 34px 40px; @include flexbox(column, flex-start, stretch);
    >label{ @include flexbox(column, flex-start, stretch); >span{ font-weight: 600; margin-bottom: 8px; }
      >input{ width: 100%; height: 48px; padding: 0 14px; border-radius: 10px; border: 1px solid $stone; background-color: $background;
        &:focus{ outline: none; border-color: $mustard; background-color: $white; box-shadow: 0 0 0 3px rgba($mustard,.12); }
        &.error{ border-color: $red; }
        &:read-only{ color: $grey; cursor: default; background-color: $oat; &:focus{ border-color: $stone; box-shadow: none; } }
      }
      >.error-message{ height: 24px; line-height: 1; position: relative; pointer-events: none;
        >span{ top: 3px; left: 0; opacity: 0; color: $red; line-height: 18px; position: absolute; pointer-events: none; transition: opacity .2s; @include small();
          &.show{ opacity: 1; pointer-events: auto; }
        }
      }
    }
    >.form-message{ color: $mustard; @include small(); }
  }
  >.logout-content >p{ font-size: 18px; }
  .primary, .add-button{ height: 48px; gap: 6px; padding: 0 20px; font-weight: 600; border-radius: 10px; align-self: flex-end; background-color: $yellow-dark; @include flexbox(row, center, center); >svg{ width: 18px; } }
  >.scroll-content{ flex: 1; gap: 18px; min-height: 0; overflow-y: auto; padding: 24px 32px 40px; overscroll-behavior: contain; @include flexbox(column, flex-start, stretch);
    >.add-button{ width: 100%; min-height: 52px; margin-top: 4px; align-self: stretch; }
    ul{ user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; @include flexbox(column, flex-start, stretch); }
    .settings-list-move{ transition: transform .2s cubic-bezier(.2,.8,.2,1); }
  }
  .dotdot-content{ gap: 12px;
    &::-webkit-scrollbar-button{ width: 0; height: 0; display: none; }
    >.record-group{ gap: 10px; @include flexbox(column, flex-start, stretch); >h2{ color: $grey; @include small(); font-weight: 600; }
      >ul{ gap: 8px; min-height: 42px;
        >li{ opacity: .4; gap: 12px; width: calc(100% + 24px); height: 42px; padding: 0 12px; margin-left: -12px; border-radius: 8px; transition: transform .2s; @include flexbox(row, center, center);
          &.show{ opacity: 1; } &.drag-placeholder{ opacity: 0; }
          >.option{ @include flexbox(row, center, center); >button{ width: 30px; aspect-ratio: 1/1; border-radius: 8px; @include flexbox(row, center, center); >svg{ width: 16px; } &.drag{ cursor: grab; touch-action: none; &:active{ cursor: grabbing; } } } }
        }
      }
      &.fixed{ padding-bottom: 16px; border-bottom: 1px solid $oat; }
    }
  }
  .automatic-content >ul{ gap: 12px; >li{ transition: transform .2s; @include automatic-card(); &.drag-placeholder{ opacity: 0; } } }
  .category-content >ul >li{ height: 52px; padding: 0 12px; border-radius: 8px; transition: transform .2s; @include flexbox(row, flex-start, center);
    &.drag-placeholder{ opacity: 0; }
    >i{ width: 36px; height: 36px; flex: 0 0 36px; border-radius: 50%; @include flexbox(row, center, center); >svg{ width: 18px; stroke: $white; } }
    >strong{ flex: 1; margin-left: 12px; }
    >button{ width: 40px; height: 40px; border-radius: 8px; @include flexbox(row, center, center); >svg{ width: 20px; } &.drag{ cursor: grab; touch-action: none; &:active{ cursor: grabbing; } } }
  }
}
.settings-drag-preview{ z-index: 20; position: fixed; pointer-events: none; background-color: $background; transform: scale(1.025); box-shadow: 0 4px 14px rgba($black,.14);
  &.dropping{ transform: scale(1); transition: top .2s cubic-bezier(.2,.8,.2,1), width .2s cubic-bezier(.2,.8,.2,1), transform .2s cubic-bezier(.2,.8,.2,1); }
  &.dotdot{ gap: 12px; height: 42px; padding: 0 12px; border-radius: 8px; @include flexbox(row, center, center); >.option{ @include flexbox(row, center, center); >span{ width: 30px; border-radius: 8px; @include flexbox(row, center, center); >svg{ width: 16px; } } } }
  &.automatic{ @include automatic-card(); transform: scale(1.05); &.dropping{ transform: scale(1); } }
  &.category{ height: 52px; padding: 0 12px; border-radius: 8px; @include flexbox(row, flex-start, center);
    >i{ width: 36px; height: 36px; flex: 0 0 36px; border-radius: 50%; @include flexbox(row, center, center); >svg{ width: 18px; stroke: $white; } }
    >strong{ flex: 1; margin-left: 12px; } >span{ width: 40px; @include flexbox(row, center, center); >svg{ width: 20px; } }
  }
}
.settings-drag-preview.drag-preview-enter-active,
.settings-drag-preview.drag-preview-leave-active{
  transition: opacity .2s,
              transform .2s,
              background-color .2s,
              box-shadow .2s;
}
.settings-drag-preview.drag-preview-enter-from,
.settings-drag-preview.drag-preview-leave-to{
  opacity: 0;
  transform: scale(1);
  background-color: rgba($background,0);
  box-shadow: 0 0 0 rgba($black,0);
}
</style>
