import type { CategoryIconName } from '@/shared/icons/category'

export interface HomeRecordItem {
  id: number
  categoryId: number
  occurredAt: string
  icon: CategoryIconName
  color: string
  category: string
  isExpense: boolean
  tag: string[]
  note: string
  amount: number
  isAutomatic: boolean
}

export interface CategorySummaryItem {
  id: number
  icon: CategoryIconName
  color: string
  name: string
  amount: number
  isExpense: boolean
}
