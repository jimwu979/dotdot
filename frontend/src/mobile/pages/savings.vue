<template>
  <main class="page savings">
    <p>{{ currentYear }} 年 {{ currentMonth }} 月 {{ currentDate }} 日</p>
    <h1>存款</h1>

    <!-- 存款總覽 -->
    <section class="savings-card">
      <div class="vault-icon">
        <PiggyBank />
      </div>
      <p>目前存款</p>
      <strong>$ {{ formatAmount(totalSavings) }}</strong>
    </section>

    <!-- 每月存款收支 -->
    <section class="monthly-records">
      <article v-for="month in monthlyRecords" :key="month.key">
        <div class="month-heading">
          <strong>{{ month.year }} 年 {{ month.month }} 月</strong>
          <b>總計 {{ formatSignedAmount(month.total) }}</b>
        </div>
        <div class="list">
          <div
            v-for="item in month.items"
            :key="item.key"
            class="transaction-item"
          >
            <Transaction
              :icon="getTypeIcon(item.type)"
              :color="getTypeColor(item.type)"
              :category="getTypeLabel(item.type)"
              :is-expense="item.signedAmount < 0"
              :tag="[]"
              :note="item.note"
              :amount="Math.abs(item.signedAmount)"
            />
          </div>
        </div>
      </article>

      <p v-if="monthlyRecords.length === 0" class="empty-state">
        還沒有存款收支紀錄
      </p>
    </section>

    <!-- 新增存款收支 -->
    <button
      class="add-button"
      :class="{ close: isEditorOpen }"
      type="button"
      :aria-label="isEditorOpen ? '關閉新增存款收支' : '新增存款收支'"
      @click="toggleEditor"
    />

    <div
      class="savings-editor-backdrop"
      :class="{ 'isOpen': isEditorOpen }"
      @click.self="closeEditor"
    >
      <form
        class="savings-editor"
        novalidate
        @submit.prevent="submitTransaction"
      >
        <section class="form-field">
          <label>存款收支</label>
          <div class="type-selector">
            <button
              type="button"
              :class="{ current: draft.type === 'income' }"
              @click="draft.type = 'income'"
            >
              收入
            </button>
            <button
              type="button"
              :class="{ current: draft.type === 'expense' }"
              @click="draft.type = 'expense'"
            >
              支出
            </button>
          </div>
        </section>

        <section class="form-field">
          <label for="savings-amount">金額</label>
          <input
            id="savings-amount"
            v-model.number="draft.amount"
            type="number"
            inputmode="decimal"
            min="1"
            step="1"
            placeholder="0"
            required
            @input="amountError = ''"
          >
          <p class="error-message">
            <b
              :class="{ show: amountError }"
              :style="{ color: categoryColors.pink }"
            >
              請輸入有效的金額
            </b>
          </p>
        </section>
        <section class="form-field">
          <label>月份</label>
          <div class="month-selector">
            <button
              class="prev"
              type="button"
              aria-label="上一個月"
              @click="changeDraftMonth(-1)"
            />
            <strong>{{ draftYear }} 年 {{ draftMonth }} 月</strong>
            <button
              class="next"
              type="button"
              aria-label="下一個月"
              @click="changeDraftMonth(1)"
            />
          </div>
        </section>
        <section class="form-field">
          <label for="savings-note">備註</label>
          <input
            id="savings-note"
            v-model.trim="draft.note"
            type="text"
            maxlength="40"
            @input="noteError = ''"
          >
          <p class="error-message">
            <b
              :class="{ show: noteError }"
              :style="{ color: categoryColors.pink }"
            >
              備註為必填欄位
            </b>
          </p>
        </section>

        <button class="save-button" type="submit">儲存紀錄</button>
      </form>
    </div>

    <AppHeader right-action="scroll" />
  </main>
</template>

