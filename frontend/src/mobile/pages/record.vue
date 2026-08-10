<template>
  <div class="page record">
    <section>
      <label>類別</label>
      <Category
        :category-id="categoryId"
        @update:category-id="selectCategory"
      />
    </section>
    <section>
      <label>標籤</label>
      <Tag
        v-model:selected-tag-ids="selectedTagIds"
        :tags="tags"
      />
    </section>
    <section>
      <label>備註</label>
      <Note
        v-model="note"
        placeholder="輸入這筆記帳的備註"
      />
    </section>
    <Calculator
      :key="calculatorKey"
      v-model:occurred-at="occurredAt"
      :amount="amount"
      @save="saveRecord"
    />
    <AppHeader
      :right-action="recordId !== null ? 'delete' : undefined"
      @delete="isDeleteConfirmOpen = true"
    />
    <ConfirmDialog
      :open="isDeleteConfirmOpen"
      message="確定要刪除這筆帳嗎？"
      confirm-text="確認刪除"
      confirm-type="delete"
      @cancel="isDeleteConfirmOpen = false"
      @confirm="confirmDeleteRecord"
    />
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import AppHeader from '@/mobile/components/AppHeader.vue'
  import ConfirmDialog from '@/mobile/components/ConfirmDialog.vue'
  import Category from '@/mobile/components/record/Category.vue'
  import Tag from '@/mobile/components/record/Tag.vue'
  import Note from '@/mobile/components/record/Note.vue'
  import Calculator from '@/mobile/components/record/Calculator.vue'
  import { useCategoryStore } from '@/shared/stores/category'
  import { useRecordStore, type RecordData } from '@/shared/stores/record'

  const route = useRoute()
  const router = useRouter()
  const categoryStore = useCategoryStore()
  const recordStore = useRecordStore()
  const recordId = ref<number | null>(null)
  const originalOccurredAt = ref('')
  const categoryId = ref<number | null>(null)
  const selectedTagIds = ref<number[]>([])
  const note = ref('')
  const amount = ref(0)
  const isAutomatic = ref(false)
  const occurredAt = ref('')
  const isDeleteConfirmOpen = ref(false)
  const isDeleting = ref(false)
  const calculatorKey = computed(() => (
    `record-${String(route.query.recordId ?? '')}`
    + `-category-${String(route.query.categoryID ?? '')}`
  ))
  const tags = computed(() => (
    categoryStore.categoryList
      .find(category => category.id === categoryId.value)
      ?.tags
      .slice()
      .sort((tagA, tagB) => tagA.index - tagB.index) ?? []
  ))

  const selectCategory = (selectedCategoryId: number) => {
    categoryId.value = selectedCategoryId
    selectedTagIds.value = []
  }

  const getCurrentDate = () => {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
  }

  const redirectToHomepage = (dateValue = getCurrentDate()) => {
    const [year, month] = dateValue.split('-')

    router.replace({
      name: 'index',
      params: {
        year,
        month,
      },
    })
  }

  const getQueryId = (queryValue: unknown) => {
    const value = Array.isArray(queryValue) ? queryValue[0] : queryValue
    const parsedId = typeof value === 'string' ? Number(value) : Number.NaN

    return Number.isInteger(parsedId) ? parsedId : null
  }

  watch([
    () => route.query.recordId,
    () => route.query.categoryID,
    () => categoryStore.categoryList.map(category => category.id).join(','),
    () => recordStore.recordList.map(record => record.id).join(','),
  ], ([queryRecordId, queryCategoryID]) => {
    if (isDeleting.value) return

    const parsedRecordId = getQueryId(queryRecordId)

    if (queryRecordId !== undefined) {
      const record = parsedRecordId === null
        ? undefined
        : recordStore.recordList.find(record => record.id === parsedRecordId)
      const categoryExists = record
        ? categoryStore.categoryList.some(category => category.id === record.categoryId)
        : false

      if (!record || !categoryExists) {
        redirectToHomepage()
        return
      }

      recordId.value = record.id
      originalOccurredAt.value = record.occurredAt
      isDeleteConfirmOpen.value = false
      categoryId.value = record.categoryId
      selectedTagIds.value = [...record.tagIds]
      note.value = record.note
      amount.value = record.amount
      isAutomatic.value = record.isAutomatic
      occurredAt.value = record.occurredAt
      return
    }

    const parsedCategoryId = getQueryId(queryCategoryID)
    const categoryExists = parsedCategoryId !== null
      && categoryStore.categoryList.some(category => category.id === parsedCategoryId)

    if (!categoryExists || parsedCategoryId === null) {
      redirectToHomepage()
      return
    }

    recordId.value = null
    originalOccurredAt.value = ''
    isDeleteConfirmOpen.value = false
    categoryId.value = parsedCategoryId
    selectedTagIds.value = []
    note.value = ''
    amount.value = 0
    isAutomatic.value = false
    occurredAt.value = getCurrentDate()
  }, { immediate: true })

  const saveRecord = (recordAmount: number) => {
    if (categoryId.value === null) {
      redirectToHomepage(occurredAt.value)
      return
    }

    const recordData: RecordData = {
      categoryId: categoryId.value,
      tagIds: [...selectedTagIds.value],
      note: note.value,
      amount: recordAmount,
      isAutomatic: isAutomatic.value,
      occurredAt: occurredAt.value,
    }

    if (recordId.value === null) {
      recordStore.addRecord(recordData)
    } else if (!recordStore.updateRecord(recordId.value, recordData)) {
      redirectToHomepage(occurredAt.value)
      return
    }

    redirectToHomepage(occurredAt.value)
  }

  const confirmDeleteRecord = () => {
    isDeleteConfirmOpen.value = false

    if (recordId.value === null) return

    const redirectDate = originalOccurredAt.value || occurredAt.value

    isDeleting.value = true

    if (recordStore.deleteRecord(recordId.value)) {
      redirectToHomepage(redirectDate)
      return
    }

    isDeleting.value = false
  }
</script>

<style scoped lang="scss">
  .page.record{
    gap: 12px;
    padding-bottom: 420px;
    @include flexbox(column, flex-start, stretch);
    >section{
      gap: 12px;
      @include flexbox(row, flex-start, flex-start);
      >label{
        color: $grey;
        height: 50px;
        @include h3();
        @include flexbox(row, flex-start, center);
      }
      >.component{
        flex: 1;
      }
    }
  }
</style>
