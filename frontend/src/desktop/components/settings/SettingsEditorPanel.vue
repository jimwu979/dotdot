<template>
  <section class="component settings-editor-panel" :class="{ open: editor !== null }">
    <header>
      <button class="btn-click-effect back" type="button" @click="emit('close')">
        <ChevronLeft />
        返回
      </button>
      <h2>{{ panelTitle }}</h2>
      <button
        v-if="editingId !== null"
        class="btn-click-effect delete"
        type="button"
        @click="isDeleteConfirmOpen = true"
      >
        刪除
      </button>
      <span v-else />
    </header>
    <div id="settings-editor-overlays" class="settings-editor-overlays" />

    <form v-if="editor?.kind === 'dotdot'" @submit.prevent="saveDotdot">
      <CategoryPicker
        required
        three-row-viewport
        :model-value="recordData.categoryId"
        @update:model-value="selectRecordCategory"
      />
      <SettingsTagSelector
        v-model:selected-tag-ids="recordData.tagIds"
        :tags="availableTags"
      />
      <label>
        <span>備註</span>
        <input v-model="recordData.note" type="text" placeholder="輸入這筆點點記帳的備註">
      </label>
      <label>
        <span>金額 <b>*</b></span>
        <input v-model.number="recordData.amount" class="no-spinner" type="number" min="0" inputmode="decimal">
      </label>
      <section class="display-timing-field">
        <b>顯示時機 <i>*</i></b>
        <DisplayTiming v-model="dotdotDisplayTiming" desktop />
      </section>
      <p v-if="formError" class="error-message">{{ formError }}</p>
      <footer class="form-footer">
        <button class="btn-click-effect save" type="submit">儲存</button>
      </footer>
    </form>

    <form v-else-if="editor?.kind === 'automatic'" @submit.prevent="saveAutomatic">
      <CategoryPicker
        required
        three-row-viewport
        :model-value="recordData.categoryId"
        @update:model-value="selectRecordCategory"
      />
      <SettingsTagSelector
        v-model:selected-tag-ids="recordData.tagIds"
        :tags="availableTags"
      />
      <label>
        <span>備註</span>
        <input v-model="recordData.note" type="text" placeholder="輸入這筆自動記帳的備註">
      </label>
      <label>
        <span>金額 <b>*</b></span>
        <input v-model.number="recordData.amount" class="no-spinner" type="number" min="0" inputmode="decimal">
      </label>
      <section class="automatic-timing-field">
        <b>記帳週期 <i>*</i></b>
        <AutomaticTiming v-model="automaticTiming" desktop />
      </section>
      <p v-if="formError" class="error-message">{{ formError }}</p>
      <footer class="form-footer automatic-footer">
        <button
          class="automatic-enabled"
          :class="{ checked: automaticData.enabled }"
          type="button"
          @click="automaticData.enabled = !automaticData.enabled"
        >
          <span><Check /></span>
          啟用自動記帳
        </button>
        <button class="btn-click-effect save" type="submit">儲存</button>
      </footer>
    </form>

    <form v-else-if="editor?.kind === 'category'" @submit.prevent="saveCategory">
      <label>
        <span>名稱 <b>*</b></span>
        <input v-model="categoryData.name" type="text">
      </label>
      <section class="category-type-field">
        <b>類別 <i>*</i></b>
        <div>
          <button
            :class="{ selected: !categoryData.isExpense }"
            type="button"
            @click="categoryData.isExpense = false"
          >
            收入
          </button>
          <button
            :class="{ selected: categoryData.isExpense }"
            type="button"
            @click="categoryData.isExpense = true"
          >
            支出
          </button>
        </div>
      </section>
      <section class="category-editor-field">
        <b>圖示 <i>*</i></b>
        <IconEditor
          v-model:icon="categoryData.icon"
          v-model:color-id="categoryData.color"
        />
      </section>
      <section class="category-editor-field">
        <b>標籤</b>
        <TagEditor
          v-model:tags="categoryData.tags"
          :next-tag-id="nextTagId"
          desktop
          overlay-target="#settings-editor-overlays"
        />
      </section>
      <p v-if="formError" class="error-message">{{ formError }}</p>
      <footer class="form-footer">
        <button class="btn-click-effect save" type="submit">儲存</button>
      </footer>
    </form>
    <SettingsConfirmDialog
      :open="isDeleteConfirmOpen"
      :message="deleteDialogMessage"
      @cancel="isDeleteConfirmOpen = false"
      @confirm="confirmDeleteItem"
    />
  </section>
