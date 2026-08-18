<template>
  <section class="component dailyRecords">
    <div v-if="selectedRecords.length" class="list">
      <TransactionItem
        v-for="record in selectedRecords"
        :key="record.id"
        :record="record"
      />
    </div>
    <p v-else>這天還沒有記帳項目</p>
    <footer>
      <span>{{ selectedMonth }}/{{ selectedDay }}</span>
      <span>{{ selectedRecords.length }} 筆</span>
      <span>
        總計:
        {{ selectedTotal > 0 ? '+' : '' }}{{ formatAmount(selectedTotal) }}
      </span>
    </footer>
  </section>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import TransactionItem from '@/shared/components/TransactionItem.vue'
import type { HomeRecordItem } from '@/desktop/types'
import { formatAmount } from '@/shared/utils/formatAmount'

const props = defineProps<{
  selectedDate: number
  records: HomeRecordItem[]
}>()

const selectedDateValue = computed(() => new Date(props.selectedDate))
const selectedYear = computed(() => selectedDateValue.value.getFullYear())
const selectedMonth = computed(() => selectedDateValue.value.getMonth() + 1)
const selectedDay = computed(() => selectedDateValue.value.getDate())
const selectedDateKey = computed(() => (
  `${selectedYear.value}-${String(selectedMonth.value).padStart(2, '0')}-${String(selectedDay.value).padStart(2, '0')}`
))
const selectedRecords = computed(() => props.records.filter(record => (
  record.occurredAt === selectedDateKey.value
)))
const selectedTotal = computed(() => selectedRecords.value.reduce((total, record) => (
  total + (record.isExpense ? -record.amount : record.amount)
), 0))
</script>

<style lang="scss" scoped>
  .component.dailyRecords{
    flex: 1;
    width: 100%;
    min-height: 0;
    max-width: 600px;
    overflow: hidden;
    border-radius: 12px;
    border: 1px solid $oat;
    background-color: $white;
    @include flexbox(column, flex-start, stretch);
    >.list{
      flex: 1;
      padding: 12px;
      min-height: 0;
      overflow: auto;
      overscroll-behavior: contain;
      >.transactionItem{
        height: 42px;
      }
    }
    >p{
      flex: 1;
      color: $grey;
      min-height: 0;
      font-size: 12px;
      @include flexbox(row, center, center);
    }
    >footer{
      gap: 12px;
      height: 44px;
      flex: 0 0 44px;
      padding: 0 12px;
      position: relative;
      border-top: 1px solid $oat;
      @include flexbox(row, flex-start, center);
      >span{
        color: $grey;
        &:nth-last-of-type(1){
          right: 12px;
          position: absolute;
        }
      }
    }
  }
</style>
