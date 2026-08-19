<template>
  <div class="page saving">
    <DesktopHeader />

    <main>
      <header>
        <h1>存款</h1>
      </header>
      <section class="savingSummary">
        <div class="vaultIcon">
          <PiggyBank />
        </div>
        <p>目前存款</p>
        <strong>$ {{ formatAmount(totalSaving) }}</strong>
      </section>

      <section v-if="monthlyRecords.length" class="monthlyRecords">
        <article v-for="monthRecord in monthlyRecords" :key="monthRecord.key">
          <header>
            <h2>{{ monthRecord.year }} 年 {{ monthRecord.month }} 月</h2>
            <span>
              共：{{ monthRecord.total > 0 ? '+' : '' }}{{ formatAmount(monthRecord.total) }}
            </span>
          </header>
          <ul>
            <li v-for="item in monthRecord.items" :key="item.key">
              <i :class="item.type">
                <Sparkles v-if="item.type === 'balance'" />
                <TrendingUp v-else-if="item.type === 'income'" />
                <TrendingDown v-else />
              </i>
              <b>{{ getTypeLabel(item.type) }}</b>
              <span :class="{ automatic: item.type === 'balance' }">{{ item.note }}</span>
              <strong :class="{ income: item.signedAmount > 0, expense: item.signedAmount < 0 }">
                {{ item.signedAmount > 0 ? '+' : '' }}{{ formatAmount(item.signedAmount) }}
              </strong>
            </li>
          </ul>
        </article>
      </section>
      <p v-else class="emptyState">還沒有存款收支紀錄</p>
    </main>

    <aside>
      <section class="savingFields">
        <section class="typeField">
          <h2>類別</h2>
          <div class="typeSelector">
            <label class="btn-click-effect">
              <input v-model="draft.type" type="radio" value="income" />
              <i />
              <span>收入</span>
            </label>
            <label class="btn-click-effect">
              <input v-model="draft.type" type="radio" value="expense" />
              <i />
              <span>支出</span>
            </label>
          </div>
        </section>

        <section class="monthField">
          <h2>時間</h2>
          <MonthPicker v-model="draft.occurredMonth" />
        </section>

        <section class="noteField">
          <h2>備註<span>＊</span></h2>
          <input
            v-model.trim="draft.note"
            type="text"
            maxlength="40"
            placeholder="輸入備註"
            :class="{ error: hasNoteError }"
            @input="hasNoteError = false"
          />
          <small :class="{ show: hasNoteError }">備註為必填欄位</small>
        </section>
      </section>

      <section class="savingEntry">
        <Calculator :key="calculatorKey" :amount="0" @save="saveTransaction" />
      </section>
    </aside>

    <AsideDialog
      :open="errorMessage !== ''"
      :message="errorMessage"
      :show-cancel="false"
      @cancel="errorMessage = ''"
      @confirm="errorMessage = ''"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, reactive, ref } from 'vue'
import { PiggyBank, Sparkles, TrendingDown, TrendingUp } from '@lucide/vue'
import DesktopHeader from '@/desktop/components/header.vue'
import AsideDialog from '@/desktop/components/index/aside/Dialog.vue'
import Calculator from '@/desktop/components/index/aside/panel/Calculator.vue'
import MonthPicker from '@/desktop/components/saving/MonthPicker.vue'
import { useCategoryStore } from '@/shared/stores/category'
import { useRecordStore } from '@/shared/stores/record'
import {
  useSavingStore,
  type SavingTransactionType,
} from '@/shared/stores/saving'
import { formatAmount } from '@/shared/utils/formatAmount'

type SavingDisplayType = SavingTransactionType | 'balance'

interface SavingDisplayItem {
  key: string
  type: SavingDisplayType
  note: string
  signedAmount: number
  order: number
}

interface MonthlySavingRecord {
  key: string
  year: number
  month: number
  total: number
  items: SavingDisplayItem[]
}

