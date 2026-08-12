<template>
  <main class="page cycleAuto">
    <Breadcrumb
      :items="[
        { url: '/mobile/settings', text: '設定' },
        { url: '/mobile/settings', text: '週期' },
        { url: '', text: '自動記帳' },
      ]"
    />
    <TransitionGroup
      ref="listElement"
      tag="ul"
      name="automatic"
      @selectstart.prevent
    >
      <li
        v-for="item in displayedAutomaticList"
        :key="item.id"
        :class="[
          { enabled: item.enabled },
          { 'drag-placeholder': draggedAutomaticId === item.id },
        ]"
        :data-automatic-id="item.id"
      >
        <button
          class="drag"
          type="button"
          :aria-label="`拖曳排序${item.note || item.categoryName}`"
          @pointerdown="startAutomaticDrag($event, item.id)"
        >
          <GripVertical />
        </button>
        <div class="content">
          <div class="transaction-box">
            <Transaction
              :icon="item.categoryIcon"
              :color="item.categoryColor"
              :category="item.categoryName"
              :is-expense="item.isExpense"
              :tag="item.tag"
              :note="item.note"
              :amount="item.amount"
              status="automatic"
            />
          </div>
          <div class="timing-box">
            <div class="timing-content">
              <div class="frequency">
                <b>頻率</b>
                <span v-text="frequencyLabels[item.timing.frequency]" />
                <template v-if="item.timing.frequency === 'weekly'">
                  <span
                    v-for="weekday in item.timing.weekdays"
                    :key="weekday"
                    class="weekday"
                    v-text="weekdayLabels[weekday]"
                  />
                </template>
                <template v-if="item.timing.frequency === 'monthly'">
                  <span class="month-day" v-text="item.timing.monthDay" />
                  <small>號</small>
                </template>
              </div>
              <div class="time-row">
                <b>時間</b>
                <span class="time">
                  <span v-text="formatTime(item.timing.time).time" />
                  <small v-text="formatTime(item.timing.time).period" />
                </span>
              </div>
            </div>
            <router-link
              class="edit"
              :to="{
                path: '/mobile/settings/cycle-auto-editor',
                query: { automaticId: item.id },
              }"
              :aria-label="`編輯${item.note || item.categoryName}`"
            >
              <Pencil />
              編輯
            </router-link>
          </div>
        </div>
      </li>
    </TransitionGroup>
    <Teleport to="body">
      <div
        v-if="dragPreviewAutomatic"
        ref="dragPreviewElement"
        :class="[
          'automatic-drag-preview',
          { enabled: dragPreviewAutomatic.enabled },
          { dropping: isDropping },
        ]"
        :style="dragPreviewStyle"
      >
        <span class="drag">
          <GripVertical />
        </span>
        <div class="content">
          <div class="transaction-box">
            <Transaction
              :icon="dragPreviewAutomatic.categoryIcon"
              :color="dragPreviewAutomatic.categoryColor"
              :category="dragPreviewAutomatic.categoryName"
              :is-expense="dragPreviewAutomatic.isExpense"
              :tag="dragPreviewAutomatic.tag"
              :note="dragPreviewAutomatic.note"
              :amount="dragPreviewAutomatic.amount"
              status="automatic"
            />
          </div>
          <div class="timing-box">
            <div class="timing-content">
              <div class="frequency">
                <b>頻率</b>
                <span v-text="frequencyLabels[dragPreviewAutomatic.timing.frequency]" />
                <template v-if="dragPreviewAutomatic.timing.frequency === 'weekly'">
                  <span
                    v-for="weekday in dragPreviewAutomatic.timing.weekdays"
                    :key="weekday"
                    class="weekday"
                    v-text="weekdayLabels[weekday]"
                  />
                </template>
                <template v-if="dragPreviewAutomatic.timing.frequency === 'monthly'">
                  <span
                    class="month-day"
                    v-text="dragPreviewAutomatic.timing.monthDay"
                  />
                  <small>號</small>
                </template>
              </div>
              <div class="time-row">
                <b>時間</b>
                <span class="time">
                  <span v-text="formatTime(dragPreviewAutomatic.timing.time).time" />
                  <small v-text="formatTime(dragPreviewAutomatic.timing.time).period" />
                </span>
              </div>
            </div>
            <span class="edit">
              <Pencil />
              編輯
            </span>
          </div>
        </div>
      </div>
    </Teleport>
    <router-link
      class="add"
      to="/mobile/settings/cycle-auto-editor"
    >
      <Plus />
      添加
    </router-link>
    <AppHeader title="設定" right-action="scroll" />
  </main>
