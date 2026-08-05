<template>
  <main class="page category">
    <Breadcrumb
      :items="[
        { url: '/mobile/settings', text: '設定' },
        { url: '', text: '類別' },
      ]"
    />
    <main>
      <div>
        <button
          :class="{ 'open': !isExpense }"
          @click="setIsExpense(false)"
          v-text="'收入'"
         />
        <button
          :class="{ 'open': isExpense }"
          @click="setIsExpense(true)"
          v-text="'支出'"
        />
      </div>
      <TransitionGroup
        ref="categoryListElement"
        tag="ul"
        name="category"
        @selectstart.prevent
      >
        <li
          v-for="i in displayedCategoryList"
          :key="i.id"
          :class="{ 'drag-placeholder': draggedCategoryId === i.id }"
          :data-category-id="i.id"
        >
          <div :style="{ backgroundColor: categoryColors[i.color] }">
            <component :is="i.icon" />
          </div>
          <h6>{{ i.name }}</h6>
          <router-link
            class="btn edit"
            :to="{
              path: '/mobile/settings/category-editor',
              query: { id: i.id },
            }"
          >
            <Pencil />
          </router-link>
          <button
            class="btn drag"
            type="button"
            @pointerdown="startCategoryDrag($event, i.id)"
          >
            <GripVertical />
          </button>
        </li>
      </TransitionGroup>
      <Teleport to="body">
        <div
          v-if="dragPreviewCategory"
          ref="dragPreviewElement"
          :class="[
            'category-drag-preview',
            { dropping: isDropping },
          ]"
          :style="dragPreviewStyle"
        >
          <div :style="{ backgroundColor: categoryColors[dragPreviewCategory.color] }">
            <component :is="dragPreviewCategory.icon" />
          </div>
          <h6>{{ dragPreviewCategory.name }}</h6>
          <span>
            <Pencil />
          </span>
          <span>
            <GripVertical />
          </span>
        </div>
      </Teleport>
      <router-link
        class="add-category"
        :to="{
          path: '/mobile/settings/category-editor',
          query: { isExpense: String(isExpense) },
        }"
      >
        添加新類別
      </router-link>
    </main>
    <AppHeader />
  </main>
</template>

<script lang="ts" setup>
import {
  computed,
  ref,
  type ComponentPublicInstance,
  type CSSProperties,
} from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { GripVertical, Pencil } from '@lucide/vue'
import AppHeader from '@/mobile/components/AppHeader.vue'
import Breadcrumb from '@/mobile/components/Breadcrumb.vue'
import { categoryColors } from '@/shared/colors/category'
import { useCategoryStore, type Category } from '@/shared/stores/category'

const route = useRoute()
const router = useRouter()
const categoryStore = useCategoryStore()
const categoryListElement = ref<ComponentPublicInstance | null>(null)
const dragPreviewElement = ref<HTMLDivElement | null>(null)
const draggedCategoryId = ref<number | null>(null)
const dragOrder = ref<number[] | null>(null)
const dragPreviewStyle = ref<CSSProperties>({})
const dragPreviewCategory = ref<Category | null>(null)
const isDropping = ref(false)

const isExpense = computed<boolean>(() => route.query.isExpense !== 'false')

const setIsExpense = (isExpense: boolean) => {
  router.replace({
    query: {
      ...route.query,
      isExpense: String(isExpense),
    },
  })
}

const sortedCategoryList = computed<Category[]>(() => {
  return categoryStore.categoryList
    .filter(category => category.isExpense === isExpense.value)
    .sort((a, b) => a.index - b.index)
})

const displayedCategoryList = computed<Category[]>(() => {
  if (!dragOrder.value) return sortedCategoryList.value

  return dragOrder.value
    .map(categoryId => sortedCategoryList.value.find(category => category.id === categoryId))
    .filter((category): category is Category => Boolean(category))
})

