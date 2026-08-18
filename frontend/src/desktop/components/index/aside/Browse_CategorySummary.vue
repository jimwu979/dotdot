<template>
  <section class="component categorySummary">
    <header>
      <h2>本月類別統計</h2>
      <div>
        <button class="btn-click-effect" type="button" :class="{'now': !isExpense}" @click="isExpense = false">
          收入
        </button>
        <button class="btn-click-effect" type="button" :class="{'now': isExpense}" @click="isExpense = true">
          支出
        </button>
      </div>
    </header>
    <div class="list">
      <ul>
        <li v-for="category in visibleList" :key="category.id">
          <div :style="{'background-color': category.color}">
            <component :is="categoryIcons[category.icon]" />
          </div>
          <span>{{ category.name }}</span>
          <strong>{{ formatAmount(category.amount) }}</strong>
        </li>
      </ul>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import type { CategorySummaryItem } from '@/desktop/types'
import { categoryIcons } from '@/shared/icons/category'
import { formatAmount } from '@/shared/utils/formatAmount'

const props = defineProps<{
  list: CategorySummaryItem[]
}>()

const isExpense = ref(true)
const visibleList = computed(() => props.list.filter(category => (
  category.isExpense === isExpense.value
)))
</script>

<style lang="scss" scoped>
  .component.categorySummary{
    flex: 1;
    min-height: 0;
    padding: 14px;
    border-radius: 16px;
    border: 1px solid $oat;
    background-color: $background;
    @include flexbox(column, flex-start, stretch);
    >header{
      @include flexbox(row, space-between, center);
      >h2{
        font-size: 15px;
        font-weight: 600;
      }
      >div{
        padding: 2px;
        border-radius: 8px;
        background-color: $oat;
        @include flexbox(row, flex-start, center);
        >button{
          width: 52px;
          height: 26px;
          color: $grey;
          font-size: 12px;
          border-radius: 6px;
          &.now{
            color: $black;
            font-weight: 600;
            background-color: $yellow;
          }
        }
      }
    }
    >.list{
      flex: 1;
      min-height: 0;
      overflow: auto;
      margin-top: 12px;
      overscroll-behavior: contain;
      >ul{
        min-height: 100%;
        gap: 12px 28px;
        display: grid;
        position: relative;
        align-content: start;
        grid-auto-rows: 30px;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        &:before{
          content: '';
          width: 1px;
          height: 100%;
          position: absolute;
          left: calc(50% - 1px);
          background-color: $oat;
        }
        >li{
          gap: 12px;
          min-width: 0;
          @include flexbox(row, flex-start, center);
          >div{
            width: 30px;
            flex: 0 0 30px;
            aspect-ratio: 1/1;
            border-radius: 50%;
            @include flexbox(row, center, center);
            >svg{
              width: 17px;
              stroke: $white;
            }
          }
          >span{
            flex: 1;
            min-width: 0;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
          }
          >strong{
          }
        }
      }
    }
  }
</style>
