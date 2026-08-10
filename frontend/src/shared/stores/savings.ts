import { ref, type Ref } from 'vue'
import { defineStore } from 'pinia'

export type SavingsTransactionType = 'income' | 'expense'

export interface SavingsTransaction {
  id: number
  type: SavingsTransactionType
  note: string
  amount: number
  occurredMonth: string
  createdAt: string
  updatedAt: string
}

export type SavingsTransactionData = Omit<
  SavingsTransaction,
  'id' | 'createdAt' | 'updatedAt'
>

const savingsSeeds: SavingsTransactionData[] = [
  { type: 'income', note: '年終獎金存入', amount: 12000, occurredMonth: '2026-06' },
  { type: 'expense', note: '更換筆電', amount: 24000, occurredMonth: '2026-06' },
  { type: 'income', note: '接案收入存入', amount: 18000, occurredMonth: '2026-07' },
  { type: 'expense', note: '年度保險', amount: 8600, occurredMonth: '2026-07' },
  { type: 'income', note: '旅遊基金', amount: 5000, occurredMonth: '2026-08' },
  { type: 'expense', note: '預訂九月住宿', amount: 3200, occurredMonth: '2026-08' },
]

export const useSavingsStore = defineStore('savings', () => {
  const timestamp = new Date().toISOString()
  const transactionList: Ref<SavingsTransaction[]> = ref(
    savingsSeeds.map((transaction, index) => ({
      ...transaction,
      id: index + 1,
      createdAt: timestamp,
      updatedAt: timestamp,
    })),
  )

  const addTransaction = (transactionData: SavingsTransactionData) => {
    const now = new Date().toISOString()
    const transaction: SavingsTransaction = {
      ...transactionData,
      id: Math.max(0, ...transactionList.value.map(item => item.id)) + 1,
      createdAt: now,
      updatedAt: now,
    }

    transactionList.value.push(transaction)

    return transaction
  }

  return {
    transactionList,
    addTransaction,
  }
})
