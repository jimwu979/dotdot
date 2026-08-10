<template>
  <div class="page cycleDotdotEditor">
    <Breadcrumb
      :items="[
        { url: '/mobile/settings', text: '設定' },
        { url: '/mobile/settings', text: '週期' },
        { url: '/mobile/settings/cycle-dotdot', text: '點點記帳' },
        { url: '', text: '編輯' },
      ]"
    />
    <main>

      <!-- 類別 -->
      <FormItem
        :label="'類別'"
        :require="true"
      >
        <Category
          :category-id="dotdotData.categoryId"
          @update:category-id="selectCategory"
        />
        <p
          v-if="categoryError"
          class="error-message"
          v-text="categoryError"
        />
      </FormItem>

      <!-- 標籤 -->
      <FormItem :label="'標籤'">
        <Tag
          v-model:selected-tag-ids="dotdotData.tagIds"
          :tags="tags"
        />
      </FormItem>

      <!-- 備註 -->
      <FormItem :label="'備註'">
        <Note
          v-model="dotdotData.note"
          placeholder="輸入這筆點點記帳的備註"
        />
      </FormItem>

      <!-- 金額 -->
      <FormItem
        class="input"
        :label="'金額'"
        :require="true"
      >
        <input
          v-model.number="dotdotData.amount"
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

      <!-- 顯示時機 -->
      <FormItem
        :label="'顯示時機'"
        :require="true"
      >
        <DisplayTiming v-model="dotdotData.displayTiming" />
      </FormItem>

      <!-- 按鈕 -->
      <div>
        <div class="btn-box">
          <btn
            text="取消"
            type="cancel"
            @click="isCancelConfirmOpen = true"
          />
          <btn
            text="儲存"
            type="confirm"
            @click="saveDotdot"
          />
        </div>
      </div>

    </main>
    <AppHeader
      :right-action="dotdotId !== null ? 'delete' : undefined"
      @delete="isDeleteConfirmOpen = true"
    />
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
      @confirm="confirmDeleteDotdot"
    />
  </div>
</template>

