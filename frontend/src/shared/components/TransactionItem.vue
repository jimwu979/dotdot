<template>
  <div class="component transactionItem">
    <div class="icon" :style="{'background-color': record.color}">
      <component :is="categoryIcons[record.icon]" />
    </div>
    <h3>{{ record.category }}</h3>
    <b v-for="tag in record.tag" :key="tag">{{ tag }}</b>
    <p>{{ record.note }}</p>
    <strong :class="{'income': !record.isExpense}">
      {{ record.isExpense ? '' : '+' }}{{ formatAmount(record.amount) }}
    </strong>
  </div>
</template>

<script lang="ts" setup>
import {
  categoryIcons,
  type CategoryIconName,
} from '@/shared/icons/category'
import { formatAmount } from '@/shared/utils/formatAmount'

interface TransactionItemRecord {
  icon: CategoryIconName
  color: string
  category: string
  isExpense: boolean
  tag: string[]
  note: string
  amount: number
}

defineProps<{
  record: TransactionItemRecord
}>()
</script>

<style lang="scss" scoped>
  .component.transactionItem{
    gap: 8px;
    width: 100%;
    min-width: 0;
    @include flexbox(row, flex-start, center);
    >.icon{
      width: 34px;
      flex: 0 0 34px;
      aspect-ratio: 1/1;
      border-radius: 50%;
      @include flexbox(row, center, center);
      >svg{
        width: 19px;
        stroke: $white;
      }
    }
    >h3{
      flex: 0 0 auto;
      font-size: 14px;
      font-weight: 600;
    }
    >b{
      color: $mustard;
      padding: 2px 4px;
      font-size: 11px;
      line-height: 16px;
      border-radius: 4px;
      border: 1px solid $mustard;
      background-color: $background;
    }
    >p{
      flex: 1;
      color: $grey;
      min-width: 0;
      overflow: hidden;
      font-size: 12px;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
    >strong{
      flex: 0 0 auto;
      font-weight: 600;
      &.income{
        color: $green;
      }
    }
  }
</style>
