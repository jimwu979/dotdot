import { ref, type Ref } from 'vue'
import { defineStore } from 'pinia'
import type { CategoryIconName } from '@/shared/icons/category'

export interface Category {
  id: number
  isExpense: boolean
  icon: CategoryIconName
  color: string
  name: string
  index: number
}

export const useCategoryStore = defineStore('category', () => {
  const categoryList: Ref<Category[]> = ref([
    {
      id: 1,
      isExpense: false,
      icon: 'Banknote',
      color: '#FFF3BD',
      name: '薪資',
      index: 1,
    },
    {
      id: 2,
      isExpense: false,
      icon: 'Gift',
      color: '#E8DDF5',
      name: '獎金',
      index: 2,
    },
    {
      id: 3,
      isExpense: false,
      icon: 'CircleDollarSign',
      color: '#D7EFEA',
      name: '利息',
      index: 3,
    },
    {
      id: 4,
      isExpense: false,
      icon: 'TrendingUp',
      color: '#DCEBFA',
      name: '投資',
      index: 4,
    },
    {
      id: 5,
      isExpense: false,
      icon: 'Receipt',
      color: '#F9DCCF',
      name: '退款',
      index: 5,
    },
    {
      id: 6,
      isExpense: true,
      icon: 'Utensils',
      color: '#FFF3BD',
      name: '餐飲',
      index: 1,
    },
    {
      id: 7,
      isExpense: true,
      icon: 'Bus',
      color: '#DCEBFA',
      name: '交通',
      index: 3,
    },
    {
      id: 8,
      isExpense: true,
      icon: 'ShoppingCart',
      color: '#F6D6DF',
      name: '購物',
      index: 2,
    },
    {
      id: 9,
      isExpense: true,
      icon: 'Coffee',
      color: '#E8DDF5',
      name: '娛樂',
      index: 4,
    },
    {
      id: 10,
      isExpense: true,
      icon: 'House',
      color: '#DDEFD8',
      name: '居家',
      index: 5,
    },
    {
      id: 11,
      isExpense: true,
      icon: 'HeartPulse',
      color: '#F9DCCF',
      name: '醫療',
      index: 6,
    },
    {
      id: 12,
      isExpense: true,
      icon: 'GraduationCap',
      color: '#D7EFEA',
      name: '教育',
      index: 7,
    },
    {
      id: 13,
      isExpense: true,
      icon: 'Plane',
      color: '#DCEBFA',
      name: '旅行',
      index: 8,
    },
    {
      id: 14,
      isExpense: true,
      icon: 'Smartphone',
      color: '#DDEFD8',
      name: '通訊',
      index: 9,
    },
    {
      id: 15,
      isExpense: true,
      icon: 'Shirt',
      color: '#F6D6DF',
      name: '服飾',
      index: 10,
    },
    {
      id: 16,
      isExpense: true,
      icon: 'Dumbbell',
      color: '#F9DCCF',
      name: '運動',
      index: 11,
    },
    {
      id: 17,
      isExpense: true,
      icon: 'PawPrint',
      color: '#FFF3BD',
      name: '寵物',
      index: 12,
    },
  ])

  const updateCategoryOrder = (categoryIds: number[]) => {
    categoryIds.forEach((categoryId, index) => {
      const category = categoryList.value.find(category => category.id === categoryId)

      if (category) {
        category.index = index + 1
      }
    })
  }

  return {
    categoryList,
    updateCategoryOrder,
  }
})
