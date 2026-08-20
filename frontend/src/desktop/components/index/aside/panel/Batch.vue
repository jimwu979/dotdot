<template>
  <div ref="batchPanelElement" class="component batch-panel">
    <div ref="scrollElement" class="scroll-area">
      <div class="cardList">
      <article v-for="card in cards" :key="card.id">
        <header>
          <button class="date btn-click-effect" type="button" @click="datePickerCardId = card.id">
            {{ formatDisplayDate(card.occurredAt) }}
            <ChevronDown />
          </button>
          <button
            class="delete btn-click-effect"
            type="button"
            aria-label="刪除卡片"
            @click="requestDeleteCard(card.id)"
          >
            <Trash2 />
          </button>
        </header>
        <TransitionGroup tag="ul" name="batch-item" @selectstart.prevent>
          <li
            v-for="item in getDisplayedItems(card)"
            :key="item.id"
            :class="{ 'drag-placeholder': draggedItemId === item.id }"
            :data-card-id="card.id"
            :data-item-id="item.id"
          >
            <button class="category btn-click-effect" type="button" @click="openCategoryPicker(card.id, item.id)">
              <span
                v-if="getCategory(item.categoryId)"
                :style="{ backgroundColor: categoryColors[getCategory(item.categoryId)!.color] }"
              >
                <component :is="categoryIcons[getCategory(item.categoryId)!.icon]" />
              </span>
              <b>{{ getCategory(item.categoryId)?.name }}</b>
              <ChevronDown />
            </button>
            <b v-for="tag in getVisibleTags(item)" :key="tag.id" class="tag">
              {{ tag.name }}
            </b>
            <b v-if="getSelectedTags(item).length > 3" class="tag">...</b>
            <input v-model="item.note" type="text" placeholder="備註" aria-label="備註" />
            <input
              v-model.number="item.amount"
              type="number"
              min="0"
              inputmode="numeric"
              placeholder="金額"
              aria-label="金額"
              :class="{ error: hasAttemptedSave && !isValidAmount(item.amount) }"
            />
            <button type="button" class="deleteItem btn-click-effect" aria-label="刪除項目" @click="requestDeleteItem(card.id, item.id)">
              <Trash2 />
            </button>
            <button
              class="drag"
              type="button"
              aria-label="拖動項目"
              @pointerdown="startItemDrag($event, card.id, item.id)"
            >
              <GripVertical />
            </button>
          </li>
        </TransitionGroup>
        <button class="addItem btn-click-effect" type="button" @click="addItem(card)">
          <Plus />新增項目
        </button>
      </article>
      <button class="addCard btn-click-effect" type="button" @click="addCard">
        <Plus />新增日期
      </button>
      </div>
      <button class="save btn-click-effect" type="button" @click="saveRecords">儲存</button>
    </div>
    <span
      v-show="isScrollbarVisible"
      class="overlay-scrollbar"
      :style="scrollbarStyle"
    />
    <Teleport to="body">
      <div
        v-if="dragPreviewItem"
        ref="dragPreviewElement"
        class="batch-item-drag-preview"
        :class="{ dropping: isDropping }"
        :style="dragPreviewStyle"
      >
        <div class="category">
          <span
            v-if="getCategory(dragPreviewItem.categoryId)"
            :style="{ backgroundColor: categoryColors[getCategory(dragPreviewItem.categoryId)!.color] }"
          >
            <component :is="categoryIcons[getCategory(dragPreviewItem.categoryId)!.icon]" />
          </span>
          <b>{{ getCategory(dragPreviewItem.categoryId)?.name }}</b>
          <ChevronDown />
        </div>
        <b v-for="tag in getVisibleTags(dragPreviewItem)" :key="tag.id" class="tag">
          {{ tag.name }}
        </b>
        <b v-if="getSelectedTags(dragPreviewItem).length > 3" class="tag">...</b>
        <input
          class="note"
          type="text"
          :value="dragPreviewItem.note"
          placeholder="備註"
          readonly
          tabindex="-1"
        />
        <input
          class="amount"
          type="text"
          :value="dragPreviewItem.amount"
          placeholder="金額"
          readonly
          tabindex="-1"
        />
        <span><Trash2 /></span>
        <span><GripVertical /></span>
      </div>
    </Teleport>
    <DateModal
      :open="datePickerCardId !== null"
      :selected-date="selectedDateCard?.occurredAt ?? getCurrentDate()"
      @cancel="datePickerCardId = null"
      @confirm="confirmDate"
    />
    <CategoryModal
      :open="categoryPickerTarget !== null"
      :selected-category-id="selectedCategoryItem?.categoryId ?? getDefaultCategoryId()"
      :selected-tag-ids="selectedCategoryItem?.tagIds ?? []"
      @cancel="categoryPickerTarget = null"
      @confirm="confirmCategory"
    />
    <AsideDialog
      :open="deleteTarget !== null"
      title=""
      :message="deleteDialogMessage"
      confirm-type="delete"
      @cancel="deleteTarget = null"
      @confirm="confirmDelete"
    />
    <AsideDialog
      :open="errorMessage !== ''"
      :message="errorMessage"
      :show-cancel="false"
      @cancel="errorMessage = ''"
      @confirm="errorMessage = ''"
    />
  </div>
