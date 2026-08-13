<template>
  <main class="page saving">
    <p>{{ currentYear }} 年 {{ currentMonth }} 月 {{ currentDate }} 日</p>
    <h1>存款</h1>

    <!-- 存款總覽 -->
    <section class="saving-card">
      <div class="vault-icon">
        <PiggyBank />
      </div>
      <p>目前存款</p>
      <strong>$ {{ formatAmount(totalSaving) }}</strong>
    </section>

    <!-- 每月存款收支 -->
    <section class="monthly-records">
      <article v-for="month in monthlyRecords" :key="month.key">
        <div class="month-heading">
          <strong>{{ month.year }} 年 {{ month.month }} 月</strong>
          <b>總計 {{ formatSignedAmount(month.total) }}</b>
        </div>
        <div class="list">
          <RouterLink
            v-for="item in month.items"
            :key="item.key"
            class="transaction-item editable btn-click-effect list-btn-click-effect"
            :to="{
              name: 'saveing-edit',
              query: { id: item.transactionId },
            }"
          >
            <Transaction
              :icon="getTypeIcon(item.type)"
              :color="getTypeColor(item.type)"
              :category="item.type === 'income' ? '收入' : '支出'"
              :is-expense="item.signedAmount < 0"
              :tag="[]"
              :note="item.note || '未填寫備註'"
              :amount="Math.abs(item.signedAmount)"
            />
          </RouterLink>
          <div class="transaction-item auto-calculate" >
            <Transaction
              icon="Sparkles"
              :color="categoryColors.amber"
              category="結餘"
              :is-expense="month.balance < 0"
              :is-neutral="month.balance === 0"
              :tag="[]"
              note="由當月生活費收支自動計算"
              :amount="Math.abs(month.balance)"
            />
          </div>
        </div>
      </article>

      <p v-if="monthlyRecords.length === 0" class="empty-state">
        還沒有存款收支紀錄
      </p>
    </section>

    <!-- 新增存款收支 -->
    <RouterLink
      class="add-button btn-click-effect"
      :to="{ name: 'saveing-edit' }"
    >
      <Plus />
    </RouterLink>

    <AppHeader title="存款" right-action="scroll" />
  </main>
</template>

<script lang="ts" setup>
  import { computed } from 'vue'
  import { PiggyBank, Plus } from '@lucide/vue'
  import AppHeader from '@/mobile/components/AppHeader.vue'
  import Transaction from '@/mobile/components/transaction.vue'
  import { categoryColors } from '@/shared/colors/category'
  import type { CategoryIconName } from '@/shared/icons/category'
  import { useCategoryStore } from '@/shared/stores/category'
  import { useRecordStore } from '@/shared/stores/record'
  import { formatAmount } from '@/shared/utils/formatAmount'
  import {
    useSavingStore,
    type SavingTransactionType,
  } from '@/shared/stores/saving'

  interface SavingDisplayItem {
    key: string
    transactionId: number
    type: SavingTransactionType
    note: string
    signedAmount: number
    order: number
  }

  interface MonthlySavingRecords {
    key: string
    year: number
    month: number
    total: number
    balance: number
    items: SavingDisplayItem[]
  }

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1
  const currentDate = now.getDate()
  const categoryStore = useCategoryStore()
  const recordStore = useRecordStore()
  const savingStore = useSavingStore()

  const monthlyBalances = computed(() => {
    const balanceMap = new Map<string, number>()

    recordStore.recordList.forEach(record => {
      const category = categoryStore.categoryList
        .find(item => item.id === record.categoryId)

      if (!category) return

      const monthKey = record.occurredAt.slice(0, 7)
      const signedAmount = category.isExpense ? -record.amount : record.amount

      balanceMap.set(monthKey, (balanceMap.get(monthKey) ?? 0) + signedAmount)
    })

    return balanceMap
  })

  const monthlyRecords = computed<MonthlySavingRecords[]>(() => {
    const monthMap = new Map<string, SavingDisplayItem[]>()

    savingStore.transactionList.forEach(transaction => {
      const monthKey = transaction.occurredMonth
      const items = monthMap.get(monthKey) ?? []

      items.push({
        key: `transaction-${transaction.id}`,
        transactionId: transaction.id,
        type: transaction.type,
        note: transaction.note,
        signedAmount: transaction.type === 'expense'
          ? -transaction.amount
          : transaction.amount,
        order: transaction.id,
      })
      monthMap.set(monthKey, items)
    })

    monthlyBalances.value.forEach((balance, monthKey) => {
      if (!monthMap.has(monthKey)) monthMap.set(monthKey, [])
    })

    return Array.from(monthMap.entries())
      .sort(([monthA], [monthB]) => monthB.localeCompare(monthA))
      .map(([monthKey, items]) => {
        const [year, month] = monthKey.split('-').map(Number)
        const sortedItems = items.slice()
          .sort((itemA, itemB) => itemB.order - itemA.order)
        const balance = monthlyBalances.value.get(monthKey) ?? 0

        return {
          key: monthKey,
          year,
          month,
          total: sortedItems.reduce(
            (total, item) => total + item.signedAmount,
            balance,
          ),
          balance,
          items: sortedItems,
        }
      })
  })

  const manualTotal = computed(() => savingStore.transactionList
    .reduce((total, transaction) => (
      total + (transaction.type === 'expense' ? -transaction.amount : transaction.amount)
    ), 0),
  )
  const totalMonthlyBalance = computed(() => Array.from(monthlyBalances.value.values())
    .reduce((total, balance) => total + balance, 0),
  )
  const totalSaving = computed(() => manualTotal.value + totalMonthlyBalance.value)

  const formatSignedAmount = (amount: number) => {
    const sign = amount > 0 ? '+' : ''

    return `${sign}${formatAmount(amount)}`
  }
  const getTypeIcon = (type: SavingTransactionType): CategoryIconName => {
    return type === 'income' ? 'TrendingUp' : 'TrendingDown'
  }
  const getTypeColor = (type: SavingTransactionType) => {
    return type === 'income' ? categoryColors.mint : categoryColors.pink
  }
