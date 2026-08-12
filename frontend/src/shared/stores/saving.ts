import { ref, type Ref } from 'vue'
import { defineStore } from 'pinia'

export type SavingTransactionType = 'income' | 'expense'

export interface SavingTransaction {
  id: number
  type: SavingTransactionType
  note: string
  amount: number
  occurredMonth: string
  createdAt: string
  updatedAt: string
}

export type SavingTransactionData = Omit<
  SavingTransaction,
  'id' | 'createdAt' | 'updatedAt'
>

const savingSeeds: SavingTransactionData[] = [
  { type: 'income', note: '年終獎金存入', amount: 12000, occurredMonth: '2026-06' },
  { type: 'expense', note: '更換筆電', amount: 24000, occurredMonth: '2026-06' },
  { type: 'income', note: '接案收入存入', amount: 18000, occurredMonth: '2026-07' },
  { type: 'expense', note: '年度保險', amount: 8600, occurredMonth: '2026-07' },
  { type: 'income', note: '旅遊基金', amount: 5000, occurredMonth: '2026-08' },
  { type: 'expense', note: '預訂九月住宿', amount: 3200, occurredMonth: '2026-08' },
]

export const useSavingStore = defineStore('saving', () => {
  const timestamp = new Date().toISOString()
  const transactionList: Ref<SavingTransaction[]> = ref(
    savingSeeds.map((transaction, index) => ({
      ...transaction,
      id: index + 1,
      createdAt: timestamp,
      updatedAt: timestamp,
    })),
  )

  const addTransaction = (transactionData: SavingTransactionData) => {
    const now = new Date().toISOString()
    const transaction: SavingTransaction = {
      ...transactionData,
      id: Math.max(0, ...transactionList.value.map(item => item.id)) + 1,
      createdAt: now,
      updatedAt: now,
    }

    transactionList.value.push(transaction)

    return transaction
  }

  const updateTransaction = (
    transactionId: number,
    transactionData: SavingTransactionData,
  ) => {
    const transaction = transactionList.value
      .find(item => item.id === transactionId)

    if (!transaction) return false

    Object.assign(transaction, transactionData, {
      updatedAt: new Date().toISOString(),
    })

    return true
  }

  const deleteTransaction = (transactionId: number) => {
    const transactionIndex = transactionList.value
      .findIndex(item => item.id === transactionId)

    if (transactionIndex === -1) return false

    transactionList.value.splice(transactionIndex, 1)

    return true
  }

  return {
    transactionList,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  }
})