</template>

<script lang="ts" setup>
import { computed, reactive, ref, watch } from 'vue'
import { Check, ChevronLeft } from '@lucide/vue'
import CategoryPicker from '@/desktop/components/index/aside/panel/CategoryPicker.vue'
import SettingsConfirmDialog from '@/desktop/components/settings/SettingsConfirmDialog.vue'
import SettingsTagSelector from '@/desktop/components/settings/SettingsTagSelector.vue'
import AutomaticTiming from '@/mobile/components/settings/cycle-auto-editor/AutomaticTiming.vue'
import DisplayTiming from '@/mobile/components/settings/cycle-dotdot-editor/DisplayTiming.vue'
import IconEditor from '@/mobile/components/settings/type-edit/IconEditor.vue'
import TagEditor from '@/mobile/components/settings/type-edit/TagEditor.vue'
import {
  categoryColorList,
  type CategoryColorId,
} from '@/shared/colors/category'
import {
  categoryIconList,
  type CategoryIconName,
} from '@/shared/icons/category'
import {
  useAutomaticStore,
  type AutomaticData,
  type AutomaticFrequency,
} from '@/shared/stores/automatic'
import {
  useCategoryStore,
  type CategoryData,
  type Tag,
} from '@/shared/stores/category'
import { useDotdotStore, type DotdotData } from '@/shared/stores/dotdot'

export type SettingsEditorTarget = {
  kind: 'dotdot' | 'automatic' | 'category'
  id?: number
  isExpense?: boolean
} | null

const props = defineProps<{
  editor: SettingsEditorTarget
}>()
const emit = defineEmits<{
  close: []
}>()
const categoryStore = useCategoryStore()
const dotdotStore = useDotdotStore()
const automaticStore = useAutomaticStore()
const formError = ref('')
const editingId = ref<number | null>(null)
const isDeleteConfirmOpen = ref(false)
const recordData = reactive({
  categoryId: 0,
  tagIds: [] as number[],
  note: '',
  amount: null as number | null,
})
const dotdotData = reactive({
  fixed: false,
  weekdays: [1, 2, 3, 4, 5],
  startTime: '08:30',
  endTime: '09:30',
})
const automaticData = reactive<{
  enabled: boolean
  frequency: AutomaticFrequency
  weekdays: number[]
  monthDay: number | null
  time: string
}>({
  enabled: true,
  frequency: 'daily',
  weekdays: [1, 2, 3, 4, 5],
  monthDay: 1,
  time: '08:30',
})
const categoryData = reactive<{
  name: string
  isExpense: boolean
  icon: CategoryIconName
  color: CategoryColorId
  tags: Tag[]
}>({
  name: '',
  isExpense: true,
  icon: categoryIconList[0],
  color: categoryColorList[0],
  tags: [],
})

