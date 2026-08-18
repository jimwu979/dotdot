<template>
  <div class="page statistics">
    <DesktopHeader />
    <main>
      <header>
        <h1>統計</h1>
      </header>

      <section class="monthTable">
        <div class="tableHeading">
          <span aria-hidden="true" />
          <span>收入</span>
          <span>支出</span>
          <span>當月結餘</span>
        </div>
        <div class="monthList">
          <section v-for="yearGroup in yearGroups" :key="yearGroup.year">
            <h2>{{ yearGroup.year }}</h2>
            <button
              v-for="item in yearGroup.months"
              :key="item.key"
              class="btn-click-effect"
              :class="{ now: item.key === selectedMonthKey }"
              type="button"
              @click="selectedMonthKey = item.key"
            >
              <strong>{{ item.month }} 月</strong>
              <span class="income">{{ formatAmount(item.income) }}</span>
              <span class="expense">{{ formatAmount(item.expense) }}</span>
              <span :class="{ positive: item.balance > 0, negative: item.balance < 0 }">
                {{ item.balance > 0 ? '+' : '' }}{{ formatAmount(item.balance) }}
              </span>
              <ChevronRight />
            </button>
          </section>
        </div>
      </section>
    </main>

    <aside>
      <section class="categoryPanel">
        <div class="categoryList">
          <section v-for="group in categoryGroups" :key="group.kind">
            <h3>{{ group.kind === 'expense' ? '支出列表' : '收入列表' }}</h3>
            <button
              v-for="item in group.items"
              :key="item.category.id"
              class="btn-click-effect"
              :class="{ now: item.category.id === selectedCategoryId }"
              type="button"
              @click="selectedCategoryId = item.category.id"
            >
              <i :style="{ backgroundColor: categoryColors[item.category.color] }">
                <component :is="categoryIcons[item.category.icon]" />
              </i>
              <div>
                <p>
                  <strong>{{ item.category.name }}</strong>
                  <span>{{ item.percentage }}%</span>
                </p>
                <b><i :style="{ width: `${item.percentage}%` }" /></b>
              </div>
              <span>{{ formatAmount(item.total) }}</span>
              <ChevronRight />
            </button>
          </section>
        </div>
      </section>

      <section class="recordPanel">
        <header v-if="selectedCategory">
          <div>
            <i :style="{ backgroundColor: categoryColors[selectedCategory.color] }">
              <component :is="categoryIcons[selectedCategory.icon]" />
            </i>
            <div>
              <p>{{ selectedCategory.isExpense ? '支出' : '收入' }}明細</p>
              <h2>{{ selectedCategory.name }}</h2>
            </div>
          </div>
          <strong>{{ formatAmount(selectedCategoryTotal) }}</strong>
        </header>
        <div v-if="selectedCategoryRecords.length" class="recordList">
          <RouterLink
            v-for="record in selectedCategoryRecords"
            :key="record.id"
            class="btn-click-effect"
            :to="{
              name: 'index',
              params: {
                year: record.occurredAt.slice(0, 4),
                month: record.occurredAt.slice(5, 7),
              },
              query: { recordId: record.id },
            }"
          >
            <i :style="{ backgroundColor: categoryColors[selectedCategory!.color] }">
              <component :is="categoryIcons[selectedCategory!.icon]" />
            </i>
            <div>
              <p>
                <strong>
                  <time :datetime="record.occurredAt">{{ formatRecordDate(record.occurredAt) }}</time>
                </strong>
                <b v-for="tag in getRecordTags(record.categoryId, record.tagIds)" :key="tag">
                  {{ tag }}
                </b>
                <small v-if="record.note">{{ record.note }}</small>
              </p>
              <div class="recordShare">
                <b>
                  <i :style="{ width: `${getRecordPercentage(record.amount)}%` }" />
                </b>
                <span>{{ getRecordPercentage(record.amount) }}%</span>
              </div>
            </div>
            <strong :class="{ income: !selectedCategory!.isExpense }">
              {{ selectedCategory!.isExpense ? '' : '+' }}{{ formatAmount(record.amount) }}
            </strong>
          </RouterLink>
        </div>
        <p v-else class="emptyState">這個月還沒有此類別的記帳紀錄</p>
        <footer>
          <span>{{ selectedCategoryRecords.length }} 筆</span>
          <span>合計 {{ formatAmount(selectedCategoryTotal) }}</span>
        </footer>
      </section>
    </aside>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { ChevronRight } from '@lucide/vue'
