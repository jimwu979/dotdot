<template>
  <div class="component tagEditor">
    <p>拖動可編輯排序，點擊可編輯</p>
    <TransitionGroup
      ref="tagListElement"
      tag="div"
      name="tag"
      @selectstart.prevent
    >
      <button
        class="btn-click-effect"
        v-for="tag in displayedTagList"
        :key="tag.id"
        type="button"
        :class="{ 'drag-placeholder': draggedTagId === tag.id }"
        :data-tag-id="tag.id"
        @pointerdown="startTagInteraction($event, tag.id)"
      >
        {{ tag.name }}
      </button>
      <button
        key="add-tag"
        class="add-tag btn-click-effect"
        type="button"
        @click="openNewTagEditor"
      >
        <Plus />
      </button>
    </TransitionGroup>
  </div>

  <Teleport to="body">
    <button
      v-if="dragPreviewTag"
      ref="dragPreviewElement"
      :class="[ 'tag-drag-preview', { dropping: isDropping }]"
      :style="dragPreviewStyle"
      v-text="dragPreviewTag.name"
     />
    <div
      class="tag-editor-backdrop"
      :class="{ 'open': isTagEditorOpen, 'ready': isTagEditorReady }"
      @click.self="closeTagEditor"
    >
      <div class="tag-editor-dialog">
        <h2 v-if="isCreatingTag">新增標籤</h2>
        <label>
          標籤文字
          <input
            v-model="draftTagText"
            type="text"
          >
        </label>
        <button
          class="delete btn-click-effect"
          v-if="!isCreatingTag"
          @click="isDeleteConfirmOpen = true"
        >
          <Trash />
          刪除標籤
        </button>
        <div class="dialog-actions">
          <Btn
            text="取消"
            type="cancel"
            @click="closeTagEditor"
          />
          <Btn
            text="確定"
            type="confirm"
            :disabled="!draftTagText.trim()"
            @click="confirmTagEdit"
          />
        </div>
      </div>
    </div>

  </Teleport>

  <ConfirmDialog
    :open="isDeleteConfirmOpen"
    :message="`確定要刪除「${selectedTag?.name}」嗎？`"
    confirm-text="確定刪除"
    confirm-type="delete"
    @cancel="isDeleteConfirmOpen = false"
    @confirm="deleteSelectedTag"
  />
</template>

<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  ref,
  type ComponentPublicInstance,
  type CSSProperties,
} from 'vue'
import { Plus, Trash } from '@lucide/vue'
import Btn from '@/mobile/components/btn.vue'
import ConfirmDialog from '@/mobile/components/ConfirmDialog.vue'
import type { Tag } from '@/shared/stores/category'

interface TagRow {
  top: number
  centerY: number
  elements: HTMLButtonElement[]
}

const props = defineProps<{
  tags: Tag[]
  nextTagId: number
}>()

const emit = defineEmits<{
  'update:tags': [tags: Tag[]]
}>()

const tagListElement      = ref<ComponentPublicInstance | null>(null)
const dragPreviewElement  = ref<HTMLButtonElement | null>(null)
const draggedTagId        = ref<number | null>(null)
const dragOrder           = ref<number[] | null>(null)
const dragPreviewStyle    = ref<CSSProperties>({})
const dragPreviewTag      = ref<Tag | null>(null)
const isDropping          = ref(false)
const selectedTagId       = ref<number | null>(null)
const draftTagText        = ref('')
const isTagEditorOpen     = ref(false)
const isTagEditorReady    = ref(false)
const isCreatingTag       = ref(false)
const isDeleteConfirmOpen = ref(false)
let clearActiveInteraction: (() => void) | null = null
let tagEditorReadyTimer: number | undefined

const displayedTagList = computed<Tag[]>(() => {
  if (!dragOrder.value) return props.tags

  return dragOrder.value
    .map(tagId => props.tags.find(tag => tag.id === tagId))
    .filter((tag): tag is Tag => Boolean(tag))
})

const selectedTag = computed<Tag | undefined>(() => {
  return props.tags.find(tag => tag.id === selectedTagId.value)
})

const showTagEditor = () => {
  window.clearTimeout(tagEditorReadyTimer)
  isTagEditorReady.value = false
  isTagEditorOpen.value = true
  tagEditorReadyTimer = window.setTimeout(() => {
    if (isTagEditorOpen.value) isTagEditorReady.value = true
  }, 220)
}

