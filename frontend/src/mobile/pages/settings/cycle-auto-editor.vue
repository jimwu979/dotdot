<template>
  <div class="page cycleAutoEditor">
    <Breadcrumb
      :items="[
        { url: '/mobile/settings', text: '設定' },
        { url: '/mobile/settings', text: '週期' },
        { url: '/mobile/settings/cycle-auto', text: '自動記帳' },
        { url: '', text: automaticId === null ? '添加' : '編輯' },
      ]"
    />
    <main>

      <!-- 類別 -->
      <FormItem
        label="類別"
        :require="true"
      >
        <Category
          :category-id="automaticData.categoryId"
          @update:category-id="selectCategory"
        />
        <p
          v-if="categoryError"
          class="error-message"
          v-text="categoryError"
        />
      </FormItem>

      <!-- 標籤 -->
      <FormItem label="標籤">
        <Tag
          v-model:selected-tag-ids="automaticData.tagIds"
          :tags="tags"
        />
      </FormItem>

      <!-- 備註 -->
      <FormItem label="備註">
        <Note
          v-model="automaticData.note"
          placeholder="輸入這筆自動記帳的備註"
        />
      </FormItem>

      <!-- 金額 -->
      <FormItem
        class="input"
        label="金額"
        :require="true"
      >
        <input
          v-model.number="automaticData.amount"
          type="number"
          min="0"
          inputmode="decimal"
        >
        <p
          v-if="amountError"
          class="error-message"
          v-text="amountError"
        />
      </FormItem>

      <!-- 記帳週期 -->
      <FormItem
        label="記帳週期"
        :require="true"
      >
        <button
          type="button"
          :class="['disable-automatic', { checked: !automaticData.enabled }]"
          @click="automaticData.enabled = !automaticData.enabled"
        >
          <span><Check /></span>
          停用自動記帳
        </button>
        <AutomaticTiming
          v-model="automaticData.timing"
          :disabled="!automaticData.enabled"
        />
        <p
          v-if="timingError"
          class="error-message"
          v-text="timingError"
        />
      </FormItem>

      <!-- 按鈕 -->
      <div>
        <div class="btn-box">
          <Btn
            text="取消"
            type="cancel"
            @click="isCancelConfirmOpen = true"
          />
          <Btn
            text="儲存"
            type="confirm"
            @click="saveAutomatic"
          />
        </div>
        <button
          v-if="automaticId !== null"
          type="button"
          @click="isDeleteConfirmOpen = true"
        >
          <Trash />
          刪除此項目
        </button>
      </div>
    </main>
    <AppHeader />
    <ConfirmDialog
      :open="isCancelConfirmOpen"
      message="確定要取消編輯嗎？尚未儲存的變更將會遺失。"
      confirm-text="確定取消"
      @cancel="isCancelConfirmOpen = false"
      @confirm="cancelEdit"
    />
    <ConfirmDialog
      :open="isFormErrorDialogOpen"
      :message="formErrorMessage"
      confirm-text="知道了"
      :show-cancel="false"
      @cancel="isFormErrorDialogOpen = false"
      @confirm="isFormErrorDialogOpen = false"
    />
    <ConfirmDialog
      :open="isDeleteConfirmOpen"
      message="確定要刪除此項目嗎？"
      confirm-text="確認刪除"
      confirm-type="delete"
      @cancel="isDeleteConfirmOpen = false"
      @confirm="confirmDeleteAutomatic"
    />
  </div>
</template>