const sortedCategories = computed(() => categoryStore.categoryList
  .slice()
  .sort((categoryA, categoryB) => (
    Number(categoryA.isExpense) - Number(categoryB.isExpense)
    || categoryA.index - categoryB.index
  )),
)
const availableTags = computed(() => categoryStore.categoryList
  .find(category => category.id === recordData.categoryId)
  ?.tags.slice().sort((tagA, tagB) => tagA.index - tagB.index) ?? [],
)
const panelTitle = computed(() => {
  const action = editingId.value === null ? '添加' : '編輯'

  if (props.editor?.kind === 'dotdot') return `${action}點點記帳`
  if (props.editor?.kind === 'automatic') return `${action}自動記帳`
  if (props.editor?.kind === 'category') return `${action}類別`

  return ''
})
const dotdotDisplayTiming = computed({
  get: () => ({
    permanent: dotdotData.fixed,
    weekdays: dotdotData.weekdays,
    startTime: dotdotData.startTime,
    endTime: dotdotData.endTime,
  }),
  set: (timing: {
    permanent: boolean
    weekdays: number[]
    startTime: string
    endTime: string
  }) => {
    dotdotData.fixed = timing.permanent
    dotdotData.weekdays = [...timing.weekdays]
    dotdotData.startTime = timing.startTime
    dotdotData.endTime = timing.endTime
  },
})
const automaticTiming = computed({
  get: () => ({
    frequency: automaticData.frequency,
    weekdays: automaticData.weekdays,
    monthDay: automaticData.monthDay,
    time: automaticData.time,
  }),
  set: (timing: {
    frequency: AutomaticFrequency
    weekdays: number[]
    monthDay: number | null
    time: string
  }) => {
    automaticData.frequency = timing.frequency
    automaticData.weekdays = [...timing.weekdays]
    automaticData.monthDay = timing.monthDay
    automaticData.time = timing.time
  },
})
const nextTagId = computed(() => Math.max(
  0,
  ...categoryStore.categoryList.flatMap(category => category.tags.map(tag => tag.id)),
  ...categoryData.tags.map(tag => tag.id),
) + 1)
const deleteItemName = computed(() => {
  if (props.editor?.kind === 'dotdot') return '點點記帳'
  if (props.editor?.kind === 'automatic') return '自動記帳'
  if (props.editor?.kind === 'category') return '類別'

  return '項目'
})
const deleteDialogMessage = computed(() => `確定要刪除這個${deleteItemName.value}嗎？`)

