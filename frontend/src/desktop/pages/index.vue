<template>
  <div class="page index">
    <DesktopHeader />
    <main>
      <MonthSelector :year="selectedYear" :month="selectedMonth" />
      <Calendar
        :year="selectedYear"
        :month="selectedMonth"
        :selected-date="selectedDate"
        @update:selected-date="selectedDate = $event"
      />
      <DailyRecords
        :selected-date="selectedDate"
        :records="calendarRecords"
      />
    </main>
    <aside>
      <Browse_BalanceCard
        :year="selectedYear"
        :month="selectedMonth"
        :total-income="totalIncome"
        :total-expense="totalExpense"
      />
      <Browse_CategorySummary :list="categorySummary" />
      <Action_Buttons @select="selectActionPanel" />
      <Action_Panel
        :panel="actionPanel"
        :record-id="editingRecordId"
        @close="closeActionPanel"
      />
    </aside>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DesktopHeader from '@/desktop/components/header.vue'
import Action_Buttons from '@/desktop/components/index/aside/Action_Buttons.vue'
import Action_Panel, { type ActionPanelType } from '@/desktop/components/index/aside/Action_Panel.vue'
import Browse_BalanceCard from '@/desktop/components/index/aside/Browse_BalanceCard.vue'
import Browse_CategorySummary from '@/desktop/components/index/aside/Browse_CategorySummary.vue'
import Calendar from '@/desktop/components/index/main/Calendar.vue'
import DailyRecords from '@/desktop/components/index/main/DailyRecords.vue'
import MonthSelector from '@/desktop/components/index/main/MonthSelector.vue'
import type {
  CategorySummaryItem,
  HomeRecordItem,
} from '@/desktop/types'
import { categoryColors } from '@/shared/colors/category'
import { useCategoryStore } from '@/shared/stores/category'
import { useRecordStore } from '@/shared/stores/record'

const route = useRoute()
const router = useRouter()
const now = new Date()
const categoryStore = useCategoryStore()
const recordStore = useRecordStore()
const actionPanel = ref<ActionPanelType>('')
const editingRecordId = ref<number>()
const getRouteNumber = (value: unknown, fallback: number, min: number, max: number) => {
  const rawValue = Array.isArray(value) ? value[0] : value
  const numberValue = Number(rawValue)

  return Number.isInteger(numberValue) && numberValue >= min && numberValue <= max
    ? numberValue
    : fallback
}
const selectedYear = computed(() => (
  getRouteNumber(route.params.year, now.getFullYear(), 1000, 9999)
))
const selectedMonth = computed(() => (
  getRouteNumber(route.params.month, now.getMonth() + 1, 1, 12)
))
const getDefaultDate = () => (
  selectedYear.value === now.getFullYear() && selectedMonth.value === now.getMonth() + 1
    ? new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    : new Date(selectedYear.value, selectedMonth.value - 1, 1).getTime()
)
const selectedDate = ref(getDefaultDate())
const getDisplayRecords = (year: number, month: number) => {
  return recordStore.getRecordsByMonth(year, month)
    .reduce<HomeRecordItem[]>((items, record) => {
      const category = categoryStore.categoryList
        .find(category => category.id === record.categoryId)

      if (!category) return items

      items.push({
        id: record.id,
        categoryId: category.id,
        occurredAt: record.occurredAt,
        icon: category.icon,
        color: categoryColors[category.color],
        category: category.name,
        isExpense: category.isExpense,
        tag: category.tags
          .filter(tag => record.tagIds.includes(tag.id))
          .sort((tagA, tagB) => tagA.index - tagB.index)
          .map(tag => tag.name),
        note: record.note,
        amount: record.amount,
        isAutomatic: record.isAutomatic,
      })

      return items
    }, [])
}
const records = computed<HomeRecordItem[]>(() => (
  getDisplayRecords(selectedYear.value, selectedMonth.value)
))
const calendarRecords = computed<HomeRecordItem[]>(() => (
  [-1, 0, 1].flatMap(offset => {
    const target = new Date(selectedYear.value, selectedMonth.value - 1 + offset, 1)

    return getDisplayRecords(target.getFullYear(), target.getMonth() + 1)
  })
))
const totalIncome = computed(() => records.value
  .filter(record => !record.isExpense)
  .reduce((total, record) => total + record.amount, 0),
)
const totalExpense = computed(() => records.value
  .filter(record => record.isExpense)
  .reduce((total, record) => total + record.amount, 0),
)
const categorySummary = computed<CategorySummaryItem[]>(() => {
  const categoryTotals = new Map<number, number>()

  records.value
    .forEach(record => {
      categoryTotals.set(
        record.categoryId,
        (categoryTotals.get(record.categoryId) ?? 0) + record.amount,
      )
    })

  return categoryStore.categoryList
    .slice()
    .sort((categoryA, categoryB) => categoryA.index - categoryB.index)
    .map(category => ({
      id: category.id,
      icon: category.icon,
      color: categoryColors[category.color],
      name: category.name,
      amount: categoryTotals.get(category.id) ?? 0,
      isExpense: category.isExpense,
    }))
})

const getQueryRecordId = () => {
  const rawRecordId = Array.isArray(route.query.recordId)
    ? route.query.recordId[0]
    : route.query.recordId
  const recordId = Number(rawRecordId)

  return Number.isInteger(recordId) && recordId > 0 ? recordId : undefined
}
const openLinkedRecord = () => {
  const recordId = getQueryRecordId()
  const linkedRecord = recordStore.recordList.find(record => record.id === recordId)

  if (!linkedRecord) return

  const [year, month, day] = linkedRecord.occurredAt.split('-').map(Number)
  selectedDate.value = new Date(year, month - 1, day).getTime()
  editingRecordId.value = linkedRecord.id
  actionPanel.value = 'normal'
}
const clearLinkedRecord = () => {
  if (!('recordId' in route.query)) return

  const query = { ...route.query }
  delete query.recordId
  void router.replace({ query })
}
const selectActionPanel = (panel: ActionPanelType) => {
  editingRecordId.value = undefined
  clearLinkedRecord()
  actionPanel.value = panel
}
const closeActionPanel = () => {
  actionPanel.value = ''
  editingRecordId.value = undefined
  clearLinkedRecord()
}

watch(
  () => [selectedYear.value, selectedMonth.value],
  () => {
    selectedDate.value = getDefaultDate()
    openLinkedRecord()
  },
)

watch(
  () => route.query.recordId,
  () => { openLinkedRecord() },
  { immediate: true },
)
</script>

<style lang="scss" scoped>
  .page.index{
    position: relative;
    width: 100%;
    height: 100dvh;
    overflow: hidden;
    @include flexbox(row, flex-start, stretch);
    >main{
      flex: 1;
      gap: 24px;
      height: 100%;
      min-width: 0;
      min-height: 100vh;
      overflow-y: auto;
      scrollbar-gutter: stable;
      padding: 24px 28px 48px;
      overscroll-behavior: contain;
      @include flexbox(column, flex-start, center);
    }
    >aside{
      gap: 18px;
      height: 100%;
      padding: 12px;
      overflow: hidden;
      flex: 0 0 420px;
      min-height: 100vh;
      border-left: 1px solid $oat;
      background-color: $white;
      @include flexbox(column, flex-start, stretch);
      >.actionButtons{
        margin-top: auto;
      }
    }
  }
</style>