</template>

<script lang="ts" setup>
import {
  computed,
  onBeforeUnmount,
  ref,
  type ComponentPublicInstance,
  type CSSProperties,
} from 'vue'
import { GripVertical, Pencil, Plus } from '@lucide/vue'
import AppHeader from '@/mobile/components/AppHeader.vue'
import Breadcrumb from '@/mobile/components/Breadcrumb.vue'
import Transaction from '@/mobile/components/transaction.vue'
import { categoryColors } from '@/shared/colors/category'
import { useCategoryStore } from '@/shared/stores/category'
import {
  useAutomaticStore,
  type AutomaticFrequency,
  type AutomaticItem,
} from '@/shared/stores/automatic'

interface AutomaticDisplayItem extends AutomaticItem {
  categoryIcon: string
  categoryColor: string
  categoryName: string
  tag: string[]
  note: string
  amount: number
  isExpense: boolean
}

const categoryStore = useCategoryStore()
const automaticStore = useAutomaticStore()
const listElement = ref<ComponentPublicInstance | null>(null)
const dragPreviewElement = ref<HTMLDivElement | null>(null)
const draggedAutomaticId = ref<number | null>(null)
const dragOrder = ref<number[] | null>(null)
const dragPreviewStyle = ref<CSSProperties>({})
const dragPreviewAutomatic = ref<AutomaticDisplayItem | null>(null)
const isDropping = ref(false)
let removeDragListeners: (() => void) | null = null

const weekdayLabels = ['日', '一', '二', '三', '四', '五', '六']
const frequencyLabels: Record<AutomaticFrequency, string> = {
  daily: '每天',
  weekly: '每週',
  monthly: '每月',
}

const getAutomaticDisplayItem = (item: AutomaticItem): AutomaticDisplayItem => {
  const category = categoryStore.categoryList
    .find(category => category.id === item.record.categoryId)
  const selectedTagIds = new Set(item.record.tagIds)

  return {
    ...item,
    categoryIcon: category?.icon ?? '',
    categoryColor: category ? categoryColors[category.color] : '',
    categoryName: category?.name ?? '',
    tag: category?.tags
      .filter(tag => selectedTagIds.has(tag.id))
      .sort((tagA, tagB) => tagA.index - tagB.index)
      .map(tag => tag.name) ?? [],
    note: item.record.note,
    amount: item.record.amount,
    isExpense: category?.isExpense ?? true,
  }
}

const displayedAutomaticList = computed(() => {
  const list = automaticStore.getAutomaticList()

  if (!dragOrder.value) return list.map(getAutomaticDisplayItem)

  return dragOrder.value
    .map(automaticId => list.find(item => item.id === automaticId))
    .filter((item): item is AutomaticItem => Boolean(item))
    .map(getAutomaticDisplayItem)
})