</template>

<script lang="ts" setup>
import {
  computed,
  onBeforeUnmount,
  ref,
  type CSSProperties,
} from 'vue'
import { ChevronDown, GripVertical, Plus, Trash2 } from '@lucide/vue'
import AsideDialog from '@/desktop/components/index/aside/Dialog.vue'
import CategoryModal from '@/desktop/components/index/aside/panel/CategoryModal.vue'
import DateModal from '@/desktop/components/index/aside/panel/DateModal.vue'
import { useOverlayScrollbar } from '@/desktop/utils/useOverlayScrollbar'
import { categoryColors } from '@/shared/colors/category'
import { categoryIcons } from '@/shared/icons/category'
import { useCategoryStore } from '@/shared/stores/category'
import { useRecordStore } from '@/shared/stores/record'

interface BatchItem {
  id: number
  categoryId: number
  tagIds: number[]
  note: string
  amount: number | ''
}

interface BatchCard {
  id: number
  occurredAt: string
  items: BatchItem[]
}

type DeleteTarget = {
  type: 'card'
  cardId: number
} | {
  type: 'item'
  cardId: number
  itemId: number
}

const emit = defineEmits<{
  close: []
}>()

const categoryStore = useCategoryStore()
const recordStore = useRecordStore()
let nextCardId = 1
let nextItemId = 1
const getCurrentDate = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}
const getDefaultCategoryId = () => (
  categoryStore.categoryList
    .filter(category => category.isExpense)
    .sort((categoryA, categoryB) => categoryA.index - categoryB.index)[0]?.id ?? 0
)
const createItem = (): BatchItem => ({
  id: nextItemId++,
  categoryId: getDefaultCategoryId(),
  tagIds: [],
  note: '',
  amount: '',
})
const createCard = (): BatchCard => ({
  id: nextCardId++,
  occurredAt: getCurrentDate(),
  items: [createItem()],
})
const cards = ref<BatchCard[]>([createCard()])
const datePickerCardId = ref<number | null>(null)
const categoryPickerTarget = ref<{ cardId: number, itemId: number } | null>(null)
const deleteTarget = ref<DeleteTarget | null>(null)
const errorMessage = ref('')
const hasAttemptedSave = ref(false)
const batchPanelElement = ref<HTMLDivElement | null>(null)
const scrollElement = ref<HTMLDivElement | null>(null)
const { isScrollbarVisible, scrollbarStyle } = useOverlayScrollbar(scrollElement)
const dragPreviewElement = ref<HTMLDivElement | null>(null)
const draggedCardId = ref<number | null>(null)
const draggedItemId = ref<number | null>(null)
const dragOrder = ref<number[] | null>(null)
const dragPreviewItem = ref<BatchItem | null>(null)
const dragPreviewStyle = ref<CSSProperties>({})
const isDropping = ref(false)
let removeDragListeners: (() => void) | null = null
const selectedDateCard = computed(() => (
  cards.value.find(card => card.id === datePickerCardId.value)
))
const selectedCategoryItem = computed(() => {
  if (!categoryPickerTarget.value) return undefined

  return cards.value
    .find(card => card.id === categoryPickerTarget.value?.cardId)
    ?.items.find(item => item.id === categoryPickerTarget.value?.itemId)
})
const deleteDialogMessage = computed(() => (
  deleteTarget.value?.type === 'card'
    ? '確定刪除這張卡片'
    : '確定刪除這筆項目'
))