<script lang="ts" setup>
  import { computed, reactive, ref } from 'vue'
  import { PiggyBank } from '@lucide/vue'
  import AppHeader from '@/mobile/components/AppHeader.vue'
  import Transaction from '@/mobile/components/transaction.vue'
  import { categoryColors } from '@/shared/colors/category'
  import type { CategoryIconName } from '@/shared/icons/category'
  import { useCategoryStore } from '@/shared/stores/category'
  import { useRecordStore } from '@/shared/stores/record'
  import {
    useSavingsStore,
    type SavingsTransactionType,
  } from '@/shared/stores/savings'

  type SavingsDisplayType = SavingsTransactionType | 'balance'

  interface SavingsDisplayItem {
    key: string
    type: SavingsDisplayType
    note: string
    signedAmount: number
    order: number
  }

  interface MonthlySavingsRecords {
    key: string
    year: number
    month: number
    total: number
    items: SavingsDisplayItem[]
  }

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1
  const currentDate = now.getDate()
  const currentMonthKey = [
    currentYear,
    String(currentMonth).padStart(2, '0'),
  ].join('-')
  const categoryStore = useCategoryStore()
  const recordStore = useRecordStore()
  const savingsStore = useSavingsStore()
  const isEditorOpen = ref(false)
  const amountError = ref('')
  const noteError = ref('')
  const draft = reactive({
    type: 'expense' as SavingsTransactionType,
    amount: 0,
    occurredMonth: currentMonthKey,
    note: '',
  })
  const draftYear = computed(() => Number(draft.occurredMonth.slice(0, 4)))
  const draftMonth = computed(() => Number(draft.occurredMonth.slice(5, 7)))

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

  const monthlyRecords = computed<MonthlySavingsRecords[]>(() => {
    const monthMap = new Map<string, SavingsDisplayItem[]>()

    savingsStore.transactionList.forEach(transaction => {
      const monthKey = transaction.occurredMonth
      const items = monthMap.get(monthKey) ?? []

      items.push({
        key: `transaction-${transaction.id}`,
        type: transaction.type,
        note: transaction.note || '未填寫備註',
        signedAmount: transaction.type === 'expense'
          ? -transaction.amount
          : transaction.amount,
        order: transaction.id,
      })
      monthMap.set(monthKey, items)
    })

    monthlyBalances.value.forEach((balance, monthKey) => {
      if (balance <= 0) return

      const items = monthMap.get(monthKey) ?? []

      items.push({
        key: `balance-${monthKey}`,
        type: 'balance',
        note: '由當月生活費收支自動計算',
        signedAmount: balance,
        order: 0,
      })
      monthMap.set(monthKey, items)
    })

    return Array.from(monthMap.entries())
      .sort(([monthA], [monthB]) => monthB.localeCompare(monthA))
      .map(([monthKey, items]) => {
        const [year, month] = monthKey.split('-').map(Number)
        const sortedItems = items.slice().sort((itemA, itemB) => {
          if (itemA.type === 'balance') return 1
          if (itemB.type === 'balance') return -1

          return itemB.order - itemA.order
        })

        return {
          key: monthKey,
          year,
          month,
          total: sortedItems.reduce((total, item) => total + item.signedAmount, 0),
          items: sortedItems,
        }
      })
  })

  const manualTotal = computed(() => savingsStore.transactionList
    .reduce((total, transaction) => (
      total + (transaction.type === 'expense' ? -transaction.amount : transaction.amount)
    ), 0),
  )
  const totalMonthlyBalance = computed(() => Array.from(monthlyBalances.value.values())
    .filter(balance => balance > 0)
    .reduce((total, balance) => total + balance, 0),
  )
  const totalSavings = computed(() => manualTotal.value + totalMonthlyBalance.value)

  const formatAmount = (amount: number) =>
    String(Math.trunc(amount)).replace(/\B(?=(\d{4})+(?!\d))/g, ',')
  const formatSignedAmount = (amount: number) => {
    const sign = amount > 0 ? '+' : ''

    return `${sign}${formatAmount(amount)}`
  }
  const getTypeLabel = (type: SavingsDisplayType) => {
    if (type === 'balance') return '結餘'

    return type === 'income' ? '收入' : '支出'
  }
  const getTypeIcon = (type: SavingsDisplayType): CategoryIconName => {
    if (type === 'balance') return 'Sparkles'

    return type === 'income' ? 'TrendingUp' : 'TrendingDown'
  }
  const getTypeColor = (type: SavingsDisplayType) => {
    if (type === 'balance') return categoryColors.amber

    return type === 'income' ? categoryColors.mint : categoryColors.pink
  }

  const resetDraft = () => {
    draft.type = 'expense'
    draft.amount = 0
    draft.occurredMonth = currentMonthKey
    draft.note = ''
  }
  const changeDraftMonth = (offset: number) => {
    const selectedMonth = new Date(draftYear.value, draftMonth.value - 1 + offset, 1)

    draft.occurredMonth = [
      selectedMonth.getFullYear(),
      String(selectedMonth.getMonth() + 1).padStart(2, '0'),
    ].join('-')
  }
  const toggleEditor = () => {
    isEditorOpen.value = !isEditorOpen.value
  }
  const closeEditor = () => {
    isEditorOpen.value = false
    amountError.value = ''
    noteError.value = ''
  }
  const submitTransaction = () => {
    const amount = Math.trunc(Number(draft.amount))

    amountError.value = Number.isFinite(amount) && amount > 0
      ? ''
      : '請輸入有效的金額'
    noteError.value = draft.note.trim()
      ? ''
      : '備註為必填欄位'

    if (
      amountError.value
      || !draft.occurredMonth
      || noteError.value
    ) return

    savingsStore.addTransaction({
      type: draft.type,
      amount,
      occurredMonth: draft.occurredMonth,
      note: draft.note,
    })
    resetDraft()
    closeEditor()
  }