const openTagEditor = (tagId: number) => {
  const tag = props.tags.find(tag => tag.id === tagId)

  if (!tag) return

  selectedTagId.value = tagId
  draftTagText.value  = tag.name
  isCreatingTag.value = false
  showTagEditor()
}

const openNewTagEditor = () => {
  selectedTagId.value = null
  draftTagText.value  = ''
  isCreatingTag.value = true
  showTagEditor()
}

const closeTagEditor = () => {
  window.clearTimeout(tagEditorReadyTimer)
  isTagEditorReady.value    = false
  isTagEditorOpen.value     = false
  isDeleteConfirmOpen.value = false
}

const confirmTagEdit = () => {
  const nextTagText = draftTagText.value.trim()
  if (!nextTagText) return
  if (isCreatingTag.value) {
    emit('update:tags', [
      ...props.tags,
      {
        id: props.nextTagId,
        index: props.tags.length + 1,
        name: nextTagText,
      },
    ])
    closeTagEditor()
    return
  }
  const tag = selectedTag.value
  if (!tag) return
  emit('update:tags', props.tags.map(tag => (
    tag.id === selectedTagId.value
      ? { ...tag, name: nextTagText }
      : tag
  )))
  closeTagEditor()
}

const deleteSelectedTag = () => {
  if (selectedTagId.value === null) return
  emit('update:tags', props.tags
    .filter(tag => tag.id !== selectedTagId.value)
    .map((tag, index) => ({ ...tag, index: index + 1 })),
  )
  closeTagEditor()
}

const getTargetIndex = (
  pointerX:    number,
  pointerY:    number,
  tagElements: HTMLButtonElement[],
) => {
  if (!tagElements.length) return 0

  const rows: TagRow[] = []

  tagElements.forEach((tagElement) => {
    const tagRect = tagElement.getBoundingClientRect()
    const currentRow = rows.at(-1)

    if (!currentRow || Math.abs(currentRow.top - tagRect.top) > 4) {
      rows.push({
        top:      tagRect.top,
        centerY:  tagRect.top + tagRect.height / 2,
        elements: [tagElement],
      })
      return
    }

    currentRow.elements.push(tagElement)
  })

  let targetRowIndex = rows.length - 1

  for (let index = 0; index < rows.length - 1; index += 1) {
    const rowBoundary = (rows[index].centerY + rows[index + 1].centerY) / 2

    if (pointerY < rowBoundary) {
      targetRowIndex = index
      break
    }
  }

  const targetRow = rows[targetRowIndex]
  const previousRowItemCount = rows
    .slice(0, targetRowIndex)
    .reduce((total, row) => total + row.elements.length, 0)
  const targetColumnIndex = targetRow.elements.findIndex((tagElement) => {
    const tagRect = tagElement.getBoundingClientRect()

    return pointerX < tagRect.left + tagRect.width / 2
  })

  return previousRowItemCount + (
    targetColumnIndex === -1
      ? targetRow.elements.length
      : targetColumnIndex
  )
}

const finishTagDrop = (tagId: number) => {
  const tagContainer = tagListElement.value?.$el as HTMLDivElement | undefined
  const placeholder = tagContainer?.querySelector<HTMLButtonElement>(
    `[data-tag-id="${tagId}"]`,
  )
  const placeholderRect = placeholder?.getBoundingClientRect()
  const previewRect = dragPreviewElement.value?.getBoundingClientRect()

  if (dragOrder.value) {
    const tagMap = new Map(props.tags.map(tag => [tag.id, tag]))

    const sortedTags = dragOrder.value
      .map(id => tagMap.get(id))
      .filter((tag): tag is Tag => Boolean(tag))
      .map((tag, index) => ({ ...tag, index: index + 1 }))

    emit('update:tags', sortedTags)
  }

  dragOrder.value = null

  const clearDragPreview = () => {
    dragPreviewTag.value   = null
    dragPreviewStyle.value = {}
    isDropping.value       = false
    draggedTagId.value     = null
  }

  if (!placeholderRect || !previewRect || !dragPreviewElement.value) {
    clearDragPreview()
    return
  }

  let dragFinished = false
  let dropFallbackTimer: number | undefined

  const finishPreviewDrop = () => {
    if (dragFinished) return

    dragFinished = true
    window.clearTimeout(dropFallbackTimer)
    dragPreviewElement.value?.removeEventListener('transitionend', finishPreviewDrop)
    clearDragPreview()
  }

  if (
    Math.abs(placeholderRect.top - previewRect.top) < 1
    && Math.abs(placeholderRect.left - previewRect.left) < 1
  ) {
    finishPreviewDrop()
    return
  }

  isDropping.value = true
  dragPreviewElement.value.addEventListener('transitionend', finishPreviewDrop)
  dropFallbackTimer = window.setTimeout(finishPreviewDrop, 250)

  requestAnimationFrame(() => {
    dragPreviewStyle.value = {
      ...dragPreviewStyle.value,
      top:    `${placeholderRect.top   }px`,
      left:   `${placeholderRect.left  }px`,
      width:  `${placeholderRect.width }px`,
      height: `${placeholderRect.height}px`,
    }
  })
}

