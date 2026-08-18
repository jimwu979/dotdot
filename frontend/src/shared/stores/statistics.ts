import { ref, type Ref } from 'vue'
import { defineStore } from 'pinia'
import { useCategoryStore } from '@/shared/stores/category'
import { useRecordStore } from '@/shared/stores/record'

export interface MonthlyStatistics {
  key: string
  year: number
  month: number
  income: number
  expense: number
  balance: number
}

const createStatisticsSeed = () => {
  const now = new Date()

  return Array.from({ length: 31 }, (_, monthIndex): MonthlyStatistics => {
    const date = new Date(now.getFullYear(), now.getMonth() - 30 + monthIndex, 1)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const income = 51200
      + Math.floor(monthIndex / 12) * 3000
      + ((monthIndex * 1370) % 6800)
    const expense = 32800
      + Math.floor(monthIndex / 12) * 1800
      + ((monthIndex * 2180) % 12500)

    return {
      key: `${year}-${String(month).padStart(2, '0')}`,
      year,
      month,
      income,
      expense,
      balance: income - expense,
    }
  })
}

export const useStatisticsStore = defineStore('statistics', () => {
  const categoryStore = useCategoryStore()
  const recordStore = useRecordStore()
  const monthlyStatistics: Ref<MonthlyStatistics[]> = ref(createStatisticsSeed())

  const replaceMonthlyStatistics = (statistics: MonthlyStatistics[]) => {
    monthlyStatistics.value = statistics
  }

  const getMonthlyStatistics = (key: string) => monthlyStatistics.value
    .find(statistics => statistics.key === key)

  const syncMonthFromRecords = (year: number, month: number) => {
    let income = 0
    let expense = 0

    recordStore.getRecordsByMonth(year, month).forEach(record => {
      const category = categoryStore.categoryList
        .find(category => category.id === record.categoryId)

      if (!category) return
      if (category.isExpense) expense += record.amount
      else income += record.amount
    })

    const key = `${year}-${String(month).padStart(2, '0')}`
    const statistics = getMonthlyStatistics(key)
    const nextStatistics = {
      key,
      year,
      month,
      income,
      expense,
      balance: income - expense,
    }

    if (statistics) Object.assign(statistics, nextStatistics)
    else monthlyStatistics.value.push(nextStatistics)
  }

  const now = new Date()

  syncMonthFromRecords(now.getFullYear(), now.getMonth() + 1)

  return {
    monthlyStatistics,
    replaceMonthlyStatistics,
    getMonthlyStatistics,
    syncMonthFromRecords,
  }
})