<script lang="ts" setup>
  import { computed, reactive, ref, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import AppHeader from '@/mobile/components/AppHeader.vue'
  import Breadcrumb from '@/mobile/components/Breadcrumb.vue'
  import ConfirmDialog from '@/mobile/components/ConfirmDialog.vue'
  import FormItem from '@/mobile/components/FormItem.vue'
  import btn from '@/mobile/components/btn.vue'
  import Category from '@/mobile/components/record/Category.vue'
  import Note from '@/mobile/components/record/Note.vue'
  import Tag from '@/mobile/components/record/Tag.vue'
  import DisplayTiming from '@/mobile/components/settings/cycle-dotdot-editor/DisplayTiming.vue'
  import { useCategoryStore } from '@/shared/stores/category'
  import { useDotdotStore, type DotdotData } from '@/shared/stores/dotdot'

  interface DotdotEditorData {
    categoryId: number | null
    tagIds: number[]
    note: string
    amount: number | null
    displayTiming: {
      permanent: boolean
      weekdays: number[]
      startTime: string
      endTime: string
    }
  }

  const route = useRoute()
  const router = useRouter()
  const categoryStore = useCategoryStore()
  const dotdotStore = useDotdotStore()
  const dotdotId = ref<number | null>(null)
  const categoryError = ref('')
  const amountError = ref('')
  const isCancelConfirmOpen = ref(false)
  const isFormErrorDialogOpen = ref(false)
  const isDeleteConfirmOpen = ref(false)
  const dotdotData = reactive<DotdotEditorData>({
    categoryId: null,
    tagIds: [],
    note: '',
    amount: null,
    displayTiming: {
      permanent: false,
      weekdays: [1, 2, 3, 4, 5],
      startTime: '08:30',
      endTime: '09:30',
    },
  })

  const tags = computed(() => (
    categoryStore.categoryList
      .find(category => category.id === dotdotData.categoryId)
      ?.tags
      .slice()
      .sort((tagA, tagB) => tagA.index - tagB.index) ?? []
  ))
  const formErrorMessage = computed(() => (
    categoryError.value || amountError.value
  ))

  const resetDotdotData = () => {
    dotdotId.value = null
    categoryError.value = ''
    amountError.value = ''
    isCancelConfirmOpen.value = false
    isFormErrorDialogOpen.value = false
    isDeleteConfirmOpen.value = false
    dotdotData.categoryId = categoryStore.categoryList[0]?.id ?? null
    dotdotData.tagIds = []
    dotdotData.note = ''
    dotdotData.amount = null
    dotdotData.displayTiming = {
      permanent: false,
      weekdays: [1, 2, 3, 4, 5],
      startTime: '08:30',
      endTime: '09:30',
    }
  }

  const loadDotdotData = () => {
    resetDotdotData()

    const queryId = Array.isArray(route.query.dotdotId)
      ? route.query.dotdotId[0]
      : route.query.dotdotId

    if (typeof queryId !== 'string' || !queryId) return

    const id = Number(queryId)

    if (!Number.isInteger(id)) return

    const dotdot = dotdotStore.dotdotList.find(dotdot => dotdot.id === id)
    const categoryExists = dotdot
      ? categoryStore.categoryList.some(category => (
        category.id === dotdot.record.categoryId
      ))
      : false

    if (!dotdot || !categoryExists) return

    dotdotId.value = dotdot.id
    dotdotData.categoryId = dotdot.record.categoryId
    dotdotData.tagIds = [...dotdot.record.tagIds]
    dotdotData.note = dotdot.record.note
    dotdotData.amount = dotdot.record.amount
    dotdotData.displayTiming = {
      permanent: dotdot.fixed,
      weekdays: [...dotdot.displayTiming.weekdays],
      startTime: dotdot.displayTiming.startTime,
      endTime: dotdot.displayTiming.endTime,
    }
  }

  watch([
    () => route.query.dotdotId,
    () => categoryStore.categoryList.map(category => category.id).join(','),
  ], loadDotdotData, { immediate: true })

  const selectCategory = (categoryId: number) => {
    dotdotData.categoryId = categoryId
    dotdotData.tagIds = []
    categoryError.value = ''
  }

  const cancelEdit = () => {
    isCancelConfirmOpen.value = false
    router.back()
  }

  const saveDotdot = () => {
    categoryError.value = dotdotData.categoryId === null
      ? '類別為必填欄位'
      : ''
    amountError.value = (
      dotdotData.amount === null
      || !Number.isFinite(dotdotData.amount)
      || dotdotData.amount < 0
    )
      ? '請輸入有效的金額'
      : ''

    if (formErrorMessage.value) {
      isFormErrorDialogOpen.value = true
      return
    }

    const categoryId = dotdotData.categoryId
    const amount = dotdotData.amount

    if (categoryId === null || amount === null) return

    const nextDotdotData: DotdotData = {
      fixed: dotdotData.displayTiming.permanent,
      displayTiming: {
        weekdays: [...dotdotData.displayTiming.weekdays],
        startTime: dotdotData.displayTiming.startTime,
        endTime: dotdotData.displayTiming.endTime,
      },
      record: {
        categoryId,
        tagIds: [...dotdotData.tagIds],
        note: dotdotData.note,
        amount,
      },
    }

    if (dotdotId.value === null) {
      dotdotStore.addDotdot(nextDotdotData)
    } else {
      dotdotStore.updateDotdot(dotdotId.value, nextDotdotData)
    }

    router.back()
  }

  const confirmDeleteDotdot = () => {
    isDeleteConfirmOpen.value = false

    if (dotdotId.value === null) return

    if (dotdotStore.deleteDotdot(dotdotId.value)) router.back()
  }
</script>

<style lang="scss" scoped>
  .page.cycleDotdotEditor{
    >main{
      gap: 28px;
      @include flexbox(column, flex-start, stretch);
      >.form-item{
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
      }
    }
  }
</style>