const resetRecordData = () => {
  recordData.categoryId = sortedCategories.value[0]?.id ?? 0
  recordData.tagIds = []
  recordData.note = ''
  recordData.amount = null
}
const loadEditor = () => {
  formError.value = ''
  editingId.value = null
  isDeleteConfirmOpen.value = false
  resetRecordData()

  if (!props.editor) return

  if (props.editor.kind === 'dotdot') {
    dotdotData.fixed = false
    dotdotData.weekdays = [1, 2, 3, 4, 5]
    dotdotData.startTime = '08:30'
    dotdotData.endTime = '09:30'
    const item = dotdotStore.dotdotList.find(item => item.id === props.editor?.id)

    if (!item) return
    editingId.value = item.id
    recordData.categoryId = item.record.categoryId
    recordData.tagIds = [...item.record.tagIds]
    recordData.note = item.record.note
    recordData.amount = item.record.amount
    dotdotData.fixed = item.fixed
    dotdotData.weekdays = [...item.displayTiming.weekdays]
    dotdotData.startTime = item.displayTiming.startTime
    dotdotData.endTime = item.displayTiming.endTime
    return
  }

  if (props.editor.kind === 'automatic') {
    automaticData.enabled = true
    automaticData.frequency = 'daily'
    automaticData.weekdays = [1, 2, 3, 4, 5]
    automaticData.monthDay = 1
    automaticData.time = '08:30'
    const item = automaticStore.automaticList.find(item => item.id === props.editor?.id)

    if (!item) return
    editingId.value = item.id
    recordData.categoryId = item.record.categoryId
    recordData.tagIds = [...item.record.tagIds]
    recordData.note = item.record.note
    recordData.amount = item.record.amount
    automaticData.enabled = item.enabled
    automaticData.frequency = item.timing.frequency
    automaticData.weekdays = [...item.timing.weekdays]
    automaticData.monthDay = item.timing.monthDay
    automaticData.time = item.timing.time
    return
  }

  categoryData.name = ''
  categoryData.isExpense = props.editor.isExpense ?? true
  categoryData.icon = categoryIconList[0]
  categoryData.color = categoryColorList[0]
  categoryData.tags = []
  const category = categoryStore.categoryList.find(item => item.id === props.editor?.id)

  if (!category) return
  editingId.value = category.id
  categoryData.name = category.name
  categoryData.isExpense = category.isExpense
  categoryData.icon = category.icon
  categoryData.color = category.color
  categoryData.tags = category.tags.map(tag => ({ ...tag }))
}
const selectRecordCategory = (categoryId: number) => {
  recordData.categoryId = categoryId
  recordData.tagIds = []
  formError.value = ''
}
const validateRecord = () => {
  if (!categoryStore.categoryList.some(category => category.id === recordData.categoryId)) {
    return '請選擇類別'
  }
  if (recordData.amount === null || !Number.isFinite(recordData.amount) || recordData.amount < 0) {
    return '請輸入有效的金額'
  }

  return ''
}
const saveDotdot = () => {
  formError.value = validateRecord()
  if (!formError.value && !dotdotData.fixed && dotdotData.weekdays.length === 0) {
    formError.value = '請至少選擇一個顯示日'
  }
  if (formError.value || recordData.amount === null) return

  const data: DotdotData = {
    fixed: dotdotData.fixed,
    displayTiming: {
      weekdays: [...dotdotData.weekdays],
      startTime: dotdotData.startTime,
      endTime: dotdotData.endTime,
    },
    record: {
      categoryId: recordData.categoryId,
      tagIds: [...recordData.tagIds],
      note: recordData.note,
      amount: recordData.amount,
    },
  }

  if (editingId.value === null) dotdotStore.addDotdot(data)
  else dotdotStore.updateDotdot(editingId.value, data)
  emit('close')
}
const saveAutomatic = () => {
  formError.value = validateRecord()
  if (
    !formError.value
    && automaticData.frequency === 'weekly'
    && automaticData.weekdays.length === 0
  ) formError.value = '每週記帳至少需要選擇一天'
  if (
    !formError.value
    && automaticData.frequency === 'monthly'
    && (
      automaticData.monthDay === null
      || automaticData.monthDay < 1
      || automaticData.monthDay > 31
    )
  ) formError.value = '請輸入 1 到 31 日之間的日期'
  if (formError.value || recordData.amount === null) return

  const data: AutomaticData = {
    enabled: automaticData.enabled,
    timing: {
      frequency: automaticData.frequency,
      weekdays: [...automaticData.weekdays],
      monthDay: automaticData.frequency === 'monthly' ? automaticData.monthDay : null,
      time: automaticData.time,
    },
    record: {
      categoryId: recordData.categoryId,
      tagIds: [...recordData.tagIds],
      note: recordData.note,
      amount: recordData.amount,
    },
  }

  if (editingId.value === null) automaticStore.addAutomatic(data)
  else automaticStore.updateAutomatic(editingId.value, data)
  emit('close')
}
const saveCategory = () => {
  const name = categoryData.name.trim()

  formError.value = name ? '' : '類別名稱為必填欄位'
  if (formError.value) return

  const data: CategoryData = {
    name,
    isExpense: categoryData.isExpense,
    icon: categoryData.icon,
    color: categoryData.color,
    tags: categoryData.tags.map(tag => ({ ...tag })),
  }

  if (editingId.value === null) categoryStore.addCategory(data)
  else categoryStore.updateCategory(editingId.value, data)
  emit('close')
}
const confirmDeleteItem = () => {
  isDeleteConfirmOpen.value = false
  if (editingId.value === null) return

  if (props.editor?.kind === 'dotdot') dotdotStore.deleteDotdot(editingId.value)
  if (props.editor?.kind === 'automatic') automaticStore.deleteAutomatic(editingId.value)
  if (props.editor?.kind === 'category') categoryStore.deleteCategory(editingId.value)
  emit('close')
}

watch(() => props.editor, loadEditor, { immediate: true, deep: true })
</script>

