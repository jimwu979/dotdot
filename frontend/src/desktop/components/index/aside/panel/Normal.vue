<template>
  <div class="component normal-panel">
    <div ref="scrollElement" class="form">
      <div class="fields">
        <section class="date-field">
          <b>日期</b>
          <button class="btn-click-effect" type="button" @click="isDateModalOpen = true">
            <span>{{ formatDisplayDate(record.occurredAt) }}</span>
            <ChevronDown />
          </button>
        </section>
        <CategoryPicker v-model="record.categoryId" />
        <section class="tags">
          <b>標籤</b>
          <ul v-if="tags.length">
            <li
              v-for="tag in tags"
              :key="tag.id"
              :class="{ checked: record.tagIds.includes(tag.id) }"
            >
              <button class="btn-click-effect" type="button" @click="toggleTag(tag.id)">
                {{ tag.name }}
              </button>
              <b><Check /></b>
            </li>
          </ul>
          <p v-else>此類別尚無標籤</p>
        </section>
        <label class="note">
          <b>備註</b>
          <input v-model="record.note" type="text" placeholder="輸入備註" />
        </label>
      </div>
      <Calculator :amount="record.amount" @save="saveRecord" />
    </div>
    <span
      v-show="isScrollbarVisible"
      class="overlay-scrollbar"
      :style="scrollbarStyle"
    />
    <DateModal
      :open="isDateModalOpen"
      :selected-date="record.occurredAt"
      @cancel="isDateModalOpen = false"
      @confirm="confirmDate"
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
import { computed, reactive, ref, watch } from 'vue'
import { Check, ChevronDown } from '@lucide/vue'
import AsideDialog from '@/desktop/components/index/aside/Dialog.vue'
import Calculator from '@/desktop/components/index/aside/panel/Calculator.vue'
import CategoryPicker from '@/desktop/components/index/aside/panel/CategoryPicker.vue'
import DateModal from '@/desktop/components/index/aside/panel/DateModal.vue'
import { useOverlayScrollbar } from '@/desktop/utils/useOverlayScrollbar'
import { useCategoryStore } from '@/shared/stores/category'
import { useRecordStore, type RecordData } from '@/shared/stores/record'

const props = defineProps<{
  recordId?: number
}>()

const emit = defineEmits<{
  close: []
}>()

const categoryStore = useCategoryStore()
const recordStore = useRecordStore()
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
const record = reactive({
  occurredAt: getCurrentDate(),
  categoryId: getDefaultCategoryId(),
  tagIds: [] as number[],
  note: '',
  amount: 0,
  isAutomatic: false,
})
const errorMessage = ref('')
const isHydrating = ref(false)
const isDateModalOpen = ref(false)
const scrollElement = ref<HTMLDivElement | null>(null)
const { isScrollbarVisible, scrollbarStyle } = useOverlayScrollbar(scrollElement)
const category = computed(() => (
  categoryStore.categoryList.find(category => category.id === record.categoryId)
))
const tags = computed(() => (
  category.value?.tags.slice().sort((tagA, tagB) => tagA.index - tagB.index) ?? []
))

watch(() => record.categoryId, () => {
  if (isHydrating.value) return

  record.tagIds = []
})

watch(() => props.recordId, recordId => {
  if (recordId === undefined) return

  const sourceRecord = recordStore.recordList.find(record => record.id === recordId)
  if (!sourceRecord) return

  isHydrating.value = true
  Object.assign(record, {
    occurredAt: sourceRecord.occurredAt,
    categoryId: sourceRecord.categoryId,
    tagIds: [...sourceRecord.tagIds],
    note: sourceRecord.note,
    amount: sourceRecord.amount,
    isAutomatic: sourceRecord.isAutomatic,
  })
  isHydrating.value = false
}, { immediate: true })

const toggleTag = (tagId: number) => {
  record.tagIds = record.tagIds.includes(tagId)
    ? record.tagIds.filter(selectedTagId => selectedTagId !== tagId)
    : [...record.tagIds, tagId]
}
const formatDisplayDate = (date: string) => date.replaceAll('-', '/')
const confirmDate = (date: string) => {
  record.occurredAt = date
  isDateModalOpen.value = false
}
const saveRecord = (amount: number) => {
  if (!Number.isInteger(amount) || amount <= 0) {
    errorMessage.value = '金額需為大於 0 的整數'
    return
  }

  record.amount = amount
  const recordData: RecordData = {
    categoryId: record.categoryId,
    tagIds: [...record.tagIds],
    note: record.note,
    amount,
    isAutomatic: record.isAutomatic,
    occurredAt: record.occurredAt,
  }

  if (props.recordId === undefined) {
    recordStore.addRecord(recordData)
  } else if (!recordStore.updateRecord(props.recordId, recordData)) {
    errorMessage.value = '找不到這筆記帳資料'
    return
  }
  record.tagIds = []
  record.note = ''
  record.amount = 0
  errorMessage.value = ''
  emit('close')
}
</script>

<style lang="scss" scoped>
  .component.normal-panel{
    flex: 1;
    min-height: 0;
    position: relative;
    @include flexbox(column, flex-start, stretch);
    >.form{
      flex: 1;
      min-height: 0;
      overflow-y: auto;
      scrollbar-width: none;
      overscroll-behavior: contain;
      @include flexbox(column, flex-start, stretch);
      &::-webkit-scrollbar{
        display: none;
      }
      >.fields{
        gap: 18px;
        padding: 16px 18px 24px;
        @include flexbox(column, flex-start, stretch);
        >*{
          flex-shrink: 0;
        }
      }
      >.asideCalculator{
        flex-shrink: 0;
        border-right: 0;
        border-bottom: 0;
        border-left: 0;
        border-radius: 0;
      }
      >.fields>.date-field{
        >b{
          display: block;
          font-size: 15px;
          font-weight: 600;
          margin-bottom: 10px;
        }
        >button{
          gap: 10px;
          width: 100%;
          height: 46px;
          min-height: 46px;
          padding: 0 12px;
          border-radius: 10px;
          border: 1px solid $oat;
          background-color: $white;
          @include flexbox(row, flex-start, center);
          >span{
            font-weight: 600;
          }
          >svg{
            width: 17px;
            margin-left: auto;
          }
        }
      }
      >.fields>.tags{
        >b{
          display: block;
          font-size: 15px;
          font-weight: 600;
          margin-bottom: 10px;
        }
        >ul{
          gap: 12px;
          width: 100%;
          flex-wrap: wrap;
          @include flexbox(row, flex-start, flex-start);
          >li{
            position: relative;
            >button{
              color: $mustard;
              min-height: 34px;
              padding: 6px 10px;
              border-radius: 6px;
              border: 1px solid $stone;
              background-color: $white;
            }
            >b{
              width: 20px;
              opacity: 0;
              right: -8px;
              bottom: -8px;
              position: absolute;
              aspect-ratio: 1/1;
              border-radius: 50%;
              transition: opacity .2s;
              background-color: $yellow;
              @include flexbox(row, center, center);
              >svg{
                height: 70%;
                stroke: $black;
              }
            }
            &.checked{
              >button{
                background-color: $oat;
              }
              >b{
                opacity: 1;
              }
            }
          }
        }
        >p{
          color: $grey-light;
        }
      }
      >.fields>.note{
        >b{
          display: block;
          font-size: 15px;
          font-weight: 600;
          margin-bottom: 10px;
        }
        >input{
          width: 100%;
          height: 46px;
          padding: 0 12px;
          border-radius: 10px;
          border: 1px solid $oat;
          background-color: $white;
        }
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
</style>