</script>

<style lang="scss" scoped>
.page.savings {
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
  > .savings-card {
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
        padding: 8px;
        > .transaction-item {
          height: 46px;
          @include flexbox(row, flex-start, center);
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
    &::before,
    &::after {
      top: 50%;
      left: 50%;
      content: '';
      position: absolute;
      border-radius: 99px;
      background-color: $black;
      transform: translate(-50%, -50%);
    }
    &::before {
      width: 22px;
      height: 2px;
    }
    &::after {
      width: 2px;
      height: 22px;
    }
    &.close {
      transform: rotate(45deg);
    }
  }
}

.savings-editor-backdrop {
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  opacity: 0;
  position: fixed;
  padding: 12px 12px 182px;
  pointer-events: none;
  transition: opacity .2s;
  background-color: rgba(42, 36, 24, .52);
  @include flexbox(column, flex-end, stretch);
  > .savings-editor {
    gap: 14px;
    opacity: 0;
    padding: 22px;
    transition: .2s;
    border-radius: 24px;
    transform: scale(.6);
    background-color: $white;
    transform-origin: right bottom;
    @include flexbox(column, flex-start, stretch);
    box-shadow: 0 16px 40px rgba(42, 36, 24, .3);
    > .form-field {
      width: 100%;
      min-width: 0;
      > label {
        color: $grey;
        display: block;
        font-size: 12px;
        margin-bottom: 5px;
      }
      > input {
        width: 100%;
        min-width: 0;
        max-width: 100%;
        display: block;
        padding: 11px 12px;
        border-radius: 8px;
        border: 1px solid $oat;
        background-color: $background;
        &:focus {
          border-color: $yellow-dark;
        }
      }
      > .type-selector {
        gap: 8px;
        padding: 5px;
        border-radius: 12px;
        background-color: rgba($oat, .6);
        @include flexbox(row, center, center);
        > button {
          flex: 1;
          padding: 10px;
          border-radius: 8px;
          transition: background-color .2s;
          &.current {
            font-weight: 600;
            background-color: $yellow;
          }
        }
      }
      > .error-message {
        min-height: 22px;
        padding-top: 4px;
        position: relative;
        pointer-events: none;
        > b {
          top: 4px;
          left: 0;
          opacity: 0;
          font-weight: 400;
          position: absolute;
          pointer-events: none;
          transition: opacity .2s;
          @include p();
          &.show {
            opacity: 1;
            pointer-events: auto;
          }
        }
      }
      > .month-selector {
        width: 100%;
        padding: 7px 8px;
        border-radius: 8px;
        border: 1px solid $oat;
        background-color: $background;
        @include flexbox(row, space-between, center);
        > strong {
          font-size: 14px;
          font-weight: 600;
        }
        > button {
          width: 32px;
          aspect-ratio: 1/1;
          position: relative;
          border-radius: 6px;
          background-color: $white;
          &::before {
            top: 50%;
            left: 50%;
            width: 8px;
            height: 8px;
            content: '';
            position: absolute;
            border-left: 2px solid $black;
            border-bottom: 2px solid $black;
          }
          &.prev::before {
            transform: translate(-35%, -50%) rotate(45deg);
          }
          &.next::before {
            transform: translate(-65%, -50%) rotate(225deg);
          }
        }
      }
    }
    > .save-button {
      padding: 13px;
      font-weight: 600;
      margin-top: 4px;
      border-radius: 10px;
      background-color: $yellow;
    }
  }
  &.isOpen {
    opacity: 1;
    pointer-events: auto;
    > .savings-editor {
      opacity: 1;
      transform: scale(1);
    }
  }
}
</style>