const startTagInteraction = (event: PointerEvent, tagId: number) => {
  if (event.button !== 0 || clearActiveInteraction) return

  event.preventDefault()

  const tagElement     = event.currentTarget as HTMLButtonElement
  const tagRect        = tagElement.getBoundingClientRect()
  const startX         = event.clientX
  const startY         = event.clientY
  const pointerOffsetX = startX - tagRect.left
  const pointerOffsetY = startY - tagRect.top
  let isDragging       = false

  const preventPageScroll = (touchEvent: TouchEvent) => {
    if (isDragging) touchEvent.preventDefault()
  }

  const moveTag = (pointerEvent: PointerEvent) => {
    const moveDistance = Math.hypot(
      pointerEvent.clientX - startX,
      pointerEvent.clientY - startY,
    )

    if (!isDragging && moveDistance < 5) return

    if (!isDragging) {
      const tag = props.tags.find(item => item.id === tagId)

      if (!tag) return

      isDragging = true
      dragPreviewTag.value = tag
      draggedTagId.value = tagId
      dragOrder.value = props.tags.map(item => item.id)
      dragPreviewStyle.value = {
        top:    `${tagRect.top   }px`,
        left:   `${tagRect.left  }px`,
        width:  `${tagRect.width }px`,
        height: `${tagRect.height}px`,
      }
    }

    pointerEvent.preventDefault()
    dragPreviewStyle.value = {
      ...dragPreviewStyle.value,
      top:  `${pointerEvent.clientY - pointerOffsetY}px`,
      left: `${pointerEvent.clientX - pointerOffsetX}px`,
    }

    const tagContainer = tagListElement.value?.$el as HTMLDivElement | undefined
    const tagElements = Array.from(
      tagContainer?.querySelectorAll<HTMLButtonElement>('[data-tag-id]') ?? [],
    ).filter(tag => Number(tag.dataset.tagId) !== tagId)
    const targetIndex = getTargetIndex(
      pointerEvent.clientX,
      pointerEvent.clientY,
      tagElements,
    )
    const nextOrder = dragOrder.value?.filter(id => id !== tagId) ?? []

    nextOrder.splice(targetIndex, 0, tagId)

    if (nextOrder.join() !== dragOrder.value?.join()) {
      dragOrder.value = nextOrder
    }
  }

  const clearInteraction = () => {
    window.removeEventListener('pointermove',   moveTag)
    window.removeEventListener('pointerup',     endTagInteraction)
    window.removeEventListener('pointercancel', endTagInteraction)
    window.removeEventListener('touchmove',     preventPageScroll)
    clearActiveInteraction = null
  }

  const endTagInteraction = (pointerEvent: PointerEvent) => {
    clearInteraction()

    if (!isDragging) {
      if (pointerEvent.type !== 'pointercancel') openTagEditor(tagId)
      return
    }

    finishTagDrop(tagId)
  }

  clearActiveInteraction = clearInteraction
  window.addEventListener('touchmove',     preventPageScroll, { passive: false })
  window.addEventListener('pointermove',   moveTag, { passive: false })
  window.addEventListener('pointerup',     endTagInteraction)
  window.addEventListener('pointercancel', endTagInteraction)
}