import DesktopHeader from '@/desktop/components/header.vue'
import { categoryColors } from '@/shared/colors/category'
import { categoryIcons } from '@/shared/icons/category'
import { useCategoryStore, type Category } from '@/shared/stores/category'
import { useRecordStore } from '@/shared/stores/record'
import {
  useStatisticsStore,
  type MonthlyStatistics,
} from '@/shared/stores/statistics'
import { formatAmount } from '@/shared/utils/formatAmount'

interface CategoryStatistic {
  category: Category
  total: number
  percentage: number
}

const now = new Date()
const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
const categoryStore = useCategoryStore()
const recordStore = useRecordStore()
const statisticsStore = useStatisticsStore()
const selectedMonthKey = ref(
  statisticsStore.getMonthlyStatistics(currentMonthKey)?.key
  ?? statisticsStore.monthlyStatistics.at(-1)?.key
  ?? currentMonthKey,
)
const selectedCategoryId = ref<number>()
const categoryMap = computed(() => new Map(
  categoryStore.categoryList.map(category => [category.id, category]),
))
const monthStatistics = computed(() => statisticsStore.monthlyStatistics.slice().reverse())
const yearGroups = computed(() => {
  const groups = new Map<number, MonthlyStatistics[]>()

  monthStatistics.value.forEach(item => {
    groups.set(item.year, [...(groups.get(item.year) ?? []), item])
  })

  return Array.from(groups, ([year, months]) => ({ year, months }))
})
const selectedMonthRecords = computed(() => {
  const [year, month] = selectedMonthKey.value.split('-').map(Number)

  return recordStore.getRecordsByMonth(year, month)
})
const getCategoryStatistics = (isExpense: boolean) => {
  const totals = new Map<number, number>()

  selectedMonthRecords.value.forEach(record => {
    const category = categoryMap.value.get(record.categoryId)

    if (category?.isExpense !== isExpense) return
    totals.set(category.id, (totals.get(category.id) ?? 0) + record.amount)
  })

  const groupTotal = Array.from(totals.values()).reduce((total, amount) => total + amount, 0)

  return categoryStore.categoryList
    .filter(category => category.isExpense === isExpense)
    .map((category): CategoryStatistic => ({
      category,
      total: totals.get(category.id) ?? 0,
      percentage: groupTotal > 0
        ? Math.round(((totals.get(category.id) ?? 0) / groupTotal) * 100)
        : 0,
    }))
    .sort((itemA, itemB) => itemB.total - itemA.total || itemA.category.index - itemB.category.index)
}
const categoryGroups = computed(() => [
  { kind: 'expense', items: getCategoryStatistics(true) },
  { kind: 'income', items: getCategoryStatistics(false) },
])
const selectedCategory = computed(() => categoryMap.value.get(selectedCategoryId.value ?? 0))
const selectedCategoryRecords = computed(() => selectedMonthRecords.value
  .filter(record => record.categoryId === selectedCategoryId.value)
  .slice()
  .sort((recordA, recordB) => (
    recordB.amount - recordA.amount
    || recordB.occurredAt.localeCompare(recordA.occurredAt)
    || recordB.createdAt.localeCompare(recordA.createdAt)
  )),
)
const selectedCategoryTotal = computed(() => selectedCategoryRecords.value
  .reduce((total, record) => total + record.amount, 0),
)
const getRecordPercentage = (amount: number) => selectedCategoryTotal.value > 0
  ? Math.round((amount / selectedCategoryTotal.value) * 100)
  : 0
const getRecordTags = (categoryId: number, tagIds: number[]) => categoryMap.value
  .get(categoryId)?.tags
  .filter(tag => tagIds.includes(tag.id))
  .sort((tagA, tagB) => tagA.index - tagB.index)
  .map(tag => tag.name) ?? []
const formatRecordDate = (date: string) => {
  const [, month, day] = date.split('-').map(Number)

  return `${month}/${day}`
}

watch(
  selectedMonthKey,
  () => {
    selectedCategoryId.value = categoryGroups.value[0]?.items[0]?.category.id
  },
  { immediate: true },
)
</script>

