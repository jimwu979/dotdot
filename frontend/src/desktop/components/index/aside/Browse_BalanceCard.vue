<template>
  <section class="component balanceCard" :class="{'isPastMonth': isPastMonth}">
    <div class="heading">
      <div>
        <p>{{ isPastMonth ? '本月結餘' : '日均餘額' }}</p>
        <strong>
          $ {{ formatAmount(isPastMonth ? balance : dailyBalance) }}
          <span v-if="!isPastMonth">元/天</span>
        </strong>
      </div>
      <span>{{ year }} 年 {{ month }} 月</span>
    </div>
    <div class="progress" :class="balanceStatus" />
    <div class="details">
      <div>
        <span class="income">收入</span>
        <b>{{ formatAmount(totalIncome) }} 元</b>
      </div>
      <div>
        <span class="expense">支出</span>
        <b>{{ formatAmount(totalExpense) }} 元</b>
      </div>
      <div>
        <span>剩餘天數</span>
        <b>{{ remainingDays }} 天</b>
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { formatAmount } from '@/shared/utils/formatAmount'

const props = defineProps<{
  year: number
  month: number
  totalIncome: number
  totalExpense: number
}>()

const now = new Date()
const selectedDate = computed(() => props.year * 12 + props.month)
const currentDate = now.getFullYear() * 12 + now.getMonth() + 1
const isPastMonth = computed(() => selectedDate.value < currentDate)
const balance = computed(() => props.totalIncome - props.totalExpense)
const remainingDays = computed(() => {
  const daysInMonth = new Date(props.year, props.month, 0).getDate()

  if (selectedDate.value < currentDate) return 0
  if (selectedDate.value > currentDate) return daysInMonth

  return daysInMonth - now.getDate() + 1
})
const dailyBalance = computed(() => {
  if (remainingDays.value === 0) return 0

  return balance.value / remainingDays.value
})
const balanceStatus = computed(() => {
  if (isPastMonth.value) return ''
  if (dailyBalance.value >= 600) return 'healthy'
  if (dailyBalance.value > 400) return 'medium'
  if (dailyBalance.value < 400) return 'warning'

  return ''
})
</script>

<style lang="scss" scoped>
  .component.balanceCard{
    padding: 24px;
    border-radius: 24px;
    border: 1px solid $black;
    background-color: $black;
    box-shadow: 0 18px 35px rgba($black,.24);
    >.heading{
      @include flexbox(row, space-between, flex-start);
      >div{
        >p{
          color: rgba($white,.7);
        }
        >strong{
          color: $white;
          display: block;
          font-size: 42px;
          margin-top: 4px;
          font-weight: 700;
          line-height: 1.2;
          >span{
            opacity: .5;
            color: inherit;
            font-size: 13px;
          }
        }
      }
      >span{
        padding: 4px 11px;
        font-weight: 600;
        border-radius: 99px;
        background-color: $yellow;
      }
    }
    >.progress{
      height: 4px;
      margin: 16px 0 22px;
      border-radius: 99px;
      background-color: $stone;
      &.healthy{
        background-color: $green;
      }
      &.medium{
        background-color: $yellow;
      }
      &.warning{
        background-color: $red;
      }
    }
    >.details{
      @include flexbox(row, space-between, center);
      >div{
        >span{
          display: block;
          font-size: 12px;
          color: rgba($white,.58);
          &:before{
            width: 7px;
            height: 7px;
            content: '';
            margin-right: 5px;
            border-radius: 50%;
            display: inline-block;
            background-color: $stone;
          }
          &.income:before{
            background-color: $green;
          }
          &.expense:before{
            background-color: $red;
          }
        }
        >b{
          color: $white;
          font-size: 13px;
          font-weight: 600;
          padding-left: 13px;
        }
      }
    }
    &.isPastMonth{
      border-color: $oat;
      background-color: $white;
      box-shadow: 0 18px 35px rgba(73,62,28,.08);
      >.heading>div{
        >p{
          color: $grey;
        }
        >strong{
          color: $black;
        }
      }
      >.details>div{
        >span{
          color: $grey;
        }
        >b{
          color: $black;
        }
      }
    }
  }
</style>