<script lang="ts" setup>
  import { computed, reactive, ref, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { Check, Trash } from '@lucide/vue'
  import AppHeader from '@/mobile/components/AppHeader.vue'
  import Breadcrumb from '@/mobile/components/Breadcrumb.vue'
  import Btn from '@/mobile/components/btn.vue'
  import ConfirmDialog from '@/mobile/components/ConfirmDialog.vue'
  import FormItem from '@/mobile/components/FormItem.vue'
  import Category from '@/mobile/components/record/Category.vue'
  import Note from '@/mobile/components/record/Note.vue'
  import Tag from '@/mobile/components/record/Tag.vue'
  import AutomaticTiming from '@/mobile/components/settings/cycle-auto-editor/AutomaticTiming.vue'
  import { useCategoryStore } from '@/shared/stores/category'
  import {
    useAutomaticStore,
    type AutomaticData,
    type AutomaticFrequency,
  } from '@/shared/stores/automatic'

  interface AutomaticEditorData {
    categoryId: number | null
    tagIds: number[]
    note: string
    amount: number | null
    enabled: boolean
    timing: {
      frequency: AutomaticFrequency
      weekdays: number[]
      monthDay: number | null
      time: string
    }
  }

  const route = useRoute()
  const router = useRouter()
  const categoryStore = useCategoryStore()
  const automaticStore = useAutomaticStore()
  const automaticId = ref<number | null>(null)
  const categoryError = ref('')
  const amountError = ref('')
  const timingError = ref('')
  const isCancelConfirmOpen = ref(false)
  const isFormErrorDialogOpen = ref(false)
  const isDeleteConfirmOpen = ref(false)
  const automaticData = reactive<AutomaticEditorData>({
    categoryId: null,
    tagIds: [],
    note: '',
    amount: null,
    enabled: true,
    timing: {
      frequency: 'daily',
      weekdays: [1, 2, 3, 4, 5],
      monthDay: 1,
      time: '08:30',
    },
  })

  const tags = computed(() => (
    categoryStore.categoryList
      .find(category => category.id === automaticData.categoryId)
      ?.tags
      .slice()
      .sort((tagA, tagB) => tagA.index - tagB.index) ?? []
  ))
  const formErrorMessage = computed(() => (
    categoryError.value || amountError.value || timingError.value
  ))

  const resetAutomaticData = () => {
    automaticId.value = null
    categoryError.value = ''
    amountError.value = ''
    timingError.value = ''
    isCancelConfirmOpen.value = false
    isFormErrorDialogOpen.value = false
    isDeleteConfirmOpen.value = false
    automaticData.categoryId = categoryStore.categoryList[0]?.id ?? null
    automaticData.tagIds = []
    automaticData.note = ''
    automaticData.amount = null
    automaticData.enabled = true
    automaticData.timing = {
      frequency: 'daily',
      weekdays: [1, 2, 3, 4, 5],
      monthDay: 1,
      time: '08:30',
    }
  }

  const loadAutomaticData = () => {
    resetAutomaticData()

    const queryId = Array.isArray(route.query.automaticId)
      ? route.query.automaticId[0]
      : route.query.automaticId

    if (typeof queryId !== 'string' || !queryId) return

    const id = Number(queryId)

    if (!Number.isInteger(id)) return

    const automatic = automaticStore.automaticList
      .find(automatic => automatic.id === id)
    const categoryExists = automatic
      ? categoryStore.categoryList.some(category => (
        category.id === automatic.record.categoryId
      ))
      : false

    if (!automatic || !categoryExists) return

    automaticId.value = automatic.id
    automaticData.categoryId = automatic.record.categoryId
    automaticData.tagIds = [...automatic.record.tagIds]
    automaticData.note = automatic.record.note
    automaticData.amount = automatic.record.amount
    automaticData.enabled = automatic.enabled
    automaticData.timing = {
      frequency: automatic.timing.frequency,
      weekdays: [...automatic.timing.weekdays],
      monthDay: automatic.timing.monthDay,
      time: automatic.timing.time,
    }
  }

  watch([
    () => route.query.automaticId,
    () => categoryStore.categoryList.map(category => category.id).join(','),
  ], loadAutomaticData, { immediate: true })

  const selectCategory = (categoryId: number) => {
    automaticData.categoryId = categoryId
    automaticData.tagIds = []
    categoryError.value = ''
  }

  const cancelEdit = () => {
    isCancelConfirmOpen.value = false
    router.back()
  }

  const validateTiming = () => {
    if (
      automaticData.timing.frequency === 'weekly'
      && automaticData.timing.weekdays.length === 0
    ) {
      return '每週記帳至少需要選擇一天'
    }

    if (
      automaticData.timing.frequency === 'monthly'
      && (
        automaticData.timing.monthDay === null
        || automaticData.timing.monthDay < 1
        || automaticData.timing.monthDay > 31
      )
    ) {
      return '請選擇有效的每月記帳日期'
    }

    const [hour, minute] = automaticData.timing.time.split(':').map(Number)

    if (
      !Number.isInteger(hour)
      || hour < 0
      || hour > 23
      || ![0, 15, 30].includes(minute)
    ) {
      return '請選擇有效的記帳時間'
    }

    return ''
  }

  const saveAutomatic = () => {
    categoryError.value = automaticData.categoryId === null
      ? '類別為必填欄位'
      : ''
    amountError.value = (
      automaticData.amount === null
      || !Number.isFinite(automaticData.amount)
      || automaticData.amount < 0
    )
      ? '請輸入有效的金額'
      : ''
    timingError.value = validateTiming()

    if (formErrorMessage.value) {
      isFormErrorDialogOpen.value = true
      return
    }

    const categoryId = automaticData.categoryId
    const amount = automaticData.amount

    if (categoryId === null || amount === null) return

    const nextAutomaticData: AutomaticData = {
      enabled: automaticData.enabled,
      timing: {
        frequency: automaticData.timing.frequency,
        weekdays: [...automaticData.timing.weekdays],
        monthDay: automaticData.timing.monthDay,
        time: automaticData.timing.time,
      },
      record: {
        categoryId,
        tagIds: [...automaticData.tagIds],
        note: automaticData.note,
        amount,
      },
    }

    if (automaticId.value === null) {
      automaticStore.addAutomatic(nextAutomaticData)
    } else {
      automaticStore.updateAutomatic(automaticId.value, nextAutomaticData)
    }

    router.back()
  }

  const confirmDeleteAutomatic = () => {
    isDeleteConfirmOpen.value = false

    if (automaticId.value === null) return

    if (automaticStore.deleteAutomatic(automaticId.value)) router.back()
  }
</script>

<style lang="scss" scoped>
  .page.cycleAutoEditor{
    >main{
      gap: 28px;
      @include flexbox(column, flex-start, stretch);
      >.form-item{
        .disable-automatic{
          gap: 6px;
          color: $grey;
          margin-bottom: 12px;
          @include flexbox(row, flex-start, center);
          >span{
            width: 24px;
            flex: 0 0 auto;
            aspect-ratio: 1/1;
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
          &.checked{
            >span{
              border-color: $yellow-dark;
              background-color: $yellow;
              >svg{
                opacity: 1;
              }
            }
          }
        }
        :deep(>div > .component.category){
          width: 100%;
        }
        &.input{
          :deep(>div > input){
            width: 100%;
            height: 50px;
            padding: 0 12px;
            border-radius: 8px;
            border: 1px solid $stone;
            background-color: $white;
          }
        }
        :deep(>div > .error-message){
          color: $red;
          margin-top: 4px;
          @include p();
        }
      }
      >div{
        gap: 24px;
        @include flexbox(column, flex-start, center);
        >.btn-box{
          gap: 12px;
          width: 100%;
          @include flexbox(row, flex-end, center);
        }
        >button{
          gap: 2px;
          color: $brown;
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
      }
    }
  }
</style>
