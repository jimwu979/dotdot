<template>
  <main class="page statisticsCategory">
    <Breadcrumb
      :items="[
        {
          text: '統計',
          url: '/mobile/statistics',
        },
        {
          text: `${selectedYear}年${selectedMonth}月`,
          url: `/mobile/statistics/${selectedYear}/${String(selectedMonth).padStart(2, '0')}`,
        },
        {
          text: isExpense ? '支出' : '收入',
          url: `/mobile/statistics/${selectedYear}/${String(selectedMonth).padStart(2, '0')}`,
        },
        {
          text: category?.name ?? '分類',
          url: route.fullPath,
        },
      ]"
    />

    <section v-if="category" class="category-summary">
      <div
        class="category-icon"
        :style="{ backgroundColor: categoryColors[category.color] }"
      >
        <component :is="categoryIcons[category.icon]" />
      </div>
      <div>
        <span>{{ isExpense ? '支出' : '收入' }}類別</span>
        <h1>{{ category.name }}</h1>
      </div>
      <strong>{{ formatAmount(categoryTotal) }}</strong>
    </section>

    <section class="record-card">
      <div class="card-heading">
        <span>交易明細</span>
        <strong>總計 {{ formatAmount(categoryTotal) }}</strong>
      </div>
      <div v-if="categoryRecords.length > 0" class="record-list">
        <router-link
          v-for="record in categoryRecords"
          :key="record.id"
          :to="{
            path: '/mobile/record',
            query: { recordId: record.id },
          }"
        >
          <div
            v-if="category"
            class="category-icon"
            :style="{ backgroundColor: categoryColors[category.color] }"
          >
            <component :is="categoryIcons[category.icon]" />
            <span v-if="record.isAutomatic" class="status">
              <Repeat2 />
            </span>
          </div>
          <div class="record-info">
            <div class="record-heading">
              <h6>{{ category?.name }}</h6>
              <b v-for="tag in getRecordTags(record.tagIds)" :key="tag">{{ tag }}</b>
              <p>{{ record.note }}</p>
            </div>
            <div class="record-progress">
              <span :style="{ width: `${getRecordPercentage(record.amount)}%` }" />
            </div>
            <div class="record-meta">
              <time :datetime="record.occurredAt">
                {{ selectedMonth }}/{{ Number(record.occurredAt.slice(8, 10)) }}
              </time>
              <span>{{ getRecordPercentage(record.amount) }}%</span>
            </div>
          </div>
          <strong :class="{ income: !isExpense }">
            {{ isExpense ? '' : '+' }}{{ formatAmount(record.amount) }}
          </strong>
        </router-link>
      </div>
      <p v-else class="empty-state">這個月份沒有符合的記帳紀錄</p>
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
  import { Repeat2 } from '@lucide/vue'
  import AppHeader from '@/mobile/components/AppHeader.vue'
  import Breadcrumb from '@/mobile/components/Breadcrumb.vue'
  import PeriodSelector from '@/mobile/components/childComponents/appHeader/PeriodSelector.vue'
  import { categoryColors } from '@/shared/colors/category'
  import { categoryIcons } from '@/shared/icons/category'
  import { useCategoryStore } from '@/shared/stores/category'
  import { useRecordStore } from '@/shared/stores/record'
  import { formatAmount } from '@/shared/utils/formatAmount'

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
  const categoryId = computed(() => getRouteNumber(route.params.categoryId, 0))
  const isExpense = computed(() => route.params.kind === 'expense')
  const category = computed(() => categoryStore.categoryList.find(item => (
    item.id === categoryId.value
    && item.isExpense === isExpense.value
  )))
  const categoryRecords = computed(() => recordStore
    .getRecordsByMonth(selectedYear.value, selectedMonth.value)
    .filter(record => record.categoryId === categoryId.value)
    .sort((recordA, recordB) => (
      recordB.amount - recordA.amount
      || recordB.occurredAt.localeCompare(recordA.occurredAt)
      || recordB.createdAt.localeCompare(recordA.createdAt)
    )),
  )
  const categoryTotal = computed(() => categoryRecords.value
    .reduce((total, record) => total + record.amount, 0),
  )
  const getRecordTags = (tagIds: number[]) => {
    if (!category.value) return []

    return category.value.tags
      .filter(tag => tagIds.includes(tag.id))
      .map(tag => tag.name)
  }
  const getRecordPercentage = (amount: number) => categoryTotal.value > 0
    ? Math.round((amount / categoryTotal.value) * 100)
    : 0
</script>

<style lang="scss" scoped>
.page.statisticsCategory {
  padding-bottom: calc($header_height + 40px);
  > .category-summary {
    gap: 12px;
    padding: 0 18px;
    border-radius: 16px;
    @include flexbox(row, flex-start, center);
    > .category-icon {
      width: 52px;
      flex: 0 0 auto;
      aspect-ratio: 1/1;
      border-radius: 50%;
      @include flexbox(row, center, center);
      > svg {
        width: 27px;
        stroke: $white;
      }
    }
    > div:nth-child(2) {
      flex: 1;
      min-width: 0;
      > span {
        color: $grey;
        font-size: 12px;
      }
      > h1 {
        margin: 2px 0;
        font-size: 24px;
      }
    }
    > strong {
      font-size: 21px;
    }
  }
  > .record-card {
    overflow: hidden;
    margin-top: 30px;
    border-radius: 8px;
    border: 1px solid $oat;
    background-color: $white;
    @include flexbox(column, flex-start, stretch);
    > .card-heading {
      width: 100%;
      padding: 0 12px;
      text-align: center;
      border-bottom: 1px solid $oat;
      @include flexbox(row, space-between, center);
      > * {
        color: $grey-light;
      }
      > strong {
        display: block;
      }
    }
    > .record-list {
      width: 100%;
      padding: 8px;
      > a {
        height: 68px;
        @include flexbox(row, flex-start, center);
        > .category-icon {
          width: 32px;
          flex: 0 0 auto;
          aspect-ratio: 1/1;
          position: relative;
          border-radius: 50%;
          @include flexbox(row, center, center);
          > svg {
            width: 18px;
            stroke: $white;
          }
          > .status {
            right: -4px;
            width: 18px;
            bottom: -4px;
            aspect-ratio: 1/1;
            position: absolute;
            border-radius: 50%;
            background-color: $yellow;
            @include flexbox(row, center, center);
            > svg {
              width: 13px;
              stroke: $black;
            }
          }
        }
        > .record-info {
          flex: 1;
          min-width: 0;
          margin-left: 8px;
          > .record-heading {
            min-width: 0;
            @include flexbox(row, flex-start, center);
            > h6 {
              flex: 0 0 auto;
              font-size: 16px;
            }
            > b {
              flex: 0 0 auto;
              line-height: 1;
              color: $mustard;
              font-size: 12px;
              padding: 2px 4px;
              margin-left: 8px;
              border-radius: 4px;
              letter-spacing: 1px;
              border: 1px solid $mustard;
              background-color: $background;
              ~ b {
                margin-left: 4px;
              }
            }
            > p {
              flex: 1;
              color: $grey;
              min-width: 0;
              font-size: 12px;
              overflow: hidden;
              margin-left: 8px;
              white-space: nowrap;
              text-overflow: ellipsis;
            }
          }
          > .record-progress {
            width: 100%;
            height: 4px;
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
          > .record-meta {
            gap: 6px;
            @include flexbox(row, flex-start, center);
            > time,
            > span {
              color: $grey;
              font-size: 12px;
              line-height: 18px;
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
      padding: 40px 14px;
      text-align: center;
    }
  }
}
</style>