const formatDisplayDate = (date: string) => date.replaceAll('-', '/')
const getCategory = (categoryId: number) => (
  categoryStore.categoryList.find(category => category.id === categoryId)
)
const getSelectedTags = (item: BatchItem) => (
  getCategory(item.categoryId)?.tags
    .filter(tag => item.tagIds.includes(tag.id))
    .sort((tagA, tagB) => tagA.index - tagB.index) ?? []
)
const getVisibleTags = (item: BatchItem) => getSelectedTags(item).slice(0, 3)
const isValidAmount = (amount: number | '') => (
  typeof amount === 'number' && Number.isInteger(amount) && amount > 0
)
const getDisplayedItems = (card: BatchCard) => {
  if (draggedCardId.value !== card.id || !dragOrder.value) return card.items

  return dragOrder.value
    .map(itemId => card.items.find(item => item.id === itemId))
    .filter((item): item is BatchItem => Boolean(item))
}
const addItem = (card: BatchCard) => card.items.push(createItem())
const deleteItem = (card: BatchCard, itemId: number) => {
  card.items = card.items.filter(item => item.id !== itemId)
}
const addCard = () => cards.value.push(createCard())
const deleteCard = (cardId: number) => {
  cards.value = cards.value.filter(card => card.id !== cardId)
}
const openCategoryPicker = (cardId: number, itemId: number) => {
  categoryPickerTarget.value = { cardId, itemId }
}
const confirmCategory = (categoryId: number, tagIds: number[]) => {
  if (selectedCategoryItem.value) {
    selectedCategoryItem.value.categoryId = categoryId
    selectedCategoryItem.value.tagIds = [...tagIds]
  }

  categoryPickerTarget.value = null
}
const confirmDate = (date: string) => {
  if (selectedDateCard.value) selectedDateCard.value.occurredAt = date

  datePickerCardId.value = null
}
const requestDeleteCard = (cardId: number) => {
  deleteTarget.value = { type: 'card', cardId }
}
const requestDeleteItem = (cardId: number, itemId: number) => {
  deleteTarget.value = { type: 'item', cardId, itemId }
}
const confirmDelete = () => {
  const target = deleteTarget.value

  if (!target) return
  if (target.type === 'card') {
    deleteCard(target.cardId)
  } else {
    const card = cards.value.find(card => card.id === target.cardId)

    if (card) deleteItem(card, target.itemId)
  }

  deleteTarget.value = null
}
const startItemDrag = (event: PointerEvent, cardId: number, itemId: number) => {
  if (event.button !== 0 || draggedItemId.value !== null) return

  event.preventDefault()

  const itemElement = (event.currentTarget as HTMLButtonElement)
    .closest<HTMLLIElement>('[data-item-id]')
  const card = cards.value.find(card => card.id === cardId)
  const item = card?.items.find(item => item.id === itemId)

  if (!itemElement || !card || !item) return

  const itemRect = itemElement.getBoundingClientRect()
  const pointerOffsetY = event.clientY - itemRect.top

  dragPreviewItem.value = item
  draggedCardId.value = cardId
  draggedItemId.value = itemId
  dragOrder.value = card.items.map(item => item.id)
  dragPreviewStyle.value = {
    top: `${itemRect.top}px`,
    left: `${itemRect.left}px`,
    width: `${itemRect.width}px`,
  }

  const preventPageScroll = (touchEvent: TouchEvent) => {
    touchEvent.preventDefault()
  }

  const moveItem = (pointerEvent: PointerEvent) => {
    pointerEvent.preventDefault()
    dragPreviewStyle.value = {
      ...dragPreviewStyle.value,
      top: `${pointerEvent.clientY - pointerOffsetY}px`,
    }

    const itemElements = Array.from(
      batchPanelElement.value?.querySelectorAll<HTMLLIElement>(
        `li[data-card-id="${cardId}"][data-item-id]`,
      ) ?? [],
    ).filter(element => Number(element.dataset.itemId) !== itemId)
    let targetIndex = itemElements.findIndex((element) => {
      const elementRect = element.getBoundingClientRect()

      return pointerEvent.clientY < elementRect.top + elementRect.height / 2
    })

    if (targetIndex === -1) targetIndex = itemElements.length

    const nextOrder = dragOrder.value?.filter(id => id !== itemId) ?? []

    nextOrder.splice(targetIndex, 0, itemId)
    if (nextOrder.join() !== dragOrder.value?.join()) dragOrder.value = nextOrder
  }

  const endItemDrag = () => {
    removeDragListeners?.()
    removeDragListeners = null

    const placeholder = batchPanelElement.value?.querySelector<HTMLLIElement>(
      `li[data-card-id="${cardId}"][data-item-id="${itemId}"]`,
    )
    const placeholderRect = placeholder?.getBoundingClientRect()
    const previewRect = dragPreviewElement.value?.getBoundingClientRect()

    if (dragOrder.value) {
      card.items = dragOrder.value
        .map(orderedItemId => card.items.find(cardItem => cardItem.id === orderedItemId))
        .filter((cardItem): cardItem is BatchItem => Boolean(cardItem))
    }

    draggedCardId.value = null
    draggedItemId.value = null
    dragOrder.value = null

    const clearDragPreview = () => {
      dragPreviewItem.value = null
      dragPreviewStyle.value = {}
      isDropping.value = false
    }

    if (!placeholderRect || !previewRect || !dragPreviewElement.value) {
      clearDragPreview()
      return
    }

    let dragFinished = false
    let dropFallbackTimer: number | undefined
    const finishItemDrop = () => {
      if (dragFinished) return

      dragFinished = true
      window.clearTimeout(dropFallbackTimer)
      dragPreviewElement.value?.removeEventListener('transitionend', finishItemDrop)
      clearDragPreview()
    }

    if (Math.abs(placeholderRect.top - previewRect.top) < 1) {
      finishItemDrop()
      return
    }

    isDropping.value = true
    dragPreviewElement.value.addEventListener('transitionend', finishItemDrop)
    dropFallbackTimer = window.setTimeout(finishItemDrop, 250)

    requestAnimationFrame(() => {
      dragPreviewStyle.value = {
        ...dragPreviewStyle.value,
        top: `${placeholderRect.top}px`,
        width: `${placeholderRect.width}px`,
      }
    })
  }

  removeDragListeners = () => {
    window.removeEventListener('pointermove', moveItem)
    window.removeEventListener('pointerup', endItemDrag)
    window.removeEventListener('pointercancel', endItemDrag)
    window.removeEventListener('touchmove', preventPageScroll)
  }
  window.addEventListener('touchmove', preventPageScroll, { passive: false })
  window.addEventListener('pointermove', moveItem, { passive: false })
  window.addEventListener('pointerup', endItemDrag)
  window.addEventListener('pointercancel', endItemDrag)
}
onBeforeUnmount(() => removeDragListeners?.())
const saveRecords = () => {
  const records = cards.value.flatMap(card => card.items.map(item => ({ ...item, occurredAt: card.occurredAt })))

  hasAttemptedSave.value = true
  if (records.some(record => !isValidAmount(record.amount))) {
    errorMessage.value = '每個項目的金額都需為大於 0 的整數'
    return
  }

  records.forEach(record => recordStore.addRecord({
    categoryId: record.categoryId,
    tagIds: [...record.tagIds],
    note: record.note,
    amount: Number(record.amount),
    isAutomatic: false,
    occurredAt: record.occurredAt,
  }))
  cards.value = [createCard()]
  errorMessage.value = ''
  hasAttemptedSave.value = false
  emit('close')
}
</script>