onBeforeUnmount(() => {
  window.clearTimeout(tagEditorReadyTimer)
  clearActiveInteraction?.()
})
</script>

<style scoped lang="scss">
.component.tagEditor{
  gap: 4px;
  position: relative;
  border-radius: 12px;
  border: 1px solid $oat;
  padding: 32px 8px 12px;
  background-color: $white;
  @include flexbox(row, flex-start, flex-start);
  >p{
    top: 0;
    left: 8px;
    color: $grey-light;
    position: absolute;
  }
  >div{
    gap: 8px;
    width: 100%;
    flex-wrap: wrap;
    user-select: none;
    -webkit-user-select: none;
    -webkit-touch-callout: none;
    @include flexbox(row, flex-start, flex-start);
    >button{
      @include h3();
      color: $mustard;
      min-width: 30px;
      padding: 6px 12px;
      touch-action: none;
      border-radius: 6px;
      border: 1px solid $stone;
      transition: transform .1s;
      background-color: $background;
      @include flexbox(row, center, center);
      &:active:not(.drag-placeholder){
        transform: scale(1.15);
      }
      &.drag-placeholder{
        opacity: 0;
      }
      &.tag-move{
        transition: transform .2s cubic-bezier(.2, .8, .2, 1);
      }
      &.add-tag{
        touch-action: auto;
        >svg{
          stroke: $mustard;
        }
      }
    }
  }
}
.tag-drag-preview{
  z-index: 20;
  @include h3();
  color: $mustard;
  position: fixed;
  padding: 6px 12px;
  border-radius: 6px;
  pointer-events: none;
  transform: scale(1.15);
  border: 1px solid $stone;
  background-color: $background;
  @include flexbox(row, center, center);
  box-shadow: 0 2px 8px rgba(0, 0, 0, .1);
  &.dropping{
    transform: scale(1);
    transition: top .2s cubic-bezier(.2, .8, .2, 1),
                left .2s cubic-bezier(.2, .8, .2, 1),
                width .2s cubic-bezier(.2, .8, .2, 1),
                height .2s cubic-bezier(.2, .8, .2, 1),
                transform .2s cubic-bezier(.2, .8, .2, 1);
  }
}
.tag-editor-backdrop{
  inset: 0;
  opacity: 0;
  z-index: 30;
  padding: 20px;
  position: fixed;
  pointer-events: none;
  transition: opacity .2s;
  @include flexbox(row, center, center);
  background-color: rgba(42, 36, 24, .45);
  &.open{
    opacity: 1;
    pointer-events: auto;
    >div{
      opacity: 1;
      transform: scale(1);
      pointer-events: auto;
    }
  }
  >div{
    opacity: 0;
    width: 100%;
    padding: 24px;
    max-width: 420px;
    border-radius: 16px;
    pointer-events: none;
    transform: scale(.95);
    background-color: $white;
    transition: opacity .2s, transform .2s;
    box-shadow: 0 8px 30px rgba(42, 36, 24, .18);
    >h2{
      @include h2();
    }
    >.dialog-actions{
      gap: 8px;
      flex-wrap: wrap;
      margin-top: 24px;
      @include flexbox(row, flex-end, center);
    }
  }
}
.tag-editor-backdrop{
  &.open:not(.ready){
    pointer-events: none;
    >.tag-editor-dialog{
      pointer-events: none;
    }
  }
  >.tag-editor-dialog{
    >label{
      gap: 6px;
      color: $grey;
      margin-top: 20px;
      @include flexbox(column, flex-start, stretch);
      >input{
        width: 100%;
        height: 50px;
        color: $black;
        padding: 0 12px;
        border-radius: 8px;
        border: 1px solid $stone;
        background-color: $background;
        &:focus{
          border-color: $mustard;
        }
      }
    }
    >.delete{
      gap: 2px;
      color: $brown;
      margin-top: 24px;
      padding: 4px 12px;
      border-radius: 8px;
      background-color: $oat;
      border: 1px solid $stone;
      @include flexbox(row, center, center);
      >svg{
        width: 18px;
        stroke: $brown;
      }
    }
    >.dialog-actions{
      margin-top: 12px;
      >.btn:disabled{
        opacity: .5;
      }
    }
  }
}
</style>