<style lang="scss" scoped>
.component.settings-editor-panel{
  top: 0;
  z-index: 5;
  right: 0;
  left: calc(220px + 420px);
  height: 100%;
  position: absolute;
  transform: translateX(100%);
  transition: transform .3s ease;
  border-left: 1px solid $oat;
  background-color: $background;
  box-shadow: -16px 0 36px rgba($black,.12);
  @include flexbox(column, flex-start, stretch);
  &.open{
    transform: translateX(0);
  }
  >header{
    height: 62px;
    flex: 0 0 62px;
    padding: 0 16px;
    display: grid;
    align-items: center;
    grid-template-columns: 90px 1fr 90px;
    border-bottom: 1px solid $oat;
    background-color: $white;
    >button{
      height: 36px;
      gap: 2px;
      color: $mustard;
      font-weight: 600;
      border-radius: 9px;
      @include flexbox(row, center, center);
      >svg{
        width: 17px;
      }
      &.delete{
        color: $red;
      }
    }
    >h2{
      text-align: center;
      font-size: 18px;
      font-weight: 600;
    }
  }
  >.settings-editor-overlays{
    inset: 0;
    z-index: 8;
    position: absolute;
    pointer-events: none;
  }
  >form{
    flex: 1;
    gap: 24px;
    min-height: 0;
    overflow-y: auto;
    padding: 28px 24px 40px;
    overscroll-behavior: contain;
    @include flexbox(column, flex-start, stretch);
    >label{
      gap: 9px;
      min-width: 0;
      @include flexbox(column, flex-start, stretch);
      >span,
      >legend{
        font-weight: 600;
        >b{
          color: $red;
        }
      }
      >small{
        color: $grey;
        @include small();
      }
    }
    input[type='text'],
    input[type='number'],
    input[type='time'],
    select{
      width: 100%;
      min-height: 46px;
      padding: 10px 12px;
      border-radius: 9px;
      border: 1px solid $stone;
      background-color: $white;
      &:focus{
        outline: none;
        border-color: $mustard;
        box-shadow: 0 0 0 3px rgba($mustard,.1);
      }
    }
    input.no-spinner{
      appearance: textfield;
      -moz-appearance: textfield;
      &::-webkit-inner-spin-button,
      &::-webkit-outer-spin-button{
        margin: 0;
        appearance: none;
        -webkit-appearance: none;
      }
    }
    >.display-timing-field,
    >.automatic-timing-field,
    >.category-editor-field{
      gap: 12px;
      @include flexbox(column, flex-start, stretch);
      >b{
        font-weight: 600;
        >i{
          color: $red;
        }
      }
    }
    >.display-timing-field,
    >.category-editor-field{
      :deep(.lightbox){
        z-index: 10;
        padding-bottom: 0;
      }
    }
    >.category-type-field{
      gap: 12px;
      @include flexbox(column, flex-start, stretch);
      >b{
        font-weight: 600;
        >i{
          color: $red;
        }
      }
      >div{
        gap: 20px;
        @include flexbox(row, flex-start, center);
        >button{
          position: relative;
          padding-left: 28px;
          &:before,
          &:after{
            left: 0;
            content: '';
            position: absolute;
            aspect-ratio: 1/1;
            border-radius: 50%;
          }
          &:before{
            width: 24px;
            top: calc(50% - 12px);
            border: 1px solid $brown;
          }
          &:after{
            left: 4px;
            width: 16px;
            opacity: 0;
            top: calc(50% - 8px);
            transform: scale(.6);
            transition: opacity .2s, transform .2s;
            background-color: $brown;
          }
          &.selected:after{
            opacity: 1;
            transform: scale(1);
          }
        }
      }
    }
    >.error-message{
      color: $red;
      margin-top: -12px;
      @include small();
    }
    >.form-footer{
      gap: 16px;
      width: 100%;
      @include flexbox(column, flex-start, stretch);
      >.automatic-enabled{
        gap: 8px;
        align-self: flex-start;
        @include flexbox(row, flex-start, center);
        >span{
          width: 24px;
          height: 24px;
          border-radius: 4px;
          border: 1px solid $grey;
          background-color: $white;
          @include flexbox(row, center, center);
          >svg{
            width: 18px;
            opacity: 0;
            stroke: $black;
            transition: opacity .2s;
          }
        }
        &.checked >span{
          border-color: $yellow-dark;
          background-color: $yellow;
          >svg{
            opacity: 1;
          }
        }
      }
      >.save{
        width: 100%;
        height: 48px;
        flex: 0 0 48px;
        font-weight: 600;
        border-radius: 10px;
        background-color: $yellow;
      }
    }
  }
}
</style>
