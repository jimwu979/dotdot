<template>
  <main class="page cycleDotdot">
    <Breadcrumb
      :items="[
        { url: '/mobile/settings', text: '設定' },
        { url: '/mobile/settings', text: '週期' },
        { url: '', text: '點點記帳' },
      ]"
    />
    <h2>點點記帳</h2>
    <div class="list fixed">
      <h5>已釘選</h5>
      <TransitionGroup
        ref="fixedListElement"
        tag="ul"
        name="dotdot"
        data-fixed="true"
        @selectstart.prevent
      >
        <li
          v-for="i in displayedDotdotList(true)"
          :key="i.id"
          :class="[
            { show: i.show },
            { 'drag-placeholder': draggedDotdotId === i.id },
          ]"
          :data-dotdot-id="i.id"
        >
          <Transaction
            :icon="i.categoryIcon"
            :color="i.categoryColor"
            :category="i.categoryName"
            :is-expense="i.isExpense"
            :tag="i.tag"
            :note="i.note"
            :amount="i.amount"
          />
          <div class="option">
            <button
              class="display"
              type="button"
              @click="dotdotStore.toggleDotdotVisibility(i.id)"
            >
              <Eye v-if="i.show" />
              <EyeOff v-else />
            </button>
            <router-link
              class="edit"
              :to="{
                path: '/mobile/settings/cycle-dotdot-editor',
                query: { dotdotId: i.id },
              }"
            >
              <Pencil />
            </router-link>
            <button
              class="drag"
              type="button"
              @pointerdown="startDotdotDrag($event, i.id)"
            >
              <GripVertical />
            </button>
          </div>
        </li>
      </TransitionGroup>
    </div>
    <div class="list">
      <h5>未釘選</h5>
      <TransitionGroup
        ref="unpinnedListElement"
        tag="ul"
        name="dotdot"
        data-fixed="false"
        @selectstart.prevent
      >
        <li
          v-for="i in displayedDotdotList(false)"
          :key="i.id"
          :class="[
            { show: i.show },
            { 'drag-placeholder': draggedDotdotId === i.id },
          ]"
          :data-dotdot-id="i.id"
        >
          <Transaction
            :icon="i.categoryIcon"
            :color="i.categoryColor"
            :category="i.categoryName"
            :is-expense="i.isExpense"
            :tag="i.tag"
            :note="i.note"
            :amount="i.amount"
          />
          <div class="option">
            <button
              class="display"
              type="button"
              @click="dotdotStore.toggleDotdotVisibility(i.id)"
            >
              <Eye v-if="i.show" />
              <EyeOff v-else />
            </button>
            <router-link
              class="edit"
              :to="{
                path: '/mobile/settings/cycle-dotdot-editor',
                query: { dotdotId: i.id },
              }"
            >
              <Pencil />
            </router-link>
            <button
              class="drag"
              type="button"
              @pointerdown="startDotdotDrag($event, i.id)"
            >
              <GripVertical />
            </button>
          </div>
        </li>
      </TransitionGroup>
    </div>
    <router-link to="/mobile/settings/cycle-dotdot-editor">添加</router-link>
    <Teleport to="body">
      <div
        v-if="dragPreviewDotdot"
        ref="dragPreviewElement"
        :class="[
          'dotdot-drag-preview',
          { dropping: isDropping },
        ]"
        :style="dragPreviewStyle"
      >
        <Transaction
          :icon="dragPreviewDotdot.categoryIcon"
          :color="dragPreviewDotdot.categoryColor"
          :category="dragPreviewDotdot.categoryName"
          :is-expense="dragPreviewDotdot.isExpense"
          :tag="dragPreviewDotdot.tag"
          :note="dragPreviewDotdot.note"
          :amount="dragPreviewDotdot.amount"
        />
        <div class="option">
          <span>
            <Eye v-if="dragPreviewDotdot.show" />
            <EyeOff v-else />
          </span>
          <span><Pencil /></span>
          <span><GripVertical /></span>
        </div>
      </div>
    </Teleport>
    <AppHeader right-action="scroll" />
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
import { Eye, EyeOff, GripVertical, Pencil } from '@lucide/vue'
import AppHeader from '@/mobile/components/AppHeader.vue'
import Breadcrumb from '@/mobile/components/Breadcrumb.vue'
import Transaction from '@/mobile/components/transaction.vue'
import { categoryColors } from '@/shared/colors/category'
import { useCategoryStore } from '@/shared/stores/category'
import { useDotdotStore, type DotdotItem } from '@/shared/stores/dotdot'

interface DragOrder {
  fixed: number[]
  unpinned: number[]
}

