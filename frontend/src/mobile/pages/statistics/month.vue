<template>
  <main class="page statisticsMonth">
    <Breadcrumb
      :items="[
        {
          text: '統計',
          url: `/mobile/statistics?year=${selectedYear}`,
        },
        {
          text: `${selectedYear}年${selectedMonth}月`,
          url: route.fullPath,
        },
      ]"
    />

    <section class="balance-card" :class="{ isPastMonth }">
      <div class="balance-heading">
        <span>{{ selectedYear }} 年 {{ selectedMonth }} 月</span>
      </div>

      <div class="balance-details">
        <div>
          <span class="income">收入</span>
          <b>{{ formatAmount(incomeTotal) }} 元</b>
        </div>
        <div>
          <span class="expense">支出</span>
          <b>{{ formatAmount(expenseTotal) }} 元</b>
        </div>
        <div>
          <span class="balance">結餘</span>
          <b>
            {{ balance >= 0 ? '+' : '-' }}{{ formatAmount(Math.abs(balance)) }} 元
          </b>
        </div>
      </div>
    </section>

    <section
      v-for="group in categoryGroups"
      :key="group.kind"
      class="category-card"
    >
      <div class="card-heading">
        <strong>{{ group.kind === 'expense' ? '支出列表' : '收入列表' }}</strong>
      </div>

      <div v-if="group.items.length > 0" class="category-list">
        <router-link
          class="btn-click-effect list-btn-click-effect"
          v-for="item in group.items"
          :key="item.category.id"
          :to="{
            name: 'statistics-category',
            params: {
              year: selectedYear,
              month: String(selectedMonth).padStart(2, '0'),
              kind: group.kind,
              categoryId: item.category.id,
            },
          }"
        >
          <div
            class="category-icon"
            :style="{ backgroundColor: categoryColors[item.category.color] }"
          >
            <component :is="categoryIcons[item.category.icon]" />
          </div>
          <div class="category-info">
            <div class="category-heading">
              <h6>{{ item.category.name }}</h6>
              <span>{{ item.percentage }}%</span>
            </div>
            <div class="category-progress">
              <span :style="{ width: `${item.percentage}%` }" />
            </div>
          </div>
          <strong :class="{ income: group.kind === 'income' }">
            {{ group.kind === 'income' ? '+' : '' }}{{ formatAmount(item.total) }}
          </strong>
        </router-link>
      </div>
      <p v-else class="empty-state">
        這個月沒有{{ group.kind === 'expense' ? '支出' : '收入' }}紀錄
      </p>
    </section>

    <AppHeader right-action="scroll">
      <template #center>
        <PeriodSelector mode="month" />
      </template>
    </AppHeader>
  </main>
</template>

<script lang="ts" setup>
  import { computed } from 'vue'
  import { useRoute } from 'vue-router'
  import AppHeader from '@/mobile/components/AppHeader.vue'
  import Breadcrumb from '@/mobile/components/Breadcrumb.vue'
  import PeriodSelector from '@/mobile/components/childComponents/appHeader/PeriodSelector.vue'
  import { categoryColors } from '@/shared/colors/category'
  import { categoryIcons } from '@/shared/icons/category'
  import { useCategoryStore, type Category } from '@/shared/stores/category'
  import { useRecordStore } from '@/shared/stores/record'
  import { formatAmount } from '@/shared/utils/formatAmount'

  interface CategoryStatistic {
    category: Category
    total: number
    percentage: number
  }

  const route = useRoute()
  const categoryStore = useCategoryStore()
  const recordStore = useRecordStore()
  const now = new Date()

  const getRouteNumber = (value: unknown, fallback: number) => {
    const rawValue = Array.isArray(value) ? value[0] : value
    const numberValue = Number(rawValue)

    return Number.isInteger(numberValue) ? numberValue : fallback
  }

  const selectedYear = computed(() => getRouteNumber(route.params.year, now.getFullYear()))
  const selectedMonth = computed(() => getRouteNumber(route.params.month, now.getMonth() + 1))
  const monthRecords = computed(() => recordStore.getRecordsByMonth(
    selectedYear.value,
    selectedMonth.value,
  ))
  const categoryMap = computed(() => new Map(
    categoryStore.categoryList.map(category => [category.id, category]),
  ))
  const incomeTotal = computed(() => monthRecords.value.reduce((total, record) => {
    const category = categoryMap.value.get(record.categoryId)

    return total + (category && !category.isExpense ? record.amount : 0)
  }, 0))
  const expenseTotal = computed(() => monthRecords.value.reduce((total, record) => {
    const category = categoryMap.value.get(record.categoryId)

    return total + (category?.isExpense ? record.amount : 0)
  }, 0))
  const balance = computed(() => incomeTotal.value - expenseTotal.value)
  const isPastMonth = computed(() => {
    const selectedDate = selectedYear.value * 12 + selectedMonth.value
    const currentDate = now.getFullYear() * 12 + now.getMonth() + 1

    return selectedDate < currentDate
  })

  const getCategoryStatistics = (isExpense: boolean, total: number) => {
    const statisticMap = new Map<number, number>()

    monthRecords.value.forEach(record => {
      const category = categoryMap.value.get(record.categoryId)

      if (!category || category.isExpense !== isExpense) return

      statisticMap.set(category.id, (statisticMap.get(category.id) ?? 0) + record.amount)
    })

    return Array.from(statisticMap.entries())
      .map(([categoryId, categoryTotal]): CategoryStatistic | undefined => {
        const category = categoryMap.value.get(categoryId)

        if (!category) return undefined

        return {
          category,
          total: categoryTotal,
          percentage: total > 0 ? Math.round((categoryTotal / total) * 100) : 0,
        }
      })
      .filter((item): item is CategoryStatistic => item !== undefined)
      .sort((itemA, itemB) => itemB.total - itemA.total)
  }

  const categoryGroups = computed(() => [
    {
      kind: 'expense',
      items: getCategoryStatistics(true, expenseTotal.value),
    },
    {
      kind: 'income',
      items: getCategoryStatistics(false, incomeTotal.value),
    },
  ])