const startCategoryDrag = (event: PointerEvent, categoryId: number) => {
  if (event.button !== 0 || draggedCategoryId.value !== null) return

  event.preventDefault()

  const categoryElement = (event.currentTarget as HTMLButtonElement)
    .closest<HTMLLIElement>('[data-category-id]')

  if (!categoryElement) return

  const categoryRect = categoryElement.getBoundingClientRect()
  const pointerOffsetY = event.clientY - categoryRect.top
  const category = categoryStore.categoryList.find(category => category.id === categoryId)

  if (!category) return

  dragPreviewCategory.value = category
  draggedCategoryId.value = categoryId
  dragOrder.value = sortedCategoryList.value.map(category => category.id)
  dragPreviewStyle.value = {
    top: `${categoryRect.top}px`,
    left: `${categoryRect.left}px`,
    width: `${categoryRect.width}px`,
  }

  const preventPageScroll = (touchEvent: TouchEvent) => {
    touchEvent.preventDefault()
  }

  const moveCategory = (pointerEvent: PointerEvent) => {
    pointerEvent.preventDefault()
    dragPreviewStyle.value = {
      ...dragPreviewStyle.value,
      top: `${pointerEvent.clientY - pointerOffsetY}px`,
    }

    const categoryList = categoryListElement.value?.$el as HTMLUListElement | undefined
    const categoryElements = Array.from(
      categoryList?.querySelectorAll<HTMLLIElement>('[data-category-id]') ?? [],
    ).filter(category => Number(category.dataset.categoryId) !== categoryId)
    let targetIndex = categoryElements.findIndex((category) => {
      const categoryRect = category.getBoundingClientRect()

      return pointerEvent.clientY < categoryRect.top + categoryRect.height / 2
    })

    if (targetIndex === -1) {
      targetIndex = categoryElements.length
    }

    const nextOrder = dragOrder.value?.filter(id => id !== categoryId) ?? []
    nextOrder.splice(targetIndex, 0, categoryId)

    if (nextOrder.join() !== dragOrder.value?.join()) {
      dragOrder.value = nextOrder
    }
  }

  const endCategoryDrag = () => {
    window.removeEventListener('pointermove', moveCategory)
    window.removeEventListener('pointerup', endCategoryDrag)
    window.removeEventListener('pointercancel', endCategoryDrag)
    window.removeEventListener('touchmove', preventPageScroll)

    const categoryList = categoryListElement.value?.$el as HTMLUListElement | undefined
    const placeholder = categoryList?.querySelector<HTMLLIElement>(
      `[data-category-id="${categoryId}"]`,
    )
    const placeholderRect = placeholder?.getBoundingClientRect()
    const previewRect = dragPreviewElement.value?.getBoundingClientRect()

    if (dragOrder.value) {
      categoryStore.updateCategoryOrder(dragOrder.value)
    }

    draggedCategoryId.value = null
    dragOrder.value = null

    const clearDragPreview = () => {
      dragPreviewCategory.value = null
      dragPreviewStyle.value = {}
      isDropping.value = false
    }

    if (!placeholderRect || !previewRect || !dragPreviewElement.value) {
      clearDragPreview()
      return
    }

    let dragFinished = false
    let dropFallbackTimer: number | undefined

    const finishCategoryDrop = () => {
      if (dragFinished) return

      dragFinished = true
      window.clearTimeout(dropFallbackTimer)
      dragPreviewElement.value?.removeEventListener('transitionend', finishCategoryDrop)
      clearDragPreview()
    }

    if (
      Math.abs(placeholderRect.top - previewRect.top) < 1
    ) {
      finishCategoryDrop()
      return
    }

    isDropping.value = true
    dragPreviewElement.value.addEventListener('transitionend', finishCategoryDrop)
    dropFallbackTimer = window.setTimeout(finishCategoryDrop, 250)

    requestAnimationFrame(() => {
      dragPreviewStyle.value = {
        ...dragPreviewStyle.value,
        top: `${placeholderRect.top}px`,
        width: `${placeholderRect.width}px`,
      }
    })
  }

  window.addEventListener('touchmove', preventPageScroll, { passive: false })
  window.addEventListener('pointermove', moveCategory, { passive: false })
  window.addEventListener('pointerup', endCategoryDrag)
  window.addEventListener('pointercancel', endCategoryDrag)
}
</script>

<style lang="scss" scoped>
.page.category {
  @include flexbox(column, flex-start, stretch);
  >main{
    margin-top: 24px;
    @include flexbox(column, flex-start, stretch);
    >div{
      gap: 4px;
      padding: 4px;
      border-radius: 12px;
      background-color: $oat;
      border: 1px solid $stone;
      @include flexbox(row, center, center);
      >button{
        flex: 1;
        color: $grey;
        height: 44px;
        @include h3();
        border-radius: 8px;
        position: relative;
        transition: color .2s, background-color .2s, box-shadow .2s;
        &.open{
          color: $black;
          background-color: $white;
          box-shadow: 0 3px 10px rgba(73, 62, 28, .1);
        }
      }
    }
    >ul{
      margin-top: 12px;
      user-select: none;
      -webkit-user-select: none;
      -webkit-touch-callout: none;
      @include flexbox(column, flex-start, stretch);
      >li{
        height: 52px;
        padding: 0 12px;
        border-radius: 8px;
        transition: opacity .2s, transform .2s;
        @include flexbox(row, flex-start, center);
        &.drag-placeholder{
          opacity: 0;
        }
        &.category-move{
          transition: transform .2s cubic-bezier(.2, .8, .2, 1);
        }
        >div{
          width: 36px;
          aspect-ratio: 1/1;
          border-radius: 50%;
          @include flexbox(row, center, center);
          >svg{
            width: 18px;
            stroke: $white;
          }
        }
        >h6{
          flex: 1;
          margin-left: 12px;
        }
        >.btn{
          width: 40px;
          @include flexbox(row, center, center);
          >svg{
            width: 20px;
          }
        }
        >a{
        }
        >button{
          cursor: grab;
          touch-action: none;
        }
      }
    }
    >.add-category{
      height: 52px;
      @include h3();
      margin-top: 12px;
      border-radius: 8px;
      background-color: $yellow;
      @include flexbox(row, center, center);
    }
  }
}
.category-drag-preview{
  z-index: 10;
  height: 52px;
  padding: 0 12px;
  position: fixed;
  border-radius: 8px;
  pointer-events: none;
  transform: scale(1.025);
  background-color: $background;
  box-shadow: 0px 2px 8px rgba(0,0,0,.1);
  @include flexbox(row, flex-start, center);
  &.dropping{
    transform: scale(1);
    transition: top .2s cubic-bezier(.2, .8, .2, 1),
                width .2s cubic-bezier(.2, .8, .2, 1),
                transform .2s cubic-bezier(.2, .8, .2, 1);
  }
  >div{
    width: 36px;
    aspect-ratio: 1/1;
    border-radius: 50%;
    @include flexbox(row, center, center);
    >svg{
      width: 18px;
      stroke: $white;
    }
  }
  >h6{
    flex: 1;
    margin-left: 12px;
  }
  >span{
    width: 40px;
    @include flexbox(row, center, center);
    >svg{
      width: 20px;
    }
  }
}
</style>
