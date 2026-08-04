<template>
  <section class="balance-card" :class="{'isPastMonth': isPastMonth}">

    <!-- 上部資訊 -->
    <div class="balance-heading">
      <div>
        <p>{{ isPastMonth ? '本月結餘' : '日均餘額' }}</p>
        <strong>
          $ {{ formatAmount(isPastMonth ? balance : dailyBalance) }}
          <span v-if="!isPastMonth">元/天</span>
        </strong>
      </div>
      <span>
        <template v-if="selectedYear < now.getFullYear()">
          {{ selectedYear }} 年
        </template>
        {{ selectedMonth }} 月
      </span>
    </div>

    <!-- 狀態條 -->
    <div class="balance-progress" :class="balanceStatus" />

    <!-- 下部資訊 -->
    <div class="balance-details">
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
  import { useRoute } from 'vue-router'

  const props = defineProps<{
    totalIncome: number
    totalExpense: number
  }>()

  const route = useRoute()
  const now = new Date()
  const getRouteNumber = (value: unknown, fallback: number, min: number, max: number) => {
    const rawValue = Array.isArray(value) ? value[0] : value
    const numberValue = Number(rawValue)

    return Number.isInteger(numberValue) && numberValue >= min && numberValue <= max
      ? numberValue
      : fallback
  }

  const selectedYear = computed(() =>
    getRouteNumber(route.params.year, now.getFullYear(), 1000, 9999),
  )
  const selectedMonth = computed(() => {
    return getRouteNumber(route.params.month, now.getMonth() + 1, 1, 12)
  })
  const isPastMonth = computed(() => {
    const selectedDate = selectedYear.value * 12 + selectedMonth.value
    const currentDate = now.getFullYear() * 12 + now.getMonth() + 1

    return selectedDate < currentDate
  })
  const balance = computed(() =>
    Math.trunc(props.totalIncome - props.totalExpense),
  )
  const remainingDays = computed(() => {
    const selectedDate = selectedYear.value * 12 + selectedMonth.value
    const currentDate  = now.getFullYear()  * 12 + now.getMonth() + 1
    const daysInMonth  = new Date(selectedYear.value, selectedMonth.value, 0).getDate()

    if (selectedDate < currentDate) return 0
    if (selectedDate > currentDate) return daysInMonth

    return daysInMonth - now.getDate() + 1
  })
  const dailyBalance = computed(() => {
    if (remainingDays.value === 0) return 0

    return Math.trunc(
      (props.totalIncome - props.totalExpense) / remainingDays.value,
    )
  })
  const balanceStatus = computed(() => {
    if (isPastMonth.value) return ''
    if (dailyBalance.value >= 600) return 'healthy'
    if (dailyBalance.value > 400) return 'medium'
    if (dailyBalance.value < 400) return 'warning'

    return ''
  })
  const formatAmount = (amount: number) =>
    String(Math.trunc(amount)).replace(/\B(?=(\d{4})+(?!\d))/g, ',')
</script>

<style lang="scss" scoped>
.balance-card {
  padding: 22px;
  transition: .2s;
  margin-top: 24px;
  border-radius: 24px;
  border: 1px solid $black;
  background-color: $black;
  transition: background-color .2s, border-color .2s;
  box-shadow: 0 18px 35px rgba($color: $black, $alpha: .3);
  > .balance-heading {
    @include flexbox(row, space-between, flex-start);
    > div {
      > p {
        transition: color .2s;
        color: rgba(255, 255, 255, .7);
      }
      > strong {
        color: $white;
        display: block;
        font-size: 48px;
        margin-top: 3px;
        font-weight: 700;
        line-height: 1.25;
        transition: color .2s;
        >span{
          opacity: .4;
          color: inherit;
          line-height: 1px;
          transition: color .2s;
        }
      }
    }
    > span {
      font-weight: 600;
      padding: 4px 11px;
      border-radius: 99px;
      background-color: $yellow;
    }
  }
  > .balance-progress {
    height: 4px;
    overflow: hidden;
    margin: 12px 0 24px;
    border-radius: 99px;
    background-color: #EEE;
    transition: background-color .2s;
    &.healthy{
      background-color: #1fa31f;
      box-shadow: 0px 2px 8px rgba(115, 255, 0, 0.4);
    }
    &.medium{
      background-color: $yellow;
      box-shadow: 0px 2px 8px rgba(255, 238, 0, 0.4);
    }
    &.warning{
      background-color: $red;
      box-shadow: 0px 2px 8px rgba(255, 69, 12, 0.4);
    }
  }
  > .balance-details {
    @include flexbox(row, space-between, center);
    > div {
      min-width: 0;
      > span {
        display: block;
        font-size: 12px;
        transition: color .2s;
        color: rgba(255, 255, 255, .58);
        &::before {
          width: 7px;
          height: 7px;
          content: '';
          margin-right: 5px;
          border-radius: 50%;
          display: inline-block;
          background-color: $stone;
        }
        &.income::before {
          background-color: $green;
        }
        &.expense::before {
          background-color: #ff806f;
        }
      }
      > b {
        color: $white;
        font-size: 13px;
        font-weight: 600;
        padding-left: 13px;
        white-space: nowrap;
        transition: color .2s;
      }
    }
  }
  &.isPastMonth{
    border-color: $oat;
    background-color: $white;
    > .balance-heading {
      > div {
        > p {
          color: $grey;
        }
        > strong {
          color: $black;
          >span{
          }
        }
      }
      > span {
      }
    }
    > .balance-details {
      @include flexbox(row, space-between, center);
      > div {
        > span {
          color: $grey;
        }
        > b {
          color: $black;
        }
      }
    }
  }
}
</style>
