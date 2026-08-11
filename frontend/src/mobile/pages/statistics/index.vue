<template>
  <main class="page statisticsIndex">
    <div class="page-heading">
      <p>{{ selectedYear }}年 收支回顧</p>
      <h1>統計</h1>
    </div>

    <section class="month-list">
      <div class="list-heading">
        <span>月份</span>
        <span>收入</span>
        <span>支出</span>
        <span>結餘</span>
      </div>
      <router-link
        v-for="item in monthlyStatistics"
        :key="item.month"
        :to="{
          name: 'statistics-month',
          params: {
            year: selectedYear,
            month: String(item.month).padStart(2, '0'),
          },
        }"
      >
        <strong>{{ item.month }}月</strong>
        <span>{{ formatAmount(item.income) }}</span>
        <span>{{ formatAmount(item.expense) }}</span>
        <span :class="{ positive: item.balance > 0, negative: item.balance < 0 }">
          {{ item.balance > 0 ? '+' : '' }}{{ formatAmount(item.balance) }}
        </span>
        <i />
      </router-link>
    </section>

    <AppHeader>
      <template #center>
        <PeriodSelector mode="year" />
      </template>
    </AppHeader>
  </main>
</template>

<script lang="ts" setup>
  import { computed } from 'vue'
  import { useRoute } from 'vue-router'
  import AppHeader from '@/mobile/components/AppHeader.vue'
  import PeriodSelector from '@/mobile/components/childComponents/appHeader/PeriodSelector.vue'
  import { useCategoryStore } from '@/shared/stores/category'
  import { useRecordStore } from '@/shared/stores/record'
  import { formatAmount } from '@/shared/utils/formatAmount'

  const route = useRoute()
  const categoryStore = useCategoryStore()
  const recordStore = useRecordStore()
  const now = new Date()

  const selectedYear = computed(() => {
    const value = Number(Array.isArray(route.query.year) ? route.query.year[0] : route.query.year)

    return Number.isInteger(value) && value >= 1000 && value <= 9999
      ? value
      : now.getFullYear()
  })
  const categoryMap = computed(() => new Map(
    categoryStore.categoryList.map(category => [category.id, category]),
  ))
  const monthlyStatistics = computed(() => Array.from({ length: 12 }, (_, index) => {
    const month = index + 1
    const monthKey = `${selectedYear.value}-${String(month).padStart(2, '0')}`
    let income = 0
    let expense = 0

    recordStore.recordList.forEach(record => {
      if (!record.occurredAt.startsWith(monthKey)) return

      const category = categoryMap.value.get(record.categoryId)

      if (!category) return
      if (category.isExpense) expense += record.amount
      else income += record.amount
    })

    return { month, income, expense, balance: income - expense }
  }).reverse())
</script>

<style lang="scss" scoped>
.page.statisticsIndex {
  padding-bottom: calc($header_height + 40px);
  > .page-heading {
    > p {
      color: $grey;
      font-size: 13px;
    }
    > h1 {
      margin-top: 2px;
      @include h1();
    }
  }
  > .month-list {
    overflow: hidden;
    margin-top: 24px;
    border-radius: 12px;
    border: 1px solid $stone;
    background-color: $white;
    > .list-heading,
    > a {
      display: grid;
      align-items: center;
      grid-template-columns: .7fr 1fr 1fr 1fr 12px;
    }
    > .list-heading {
      gap: 6px;
      padding: 10px 12px;
      background-color: rgba($oat, .55);
      > span {
        color: $grey;
        font-size: 11px;
        text-align: right;
        &:first-child {
          text-align: left;
        }
      }
    }
    > a {
      gap: 6px;
      min-height: 52px;
      padding: 8px 12px;
      > strong {
        font-size: 14px;
      }
      > span {
        color: $grey;
        font-size: 13px;
        text-align: right;
        &.positive {
          color: $green;
        }
        &.negative {
          color: $red;
        }
      }
      > i {
        width: 7px;
        height: 7px;
        justify-self: end;
        border-top: 2px solid $grey-light;
        border-right: 2px solid $grey-light;
        transform: rotate(45deg);
      }
      ~ a {
        border-top: 1px solid $oat;
      }
    }
  }
}
</style>