interface DotdotDisplayItem extends DotdotItem {
  categoryIcon: string
  categoryColor: string
  categoryName: string
  tag: string[]
  note: string
  amount: number
  isExpense: boolean
}

const categoryStore = useCategoryStore()
const dotdotStore = useDotdotStore()
const fixedListElement = ref<ComponentPublicInstance | null>(null)
const unpinnedListElement = ref<ComponentPublicInstance | null>(null)
const dragPreviewElement = ref<HTMLDivElement | null>(null)
const draggedDotdotId = ref<number | null>(null)
const dragOrder = ref<DragOrder | null>(null)
const dragTargetFixed = ref(true)
const dragPreviewStyle = ref<CSSProperties>({})
const dragPreviewDotdot = ref<DotdotDisplayItem | null>(null)
const isDropping = ref(false)
let removeDragListeners: (() => void) | null = null

const fixedDotdotList = computed(() => dotdotStore.getDotdotList(true))
const unpinnedDotdotList = computed(() => dotdotStore.getDotdotList(false))

const getDotdotDisplayItem = (item: DotdotItem): DotdotDisplayItem => {
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

const displayedDotdotList = (isFixed: boolean) => {
  const list = isFixed ? fixedDotdotList.value : unpinnedDotdotList.value
  const order = isFixed ? dragOrder.value?.fixed : dragOrder.value?.unpinned

  if (!order) return list.map(getDotdotDisplayItem)

  return order
    .map(dotdotId => dotdotStore.dotdotList.find(item => item.id === dotdotId))
    .filter((item): item is DotdotItem => Boolean(item))
    .map(getDotdotDisplayItem)
}

const getListElement = (isFixed: boolean) => {
  const listComponent = isFixed ? fixedListElement.value : unpinnedListElement.value

  return listComponent?.$el as HTMLUListElement | undefined
}

const clearDragPreview = () => {
  draggedDotdotId.value = null
  dragPreviewDotdot.value = null
  dragPreviewStyle.value = {}
  dragOrder.value = null
  isDropping.value = false
}

const startDotdotDrag = (event: PointerEvent, dotdotId: number) => {
  if (event.button !== 0 || draggedDotdotId.value !== null) return

  event.preventDefault()

  const dotdotElement = (event.currentTarget as HTMLButtonElement)
    .closest<HTMLLIElement>('[data-dotdot-id]')
  const item = dotdotStore.dotdotList.find(item => item.id === dotdotId)

  if (!dotdotElement || !item) return

  const dotdotRect = dotdotElement.getBoundingClientRect()
  const pointerOffsetY = event.clientY - dotdotRect.top

  draggedDotdotId.value = dotdotId
  dragTargetFixed.value = item.fixed
  dragPreviewDotdot.value = getDotdotDisplayItem(item)
  dragOrder.value = {
    fixed: fixedDotdotList.value.map(item => item.id),
    unpinned: unpinnedDotdotList.value.map(item => item.id),
  }
  dragPreviewStyle.value = {
    top: `${dotdotRect.top}px`,
    left: `${dotdotRect.left}px`,
    width: `${dotdotRect.width}px`,
  }

  const preventPageScroll = (touchEvent: TouchEvent) => {
    touchEvent.preventDefault()
  }

  const moveDotdot = (pointerEvent: PointerEvent) => {
    pointerEvent.preventDefault()
    dragPreviewStyle.value = {
      ...dragPreviewStyle.value,
      top: `${pointerEvent.clientY - pointerOffsetY}px`,
    }

    const targetList = getListElement(dragTargetFixed.value)
    const targetElements = Array.from(
      targetList?.querySelectorAll<HTMLLIElement>('[data-dotdot-id]') ?? [],
    ).filter(element => Number(element.dataset.dotdotId) !== dotdotId)
    let targetIndex = targetElements.findIndex((element) => {
      const elementRect = element.getBoundingClientRect()

      return pointerEvent.clientY < elementRect.top + elementRect.height / 2
    })

    if (targetIndex === -1) {
      targetIndex = targetElements.length
    }

    const nextOrder: DragOrder = {
      fixed: [...(dragOrder.value?.fixed ?? [])],
      unpinned: [...(dragOrder.value?.unpinned ?? [])],
    }
    const targetOrder = dragTargetFixed.value ? nextOrder.fixed : nextOrder.unpinned

    targetOrder.splice(targetOrder.indexOf(dotdotId), 1)
    targetOrder.splice(targetIndex, 0, dotdotId)

    if (
      nextOrder.fixed.join() !== dragOrder.value?.fixed.join()
      || nextOrder.unpinned.join() !== dragOrder.value?.unpinned.join()
    ) {
      dragOrder.value = nextOrder
    }
  }

  const endDotdotDrag = () => {
    removeDragListeners?.()
    removeDragListeners = null

    const targetOrder = dragTargetFixed.value
      ? dragOrder.value?.fixed
      : dragOrder.value?.unpinned
    const targetIndex = targetOrder?.indexOf(dotdotId) ?? -1
    const placeholder = getListElement(dragTargetFixed.value)
      ?.querySelector<HTMLLIElement>(`[data-dotdot-id="${dotdotId}"]`)
    const placeholderRect = placeholder?.getBoundingClientRect()
    const previewRect = dragPreviewElement.value?.getBoundingClientRect()

    if (targetIndex >= 0) {
      dotdotStore.moveDotdot(dotdotId, dragTargetFixed.value, targetIndex)
    }

    if (!placeholderRect || !previewRect || !dragPreviewElement.value) {
      clearDragPreview()
      return
    }

    let dragFinished = false
    let dropFallbackTimer: number | undefined

    const finishDotdotDrop = () => {
      if (dragFinished) return

      dragFinished = true
      window.clearTimeout(dropFallbackTimer)
      dragPreviewElement.value?.removeEventListener('transitionend', finishDotdotDrop)
      clearDragPreview()
    }

    if (Math.abs(placeholderRect.top - previewRect.top) < 1) {
      finishDotdotDrop()
      return
    }

    isDropping.value = true
    dragPreviewElement.value.addEventListener('transitionend', finishDotdotDrop)
    dropFallbackTimer = window.setTimeout(finishDotdotDrop, 250)

    requestAnimationFrame(() => {
      dragPreviewStyle.value = {
        ...dragPreviewStyle.value,
        top: `${placeholderRect.top}px`,
        width: `${placeholderRect.width}px`,
      }
    })
  }

  removeDragListeners = () => {
    window.removeEventListener('pointermove', moveDotdot)
    window.removeEventListener('pointerup', endDotdotDrag)
    window.removeEventListener('pointercancel', endDotdotDrag)
    window.removeEventListener('touchmove', preventPageScroll)
  }

  window.addEventListener('touchmove', preventPageScroll, { passive: false })
  window.addEventListener('pointermove', moveDotdot, { passive: false })
  window.addEventListener('pointerup', endDotdotDrag)
  window.addEventListener('pointercancel', endDotdotDrag)
}

onBeforeUnmount(() => {
  removeDragListeners?.()
})
</script>

<style lang="scss" scoped>
.page.cycleDotdot {
  gap: 12px;
  @include flexbox(column, flex-start, stretch);
  >h2{
    @include h2();
    font-weight: 600;
  }
  >.list{
    gap: 12px;
    width: 100%;
    @include flexbox(column, flex-start, stretch);
    >h5{
      color: $grey;
    }
    >ul{
      gap: 8px;
      min-height: 42px;
      user-select: none;
      -webkit-user-select: none;
      -webkit-touch-callout: none;
      @include flexbox(column, flex-start, stretch);
      >li{
        opacity: .4;
        gap: 12px;
        height: 42px;
        transition: opacity .2s, transform .2s;
        @include flexbox(row, center, center);
        &.show{
          opacity: 1;
        }
        &.drag-placeholder{
          opacity: 0;
        }
        &.dotdot-move{
          transition: transform .2s cubic-bezier(.2, .8, .2, 1);
        }
        >.option{
          @include flexbox(row, center, center);
          >button,
          >a{
            width: 30px;
            aspect-ratio: 1/1;
            @include flexbox(row, center, center);
            >svg{
              width: 16px;
            }
          }
          >button.drag{
            cursor: grab;
            touch-action: none;
          }
        }
      }
    }
    &.fixed{
      padding: 12px 0px;
      border-bottom: 1px solid $oat;
    }
  }
  >a{
    margin-top: 12px;
    width: 100%;
    font-weight: 600;
    background-color: $yellow-dark;
    text-align: center;
    padding: 18px 12px;
    border-radius: 12px;
    @include h3();
  }
}
.dotdot-drag-preview{
  z-index: 10;
  opacity: 1;
  gap: 12px;
  height: 42px;
  position: fixed;
  pointer-events: none;
  transform: scale(1.05);
  background-color: $background;
  box-shadow: 0px 2px 8px rgba(0,0,0,.1);
  @include flexbox(row, center, center);
  &.dropping{
    transform: scale(1);
    transition: top .2s cubic-bezier(.2, .8, .2, 1),
                width .2s cubic-bezier(.2, .8, .2, 1),
                transform .2s cubic-bezier(.2, .8, .2, 1);
  }
  >.option{
    @include flexbox(row, center, center);
    >span{
      width: 30px;
      aspect-ratio: 1/1;
      @include flexbox(row, center, center);
      >svg{
        width: 16px;
      }
    }
  }
}
</style>