const getCurrentMonth = () => {
  const date = new Date()

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

const categoryStore = useCategoryStore()
const recordStore = useRecordStore()
const savingStore = useSavingStore()
const draft = reactive({
  type: 'expense' as SavingTransactionType,
  occurredMonth: getCurrentMonth(),
  note: '',
})
const hasNoteError = ref(false)
const errorMessage = ref('')
const calculatorKey = ref(0)

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

const monthlyRecords = computed<MonthlySavingRecord[]>(() => {
  const monthMap = new Map<string, SavingDisplayItem[]>()

  savingStore.transactionList.forEach(transaction => {
    const monthKey = transaction.occurredMonth
    const items = monthMap.get(monthKey) ?? []

    items.push({
      key: `transaction-${transaction.id}`,
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
    const items = monthMap.get(monthKey) ?? []

    items.push({
      key: `balance-${monthKey}`,
      type: 'balance',
      note: '本月結餘',
      signedAmount: balance,
      order: -1,
    })
    monthMap.set(monthKey, items)
  })

  return Array.from(monthMap.entries())
    .sort(([monthA], [monthB]) => monthB.localeCompare(monthA))
    .map(([monthKey, items]) => {
      const [year, month] = monthKey.split('-').map(Number)
      const sortedItems = items.slice().sort((itemA, itemB) => itemB.order - itemA.order)

      return {
        key: monthKey,
        year,
        month,
        total: sortedItems.reduce((total, item) => total + item.signedAmount, 0),
        items: sortedItems,
      }
    })
})

const totalSaving = computed(() => monthlyRecords.value
  .reduce((total, monthRecord) => total + monthRecord.total, 0),
)

const getTypeLabel = (type: SavingDisplayType) => {
  if (type === 'balance') return '結餘'

  return type === 'income' ? '收入' : '支出'
}
const saveTransaction = (amount: number) => {
  hasNoteError.value = !draft.note.trim()

  if (!Number.isInteger(amount) || amount <= 0) {
    errorMessage.value = '金額需為大於 0 的整數'
    return
  }
  if (hasNoteError.value) return

  savingStore.addTransaction({
    type: draft.type,
    note: draft.note.trim(),
    amount,
    occurredMonth: draft.occurredMonth,
  })

  draft.note = ''
  calculatorKey.value += 1
}
</script>

<style lang="scss" scoped>
.page.saving {
  width: 100%;
  height: 100dvh;
  min-height: 100vh;
  overflow: hidden;
  @include flexbox(row, flex-start, stretch);
  > main {
    flex: 1;
    gap: 22px;
    min-width: 0;
    height: 100%;
    padding: 28px 28px 48px;
    overflow-y: auto;
    scrollbar-gutter: stable;
    overscroll-behavior: contain;
    background: radial-gradient(circle at 25% 4%, rgba($yellow, .2), transparent 28%), $background;
    @include flexbox(column, flex-start, center);
    > header {
      width: 100%;
      max-width: 760px;
      > h1 {
        @include h2();
      }
    }
    > .savingSummary {
      width: 100%;
      padding: 24px;
      max-width: 460px;
      min-height: 190px;
      text-align: center;
      border-radius: 24px;
      border: 1px solid $black;
      background-color: $black;
      box-shadow: 0 18px 35px rgba($black, .24);
      @include flexbox(column, center, center);
      > .vaultIcon {
        width: 54px;
        height: 54px;
        margin-bottom: 10px;
        border-radius: 50%;
        background-color: $yellow;
        @include flexbox(column, center, center);
        > svg {
          width: 28px;
        }
      }
      > p {
        color: rgba($white, .65);
      }
      > strong {
        color: $white;
        display: block;
        max-width: 100%;
        overflow: hidden;
        font-size: 44px;
        font-weight: 600;
        line-height: 1.25;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
    }
    > .monthlyRecords {
      gap: 16px;
      width: 100%;
      max-width: 760px;
      @include flexbox(column, flex-start, stretch);
      > article {
        overflow: hidden;
        border-radius: 16px;
        border: 1px solid $oat;
        background-color: $white;
        box-shadow: 0 12px 28px rgba($black, .06);
        > header {
          height: 44px;
          padding: 0 16px;
          border-bottom: 1px solid $oat;
          background-color: $background;
          @include flexbox(row, space-between, center);
          > h2,
          > span {
            color: $grey;
            @include small();
          }
          > h2 {
            font-weight: 600;
          }
        }
        > ul {
          padding: 7px 14px;
          > li {
            gap: 12px;
            min-height: 48px;
            @include flexbox(row, flex-start, center);
            ~ li {
              border-top: 1px solid rgba($oat, .75);
            }
            > i {
              width: 32px;
              height: 32px;
              flex: 0 0 32px;
              border-radius: 50%;
              @include flexbox(row, center, center);
              &.income {
                background-color: rgba($green, .24);
              }
              &.expense {
                background-color: rgba($red, .22);
              }
              &.balance {
                background-color: rgba($yellow, .45);
              }
              > svg {
                width: 17px;
              }
            }
            > b {
              width: 34px;
              flex: 0 0 34px;
              font-size: 12px;
              font-weight: 600;
            }
            > span {
              flex: 1;
              color: $grey;
              min-width: 0;
              overflow: hidden;
              white-space: nowrap;
              text-overflow: ellipsis;
              @include small();
              &.automatic {
                color: $mustard;
              }
            }
            > strong {
              flex: 0 0 auto;
              font-weight: 600;
              text-align: right;
              &.income {
                color: $green;
              }
              &.expense {
                color: $red;
              }
            }
          }
        }
      }
    }
    > .emptyState {
      color: $grey;
      flex: 1;
      @include flexbox(row, center, center);
    }
  }
  > aside {
    gap: 12px;
    height: 100%;
    padding: 12px;
    overflow: hidden;
    flex: 0 0 420px;
    min-height: 100vh;
    border-left: 1px solid $oat;
    background-color: $white;
    @include flexbox(column, flex-start, stretch);
    > .savingFields {
      gap: 24px;
      @include flexbox(column, flex-start, stretch);
      > section {
        > h2 {
          font-size: 15px;
          font-weight: 600;
          margin-bottom: 10px;
        }
        > .typeSelector {
          gap: 4px;
          padding: 4px;
          border-radius: 10px;
          background-color: $oat;
          @include flexbox(row, stretch, center);
          > label {
            flex: 1;
            height: 36px;
            cursor: pointer;
            border-radius: 8px;
            transition: background-color .2s, box-shadow .2s;
            @include flexbox(row, center, center);
            > input {
              width: 0;
              height: 0;
              opacity: 0;
              position: absolute;
            }
            > i {
              display: none;
            }
            > span {
              color: $grey;
              font-weight: 600;
            }
            &:has(input:checked) {
              background-color: $yellow;
              box-shadow: 0 4px 12px rgba($black, .08);
              > span {
                color: $black;
              }
            }
          }
        }
      }
      > .noteField {
        > h2 > span {
          color: $red;
        }
        > input {
          width: 100%;
          height: 42px;
          padding: 0 10px;
          border-radius: 10px;
          border: 1px solid $oat;
          background-color: $white;
          &:focus {
            border-color: $yellow-dark;
          }
          &.error {
            border-color: $red;
          }
        }
        > small {
          color: $red;
          height: 0;
          opacity: 0;
          display: block;
          overflow: hidden;
          transition: .2s;
          @include small();
          &.show {
            height: 22px;
            opacity: 1;
          }
        }
      }
    }
    > .savingEntry {
      margin-top: auto;
      @include flexbox(column, flex-start, stretch);
      > :deep(.asideCalculator) {
        width: calc(100% + 24px);
        flex-shrink: 0;
        margin: 0 -12px -12px;
        border-right: 0;
        border-bottom: 0;
        border-left: 0;
        border-radius: 0;
      }
    }
  }
}

@media (max-width: 1120px) {
  .page.saving {
    > aside {
      flex-basis: 390px;
    }
  }
}
</style>