</script>

<style lang="scss" scoped>
.page.statisticsMonth {
  padding-bottom: calc($header_height + 40px);
  > .balance-card {
    padding: 22px;
    margin-top: 24px;
    border-radius: 24px;
    border: 1px solid $black;
    background-color: $black;
    transition: background-color .2s, border-color .2s;
    box-shadow: 0 18px 35px rgba($color: $black, $alpha: .3);
    > .balance-heading {
      @include flexbox(row, flex-end, center);
      > span {
        font-size: 13px;
        font-weight: 600;
        padding: 4px 11px;
        white-space: nowrap;
        border-radius: 99px;
        background-color: $yellow;
      }
    }
    > .balance-details {
      margin-top: 26px;
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
          }
          &.income::before {
            background-color: $green;
          }
          &.expense::before {
            background-color: #ff806f;
          }
          &.balance::before {
            background-color: $yellow;
          }
        }
        > b {
          color: $white;
          display: block;
          font-size: 13px;
          margin-top: 2px;
          font-weight: 600;
          padding-left: 13px;
          white-space: nowrap;
          transition: color .2s;
        }
      }
    }
    &.isPastMonth {
      border-color: $oat;
      background-color: $white;
      box-shadow: 0 12px 28px rgba($color: $black, $alpha: .08);
      > .balance-details {
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
  > .category-card {
    overflow: hidden;
    margin-top: 10px;
    border-radius: 8px;
    border: 1px solid $oat;
    background-color: $white;
    @include flexbox(column, flex-start, stretch);
    &:nth-of-type(2) {
      margin-top: 30px;
    }
    > .card-heading {
      width: 100%;
      padding: 0 12px;
      text-align: center;
      border-bottom: 1px solid $oat;
      @include flexbox(row, flex-start, center);
      > strong {
        display: block;
        color: $grey-light;
      }
    }
    > .category-list {
      width: 100%;
      padding: 8px 0;
      > a {
        height: 52px;
        padding: 0 8px;
        @include flexbox(row, flex-start, center);
        > .category-icon {
          width: 32px;
          flex: 0 0 auto;
          aspect-ratio: 1/1;
          border-radius: 50%;
          @include flexbox(row, center, center);
          > svg {
            width: 18px;
            stroke: $white;
          }
        }
        > .category-info {
          flex: 1;
          min-width: 0;
          margin-left: 8px;
          > .category-heading {
            @include flexbox(row, flex-start, baseline);
            > h6 {
              font-size: 16px;
            }
            > span {
              color: $grey;
              font-size: 11px;
              margin-left: 8px;
            }
          }
          > .category-progress {
            width: 100%;
            height: 4px;
            margin-top: 4px;
            overflow: hidden;
            border-radius: 99px;
            background-color: $oat;
            > span {
              height: 100%;
              display: block;
              min-width: 4px;
              border-radius: inherit;
              background-color: $yellow-dark;
            }
          }
        }
        > strong {
          flex: 0 0 60px;
          text-align: right;
          &.income {
            color: $green;
            font-weight: 600;
          }
        }
      }
    }
    > .empty-state {
      color: $grey;
      font-size: 13px;
      padding: 30px 14px;
      text-align: center;
    }
  }
}
</style>