<style lang="scss" scoped>
.page.statistics {
  width: 100%;
  height: 100dvh;
  min-height: 100vh;
  overflow: hidden;
  @include flexbox(row, flex-start, stretch);
  > main {
    flex: 0 0 420px;
    min-width: 0;
    padding-top: 28px;
    border-right: 1px solid $oat;
    @include flexbox(column, flex-start, stretch);
    > header {
      padding: 0 28px 20px;
      > h1 {
        @include h2();
      }
    }
    > .monthTable {
      flex: 1;
      min-height: 0;
      overflow: hidden;
      border-bottom: 1px solid $oat;
      @include flexbox(column, flex-start, stretch);
      > .tableHeading {
        gap: 8px;
        height: 42px;
        padding: 0 34px 0 82px;
        display: grid;
        flex: 0 0 42px;
        align-items: center;
        grid-template-columns: 54px repeat(3, minmax(58px, 1fr));
        border-bottom: 1px solid $oat;
        > span {
          color: $grey;
          text-align: right;
          @include small();
        }
      }
      > .monthList {
        flex: 1;
        min-height: 0;
        overflow-y: auto;
        padding: 8px 0 18px;
        scrollbar-width: none;
        overscroll-behavior: contain;
        &::-webkit-scrollbar {
          display: none;
        }
        > section {
          position: relative;
          @include flexbox(column, flex-start, stretch);
          > h2 {
            top: 14px;
            left: 18px;
            z-index: 2;
            color: $grey;
            position: absolute;
            pointer-events: none;
            @include small();
          }
          > button {
            width: 100%;
            gap: 8px;
            height: 48px;
            padding: 0 12px 0 82px;
            display: grid;
            position: relative;
            align-items: center;
            grid-template-columns: 54px repeat(3, minmax(58px, 1fr)) 14px;
            border-radius: 0;
            > strong {
              text-align: right;
              @include small();
            }
            > span {
              color: $grey;
              text-align: right;
              @include small();
              &.income,
              &.positive {
                color: $green;
              }
              &.expense,
              &.negative {
                color: $red;
              }
            }
            > svg {
              width: 14px;
              stroke: $grey-light;
            }
            &.now {
              background-color: rgba($yellow, .14);
            }
          }
          ~ section {
            margin-top: 8px;
            padding-top: 8px;
            border-top: 1px solid $oat;
          }
        }
      }
    }
  }
  > aside {
    flex: 1;
    gap: 0;
    min-width: 0;
    height: 100%;
    overflow: hidden;
    @include flexbox(row, flex-start, stretch);
    > section {
      min-width: 0;
      background-color: $white;
      @include flexbox(column, flex-start, stretch);
      > header {
        height: 96px;
        padding: 24px;
        flex: 0 0 96px;
        border-bottom: 1px solid $oat;
        > p {
          color: $grey;
          @include small();
        }
        > h2 {
          margin-top: 4px;
          @include h3();
        }
      }
    }
    > .categoryPanel {
      flex: 0 0 43%;
      border-right: 1px solid $stone;
      > .categoryList {
        flex: 1;
        min-height: 0;
        overflow-y: auto;
        padding: 20px 0 24px;
        scrollbar-width: none;
        overscroll-behavior: contain;
        &::-webkit-scrollbar {
          display: none;
        }
        > section {
          > h3 {
            color: $grey;
            padding: 10px 12px 8px;
            @include small();
            font-weight: 600;
          }
          > button {
            gap: 10px;
            width: 100%;
            height: 54px;
            padding: 5px 12px;
            border-radius: 0;
            @include flexbox(row, flex-start, center);
            > i {
              width: 34px;
              height: 34px;
              flex: 0 0 34px;
              border-radius: 50%;
              @include flexbox(row, center, center);
              > svg {
                width: 18px;
                stroke: $white;
              }
            }
            > div {
              flex: 1;
              min-width: 0;
              > p {
                @include flexbox(row, flex-start, baseline);
                > strong {
                  overflow: hidden;
                  white-space: nowrap;
                  text-overflow: ellipsis;
                }
                > span {
                  color: $grey;
                  font-size: 10px;
                  margin-left: 6px;
                }
              }
              > b {
                width: 100%;
                height: 4px;
                display: block;
                margin-top: 4px;
                overflow: hidden;
                border-radius: 99px;
                background-color: $stone;
                > i {
                  height: 100%;
                  display: block;
                  border-radius: inherit;
                  background-color: $yellow-dark;
                }
              }
            }
            > span {
              flex: 0 0 56px;
              text-align: right;
              @include small();
              font-weight: 600;
            }
            > svg {
              width: 14px;
              flex: 0 0 14px;
              stroke: $grey-light;
            }
            &:hover {
              background-color: rgba($oat, .55);
              &::before {
                opacity: 0;
              }
            }
            &.now {
              background-color: rgba($yellow, .14);
              > svg {
                stroke: $black;
              }
            }
          }
          ~ section {
            margin-top: 12px;
            padding-top: 8px;
            border-top: 1px solid $oat;
          }
        }
      }
    }
    > .recordPanel {
      flex: 1;
      background-color: $white;
      > header {
        background-color: $yellow;
        @include flexbox(row, space-between, center);
        > div {
          gap: 12px;
          min-width: 0;
          @include flexbox(row, flex-start, center);
          > i {
            width: 42px;
            height: 42px;
            flex: 0 0 42px;
            border-radius: 50%;
            @include flexbox(row, center, center);
            > svg {
              width: 22px;
              stroke: $white;
            }
          }
          > div {
            min-width: 0;
            > p {
              color: $grey;
              @include small();
            }
            > h2 {
              overflow: hidden;
              white-space: nowrap;
              text-overflow: ellipsis;
              @include h3();
            }
          }
        }
        > strong {
          white-space: nowrap;
          @include h3();
        }
      }
      > .recordList {
        flex: 1;
        min-height: 0;
        overflow-y: auto;
        padding: 12px 0;
        overscroll-behavior: contain;
        &::-webkit-scrollbar-button,
        &::-webkit-scrollbar-button:single-button,
        &::-webkit-scrollbar-button:vertical:decrement,
        &::-webkit-scrollbar-button:vertical:increment {
          width: 0;
          height: 0;
          display: none;
          background-color: transparent;
        }
        > a {
          gap: 10px;
          height: 54px;
          padding: 5px 8px;
          border-radius: 0;
          @include flexbox(row, flex-start, center);
          > i {
            width: 34px;
            height: 34px;
            flex: 0 0 34px;
            border-radius: 50%;
            @include flexbox(row, center, center);
            > svg {
              width: 18px;
              stroke: $white;
            }
          }
          > div {
            flex: 1;
            min-width: 0;
            > p {
              gap: 5px;
              min-width: 0;
              overflow: hidden;
              @include flexbox(row, flex-start, baseline);
              > strong {
                width: 40px;
                flex: 0 0 40px;
                > time {
                  font-size: inherit;
                  font-weight: 600;
                }
              }
              > b {
                color: $mustard;
                flex: 0 0 auto;
                padding: 0 4px;
                font-size: 10px;
                line-height: 16px;
                border-radius: 4px;
                border: 1px solid $mustard;
              }
              > small {
                flex: 1;
                color: $grey;
                min-width: 0;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
                @include small();
              }
            }
            > .recordShare {
              gap: 8px;
              margin-top: 4px;
              @include flexbox(row, flex-start, center);
              > b {
                flex: 1;
                height: 4px;
                display: block;
                overflow: hidden;
                border-radius: 99px;
                background-color: $stone;
                > i {
                  height: 100%;
                  display: block;
                  border-radius: inherit;
                  background-color: $yellow-dark;
                }
              }
              > span {
                color: $grey;
                flex: 0 0 30px;
                font-size: 10px;
                line-height: 12px;
                text-align: right;
              }
            }
          }
          > strong {
            flex: 0 0 56px;
            text-align: right;
            white-space: nowrap;
            @include small();
            &.income {
              color: $green;
            }
          }
        }
      }
      > .emptyState {
        flex: 1;
        color: $grey;
        min-height: 0;
        @include flexbox(row, center, center);
        @include small();
      }
      > footer {
        height: 48px;
        padding: 0 24px;
        flex: 0 0 48px;
        border-top: 1px solid $oat;
        background-color: rgba($white, .7);
        @include flexbox(row, space-between, center);
        > span {
          color: $grey;
          @include small();
          &:last-child {
            color: $black;
            font-weight: 600;
          }
        }
      }
    }
  }
}

@media (max-width: 1180px) {
  .page.statistics {
    > main {
      flex-basis: 390px;
    }
    > aside {
      > .categoryPanel {
        flex-basis: 47%;
      }
    }
  }
}
</style>