<style lang="scss" scoped>
  .component.batch-panel{
    flex: 1;
    min-height: 0;
    overflow: hidden;
    position: relative;
    @include flexbox(column, flex-start, stretch);
    >.scroll-area{
      flex: 1;
      padding: 16px 12px;
      min-height: 0;
      overflow-y: auto;
      scrollbar-width: none;
      overscroll-behavior: contain;
      @include flexbox(column, flex-start, stretch);
      &::-webkit-scrollbar{
        display: none;
      }
      >.cardList{
      flex: 0 0 auto;
      gap: 14px;
      min-height: calc(100% - 62px);
      @include flexbox(column, flex-start, stretch);
      >article{
        padding: 12px 0;
        &+article{
          border-top: 1px solid $oat;
        }
        >header{
          display: grid;
          align-items: center;
          margin-bottom: 12px;
          grid-template-columns: 36px 1fr 36px;
          >.date{
            color: $brown;
            gap: 5px;
            height: 36px;
            padding: 0 12px;
            border-radius: 9px;
            border: 1px solid $oat;
            grid-column: 2;
            justify-self: center;
            background-color: transparent;
            @include flexbox(row, center, center);
            >svg{
              width: 16px;
            }
          }
          >.delete{
            width: 36px;
            height: 36px;
            grid-column: 3;
            border-radius: 9px;
            @include flexbox(row, center, center);
            >svg{
              width: 17px;
            }
          }
        }
        >ul{
          user-select: none;
          -webkit-user-select: none;
          -webkit-touch-callout: none;
          @include flexbox(column, flex-start, stretch);
          >li{
            gap: 5px;
            padding: 6px 12px;
            transition: opacity .2s, transform .2s;
            @include flexbox(row, flex-start, center);
            &.drag-placeholder{
              opacity: 0;
            }
            &.batch-item-move{
              transition: transform .2s cubic-bezier(.2, .8, .2, 1);
            }
            >input{
              height: 38px;
              min-width: 0;
              padding: 0 7px;
              border-radius: 8px;
              border: 1px solid $oat;
              background-color: $background;
              &.error{
                border-color: $red;
              }
              &[type='number']{
                appearance: textfield;
                -moz-appearance: textfield;
                &::-webkit-inner-spin-button,
                &::-webkit-outer-spin-button{
                  margin: 0;
                  appearance: none;
                  -webkit-appearance: none;
                }
              }
            }
            >.category{
              gap: 5px;
              width: 108px;
              height: 38px;
              flex: 0 0 108px;
              min-width: 0;
              padding: 0 6px;
              border-radius: 8px;
              border: 1px solid $oat;
              background-color: $background;
              @include flexbox(row, flex-start, center);
              >span{
                width: 25px;
                flex: 0 0 25px;
                aspect-ratio: 1/1;
                border-radius: 50%;
                @include flexbox(row, center, center);
                >svg{
                  width: 15px;
                  stroke: $white;
                }
              }
              >b{
                flex: 1;
                min-width: 0;
                overflow: hidden;
                font-size: 14px;
                font-weight: 600;
                white-space: nowrap;
                text-overflow: ellipsis;
              }
              >svg{
                width: 13px;
                flex: 0 0 13px;
              }
            }
            >.tag{
              color: $mustard;
              padding: 2px 4px;
              flex: 0 0 auto;
              font-size: 11px;
              line-height: 16px;
              white-space: nowrap;
              border-radius: 4px;
              border: 1px solid $mustard;
              background-color: $background;
            }
            >input:first-of-type{
              flex: 1;
            }
            >input:last-of-type{
              width: 70px;
              flex: 0 0 70px;
              text-align: right;
            }
            >.deleteItem,
            >.drag{
              width: 28px;
              height: 36px;
              flex: 0 0 28px;
              border-radius: 7px;
              @include flexbox(row, center, center);
              >svg{
                width: 16px;
              }
            }
            >.drag{
              color: $grey;
              cursor: grab;
              touch-action: none;
              &:active{
                cursor: grabbing;
              }
            }
          }
        }
        >.addItem{
          gap: 5px;
          width: 100%;
          height: 36px;
          color: $brown;
          margin-top: 10px;
          border-radius: 9px;
          border: 1px dashed $stone;
          background-color: $yellow;
          @include flexbox(row, center, center);
          >svg{
            stroke: $brown;
            width: 16px;
          }
        }
      }
      >.addCard{
        gap: 6px;
        height: 44px;
        border-radius: 11px;
        background-color: $oat;
        border: 1px solid $stone;
        @include flexbox(row, center, center);
        >svg{
          width: 18px;
        }
      }
    }
      >.save{
        height: 48px;
        flex: 0 0 48px;
        margin-top: 14px;
        font-weight: 600;
        border-radius: 12px;
        background-color: $yellow;
      }
    }
    >.overlay-scrollbar{
      top: 0;
      right: 2px;
      width: 4px;
      z-index: 2;
      position: absolute;
      border-radius: 99px;
      pointer-events: none;
      background-color: rgba($black, .28);
    }
  }
  .batch-item-drag-preview{
    z-index: 50;
    gap: 5px;
    height: 50px;
    padding: 6px 12px;
    position: fixed;
    border-radius: 8px;
    pointer-events: none;
    transform: scale(1.025);
    animation: batch-item-drag-enter .2s ease;
    background-color: $white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, .1);
    @include flexbox(row, flex-start, center);
    &.dropping{
      transform: scale(1);
      transition: top .2s cubic-bezier(.2, .8, .2, 1),
                  width .2s cubic-bezier(.2, .8, .2, 1),
                  transform .2s cubic-bezier(.2, .8, .2, 1);
    }
    >.category{
      gap: 5px;
      width: 108px;
      height: 38px;
      flex: 0 0 108px;
      min-width: 0;
      padding: 0 6px;
      border-radius: 8px;
      border: 1px solid $oat;
      background-color: $background;
      @include flexbox(row, flex-start, center);
      >span{
        width: 25px;
        flex: 0 0 25px;
        aspect-ratio: 1/1;
        border-radius: 50%;
        @include flexbox(row, center, center);
        >svg{
          width: 15px;
          stroke: $white;
        }
      }
      >b{
        flex: 1;
        min-width: 0;
        overflow: hidden;
        font-size: 14px;
        font-weight: 600;
        text-align: center;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
      >svg{
        width: 13px;
        flex: 0 0 13px;
      }
    }
    >.tag{
      color: $mustard;
      padding: 2px 4px;
      flex: 0 0 auto;
      font-size: 11px;
      line-height: 16px;
      white-space: nowrap;
      border-radius: 4px;
      border: 1px solid $mustard;
      background-color: $background;
    }
    >.note,
    >.amount{
      height: 38px;
      min-width: 0;
      padding: 0 7px;
      overflow: hidden;
      border-radius: 8px;
      white-space: nowrap;
      text-overflow: ellipsis;
      border: 1px solid $oat;
      background-color: $background;
    }
    >.note{
      flex: 1;
    }
    >.amount{
      width: 70px;
      flex: 0 0 70px;
      text-align: right;
    }
    >span{
      width: 28px;
      height: 36px;
      flex: 0 0 28px;
      @include flexbox(row, center, center);
      >svg{
        width: 16px;
      }
      &:last-child{
        color: $grey;
      }
    }
  }
  @keyframes batch-item-drag-enter{
    from{
      opacity: 0;
      transform: scale(1);
    }
    to{
      opacity: 1;
      transform: scale(1.025);
    }
  }
</style>
