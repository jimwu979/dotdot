<template>
  <div class="component dotdot-panel">
    <section v-if="fixedList.length" class="fixed">
      <h3>釘選</h3>
      <ul>
        <li v-for="item in fixedList" :key="item.id">
          <button class="btn-click-effect" type="button" @click="addRecord(item)">
            <TransactionItem :record="item.display" />
          </button>
        </li>
      </ul>
    </section>
    <section v-if="availableList.length">
      <h3>現在可用</h3>
      <ul>
        <li v-for="item in availableList" :key="item.id">
          <button class="btn-click-effect" type="button" @click="addRecord(item)">
            <TransactionItem :record="item.display" />
          </button>
        </li>
      </ul>
    </section>
    <p v-if="!fixedList.length && !availableList.length" class="empty">目前沒有可用的點點記帳</p>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import TransactionItem from '@/shared/components/TransactionItem.vue'
import { categoryColors } from '@/shared/colors/category'
import { useCategoryStore } from '@/shared/stores/category'
import { useDotdotStore, type DotdotItem } from '@/shared/stores/dotdot'
import { useRecordStore } from '@/shared/stores/record'

const emit = defineEmits<{
  close: []
}>()

const categoryStore = useCategoryStore()
const dotdotStore = useDotdotStore()
const recordStore = useRecordStore()
const currentTime = ref(new Date())
const getTimeInMinutes = (time: string) => {
  const [hour = 0, minute = 0] = time.split(':').map(Number)

  return hour * 60 + minute
}
const isInDisplayTiming = (item: DotdotItem) => {
  if (item.fixed) return true
  if (!item.displayTiming.weekdays.includes(currentTime.value.getDay())) return false

  const minutes = currentTime.value.getHours() * 60 + currentTime.value.getMinutes()
  const startMinutes = getTimeInMinutes(item.displayTiming.startTime)
  const endMinutes = getTimeInMinutes(item.displayTiming.endTime)

  return startMinutes <= endMinutes
    ? minutes >= startMinutes && minutes <= endMinutes
    : minutes >= startMinutes || minutes <= endMinutes
}
const getDisplayItem = (item: DotdotItem) => {
  const category = categoryStore.categoryList.find(category => category.id === item.record.categoryId)
  const selectedTagIds = new Set(item.record.tagIds)

  return {
    ...item,
    display: {
      icon: category?.icon ?? 'LayoutDashboard',
      color: category ? categoryColors[category.color] : categoryColors.grey,
      category: category?.name ?? '未分類',
      isExpense: category?.isExpense ?? true,
      tag: category?.tags
        .filter(tag => selectedTagIds.has(tag.id))
        .sort((tagA, tagB) => tagA.index - tagB.index)
        .map(tag => tag.name) ?? [],
      note: item.record.note,
      amount: item.record.amount,
    },
  }
}
const fixedList = computed(() => (
  dotdotStore.getDotdotList(true, true).map(getDisplayItem)
))
const availableList = computed(() => (
  dotdotStore.getDotdotList(false, true).filter(isInDisplayTiming).map(getDisplayItem)
))
const getCurrentDate = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}
const addRecord = (item: DotdotItem) => {
  recordStore.addRecord({
    categoryId: item.record.categoryId,
    tagIds: [...item.record.tagIds],
    note: item.record.note,
    amount: item.record.amount,
    isAutomatic: false,
    occurredAt: getCurrentDate(),
  })
  emit('close')
}
</script>

<style lang="scss" scoped>
  .component.dotdot-panel{
    flex: 1;
    gap: 16px;
    min-height: 0;
    overflow-y: auto;
    padding: 18px;
    overscroll-behavior: contain;
    @include flexbox(column, flex-start, stretch);
    >section{
      >h3{
        color: $grey;
        font-size: 13px;
        font-weight: 600;
        margin-bottom: 8px;
      }
      >ul{
        gap: 6px;
        @include flexbox(column, flex-start, stretch);
        >li>button{
          width: 100%;
          height: 52px;
          padding: 0 9px;
          border-radius: 10px;
        }
      }
      &.fixed{
        padding: 12px;
        border-radius: 14px;
        border: 1px solid $oat;
        background-color: $white;
      }
    }
    >.empty{
      color: $grey;
      text-align: center;
      padding-top: 60px;
    }
  }
</style>