</script>

<style lang="scss" scoped>
.page.saving {
  z-index: 1;
  position: relative;
  padding-bottom: 200px;
  &::before {
    top: 0;
    left: 0;
    width: 100%;
    z-index: -1;
    content: '';
    height: 100dvh;
    position: fixed;
    background: radial-gradient(circle at 75% 3%, rgba(249, 219, 97, .24), transparent 30%), $background;
  }
  > p {
    color: $grey;
    font-size: 13px;
  }
  > h1 {
    @include h1();
    margin-top: 2px;
  }
  > .saving-card {
    padding: 24px;
    margin-top: 24px;
    text-align: center;
    border-radius: 24px;
    background-color: $black;
    box-shadow: 0 18px 35px rgba($color: $black, $alpha: .25);
    > .vault-icon {
      width: 54px;
      margin: 0 auto 10px;
      aspect-ratio: 1/1;
      border-radius: 50%;
      background-color: $yellow;
      @include flexbox(row, center, center);
      > svg {
        width: 28px;
      }
    }
    > p {
      color: rgba(255, 255, 255, .65);
    }
    > strong {
      color: $white;
      display: block;
      font-size: 44px;
      line-height: 1.25;
      margin-top: 2px;
    }
  }
  > .monthly-records {
    margin-top: 30px;
    > article {
      overflow: hidden;
      margin-top: 10px;
      border-radius: 8px;
      border: 1px solid $oat;
      background-color: $white;
      @include flexbox(column, flex-start, stretch);
      > .month-heading {
        width: 100%;
        padding: 0 12px;
        text-align: center;
        border-bottom: 1px solid $oat;
        @include flexbox(row, flex-start, center);
        > * {
          color: $grey-light;
        }
        > strong {
          display: block;
        }
        > b {
          flex: 1;
          text-align: right;
        }
      }
      > .list {
        width: 100%;
        padding: 8px 0 0;
        > .transaction-item {
          height: 52px;
          @include flexbox(row, flex-start, center);
          &.editable {
            padding: 0 8px;
            cursor: pointer;
          }
          &.auto-calculate{
            padding: 0 12px;
            @include flexbox(row, stretch, flex-start);
            background-color: rgba($color: $grey-light, $alpha: .15);
          }
        }
      }
    }
    > .empty-state {
      color: $grey;
      padding: 48px 0;
      text-align: center;
    }
  }
  > .add-button {
    right: 12px;
    bottom: 106px;
    width: 64px;
    z-index: 3;
    position: fixed;
    aspect-ratio: 1/1;
    border-radius: 50%;
    border: 2px solid $black;
    background-color: $yellow;
    transition: transform .2s;
    box-shadow: 0 8px 22px rgba(42, 36, 24, .2);
    @include flexbox(row, center, center);
    >svg{
      width: 30px;
    }
  }
}
</style>