const formatTime = (value: string) => {
  const [hourValue, minuteValue] = value.split(':').map(Number)
  const hour = Number.isInteger(hourValue) ? hourValue : 0
  const minute = Number.isInteger(minuteValue) ? minuteValue : 0

  return {
    time: `${String(hour % 12 || 12).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
    period: hour >= 12 ? 'PM' : 'AM',
  }
}

const getListElement = () => listElement.value?.$el as HTMLUListElement | undefined

const clearDrag = () => {
  draggedAutomaticId.value = null
  dragOrder.value = null
  dragPreviewStyle.value = {}
  dragPreviewAutomatic.value = null
  isDropping.value = false
}

const startAutomaticDrag = (event: PointerEvent, automaticId: number) => {
  if (
    event.button !== 0
    || draggedAutomaticId.value !== null
    || dragPreviewAutomatic.value !== null
  ) return

  event.preventDefault()
  const automaticElement = (event.currentTarget as HTMLButtonElement)
    .closest<HTMLLIElement>('[data-automatic-id]')
  const item = automaticStore.automaticList
    .find(item => item.id === automaticId)

  if (!automaticElement || !item) return

  const automaticRect = automaticElement.getBoundingClientRect()
  const pointerOffsetY = event.clientY - automaticRect.top

  draggedAutomaticId.value = automaticId
  dragOrder.value = automaticStore.getAutomaticList().map(item => item.id)
  dragPreviewAutomatic.value = getAutomaticDisplayItem(item)
  dragPreviewStyle.value = {
    top: `${automaticRect.top}px`,
    left: `${automaticRect.left}px`,
    width: `${automaticRect.width}px`,
  }

  const preventPageScroll = (touchEvent: TouchEvent) => {
    touchEvent.preventDefault()
  }

  const moveAutomatic = (pointerEvent: PointerEvent) => {
    pointerEvent.preventDefault()
    dragPreviewStyle.value = {
      ...dragPreviewStyle.value,
      top: `${pointerEvent.clientY - pointerOffsetY}px`,
    }

    const targetElements = Array.from(
      getListElement()?.querySelectorAll<HTMLLIElement>('[data-automatic-id]') ?? [],
    ).filter(element => Number(element.dataset.automaticId) !== automaticId)
    let targetIndex = targetElements.findIndex((element) => {
      const elementRect = element.getBoundingClientRect()

      return pointerEvent.clientY < elementRect.top + elementRect.height / 2
    })

    if (targetIndex === -1) targetIndex = targetElements.length

    const nextOrder = [...(dragOrder.value ?? [])]
    const currentIndex = nextOrder.indexOf(automaticId)

    if (currentIndex === -1 || currentIndex === targetIndex) return

    nextOrder.splice(currentIndex, 1)
    nextOrder.splice(targetIndex, 0, automaticId)
    dragOrder.value = nextOrder
  }

  const endAutomaticDrag = () => {
    removeDragListeners?.()
    removeDragListeners = null

    const targetIndex = dragOrder.value?.indexOf(automaticId) ?? -1
    const placeholder = getListElement()
      ?.querySelector<HTMLLIElement>(`[data-automatic-id="${automaticId}"]`)
    const placeholderRect = placeholder?.getBoundingClientRect()
    const previewRect = dragPreviewElement.value?.getBoundingClientRect()

    if (targetIndex >= 0) {
      automaticStore.moveAutomatic(automaticId, targetIndex)
    }

    if (!placeholderRect || !previewRect || !dragPreviewElement.value) {
      clearDrag()
      return
    }

    let dragFinished = false
    let dropFallbackTimer: number | undefined

    const finishAutomaticDrop = () => {
      if (dragFinished) return

      dragFinished = true
      window.clearTimeout(dropFallbackTimer)
      dragPreviewElement.value
        ?.removeEventListener('transitionend', finishAutomaticDrop)
      draggedAutomaticId.value = null

      requestAnimationFrame(() => {
        dragOrder.value = null
        dragPreviewStyle.value = {}
        dragPreviewAutomatic.value = null
        isDropping.value = false
      })
    }

    if (Math.abs(placeholderRect.top - previewRect.top) < 1) {
      finishAutomaticDrop()
      return
    }

    isDropping.value = true
    dragPreviewElement.value
      .addEventListener('transitionend', finishAutomaticDrop)
    dropFallbackTimer = window.setTimeout(finishAutomaticDrop, 250)

    requestAnimationFrame(() => {
      dragPreviewStyle.value = {
        ...dragPreviewStyle.value,
        top: `${placeholderRect.top}px`,
        width: `${placeholderRect.width}px`,
      }
    })
  }

  removeDragListeners = () => {
    window.removeEventListener('pointermove', moveAutomatic)
    window.removeEventListener('pointerup', endAutomaticDrag)
    window.removeEventListener('pointercancel', endAutomaticDrag)
    window.removeEventListener('touchmove', preventPageScroll)
  }

  window.addEventListener('touchmove', preventPageScroll, { passive: false })
  window.addEventListener('pointermove', moveAutomatic, { passive: false })
  window.addEventListener('pointerup', endAutomaticDrag)
  window.addEventListener('pointercancel', endAutomaticDrag)
}

onBeforeUnmount(() => {
  removeDragListeners?.()
})
</script>

<style lang="scss" scoped>
@mixin automaticCard() {
  min-height: 150px;
  overflow: hidden;
  border-radius: 12px;
  border: 1px solid $stone;
  background-color: $white;
  box-shadow: 0px 2px 6px rgba(42, 36, 24, .06);
  @include flexbox(row, flex-start, stretch);
  >.drag{
    width: 38px;
    flex: 0 0 auto;
    cursor: grab;
    touch-action: none;
    background-color: $oat;
    @include flexbox(row, center, center);
    &:active{
      cursor: grabbing;
      background-color: $stone;
    }
    >svg{
      width: 20px;
      stroke: $grey;
    }
  }
  >.content{
    min-width: 0;
    flex: 1;
    @include flexbox(column, flex-start, stretch);
    >.transaction-box{
      height: 58px;
      padding: 10px 12px;
      opacity: .35;
      transition: opacity .2s;
      border-bottom: 1px solid $oat;
    }
    >.timing-box{
      flex: 1;
      position: relative;
      padding: 10px 12px;
      >.timing-content{
        gap: 8px;
        min-width: 0;
        opacity: .35;
        transition: opacity .2s;
        @include flexbox(column, flex-start, stretch);
        >div{
          min-height: 30px;
          gap: 6px;
          white-space: nowrap;
          @include flexbox(row, flex-start, center);
          >b{
            width: 36px;
            flex: 0 0 auto;
            color: $grey;
          }
          >.weekday,
          >.month-day{
            width: 24px;
            flex: 0 0 auto;
            aspect-ratio: 1/1;
            border-radius: 50%;
            background-color: $oat;
            @include flexbox(row, center, center);
          }
          >.time{
            height: 32px;
            overflow: hidden;
            border-radius: 8px;
            border: 1px solid $stone;
            background-color: $white;
            @include flexbox(row, flex-start, center);
            >span{
              padding: 0 8px;
            }
            >small{
              height: 22px;
              padding: 0 7px;
              border-left: 1px solid $stone;
              @include flexbox(row, center, center);
            }
          }
        }
      }
      >.edit{
        right: 12px;
        bottom: 10px;
        height: 38px;
        gap: 4px;
        padding: 0 10px;
        position: absolute;
        border-radius: 8px;
        border: 1px solid $yellow-dark;
        background-color: $yellow;
        @include flexbox(row, center, center);
        &:active{
          background-color: $yellow-hover;
        }
        >svg{
          width: 15px;
        }
      }
    }
  }
  &.enabled{
    >.content{
      >.transaction-box,
      >.timing-box >.timing-content{
        opacity: 1;
      }
    }
  }
}

.page.cycleAuto {
  gap: 20px;
  @include flexbox(column, flex-start, stretch);
  >ul{
    gap: 12px;
    user-select: none;
    -webkit-user-select: none;
    -webkit-touch-callout: none;
    @include flexbox(column, flex-start, stretch);
    >li{
      transition: transform .2s;
      @include automaticCard();
      &.drag-placeholder{
        opacity: 0;
      }
      &.automatic-move{
        transition: transform .2s cubic-bezier(.2, .8, .2, 1);
      }
    }
  }
  >.add{
    width: 100%;
    gap: 6px;
    margin-top: 12px;
    padding: 18px 12px;
    border-radius: 12px;
    font-weight: 600;
    background-color: $yellow-dark;
    @include h3();
    @include flexbox(row, center, center);
    &:active{
      background-color: $yellow-hover;
    }
    >svg{
      width: 18px;
    }
  }
}
.automatic-drag-preview{
  z-index: 10;
  position: fixed;
  pointer-events: none;
  transform: scale(1.05);
  @include automaticCard();
  box-shadow: 0px 5px 14px rgba(42, 36, 24, .14);
  &.dropping{
    transform: scale(1);
    transition: top .2s cubic-bezier(.2, .8, .2, 1),
                width .2s cubic-bezier(.2, .8, .2, 1),
                transform .2s cubic-bezier(.2, .8, .2, 1);
  }
}
</style>
