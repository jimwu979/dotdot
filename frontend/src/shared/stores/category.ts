import { ref, type Ref } from 'vue'
import { defineStore } from 'pinia'
import type { CategoryColorId } from '@/shared/colors/category'
import type { CategoryIconName } from '@/shared/icons/category'

export interface Tag {
  id: number
  index: number
  name: string
}

export interface Category {
  id: number
  isExpense: boolean
  icon: CategoryIconName
  color: CategoryColorId
  index: number
  name: string
  tags: Tag[]
}

export const useCategoryStore = defineStore('category', () => {
  const categoryList: Ref<Category[]> = ref([
    {
      id: 1,
      isExpense: false,
      icon: 'Banknote',
      color: 'amber',
      index: 1,
      name: '薪資',
      tags: [
        { id: 101, index: 1, name: '本薪' },
        { id: 102, index: 2, name: '加班費' },
        { id: 103, index: 3, name: '兼職' },
      ],
    },
    {
      id: 2,
      isExpense: false,
      icon: 'Gift',
      color: 'purple',
      index: 2,
      name: '獎金',
      tags: [
        { id: 201, index: 1, name: '績效獎金' },
        { id: 202, index: 2, name: '年終獎金' },
        { id: 203, index: 3, name: '其他獎勵' },
      ],
    },
    {
      id: 3,
      isExpense: false,
      icon: 'CircleDollarSign',
      color: 'mint',
      index: 3,
      name: '利息',
      tags: [
        { id: 301, index: 1, name: '存款利息' },
        { id: 302, index: 2, name: '股息' },
        { id: 303, index: 3, name: '債券利息' },
      ],
    },
    {
      id: 4,
      isExpense: false,
      icon: 'TrendingUp',
      color: 'blue',
      index: 4,
      name: '投資',
      tags: [
        { id: 401, index: 1, name: '股票' },
        { id: 402, index: 2, name: '基金' },
        { id: 403, index: 3, name: '其他投資' },
      ],
    },
    {
      id: 5,
      isExpense: false,
      icon: 'Receipt',
      color: 'coral',
      index: 5,
      name: '退款',
      tags: [
        { id: 501, index: 1, name: '退貨退款' },
        { id: 502, index: 2, name: '帳單回饋' },
        { id: 503, index: 3, name: '報帳' },
      ],
    },
    {
      id: 6,
      isExpense: true,
      icon: 'Utensils',
      color: 'amber',
      index: 1,
      name: '餐飲',
      tags: [
        { id: 601, index: 1, name: '早餐' },
        { id: 602, index: 2, name: '午餐' },
        { id: 603, index: 3, name: '晚餐' },
        { id: 604, index: 4, name: '飲料' },
      ],
    },
    {
      id: 7,
      isExpense: true,
      icon: 'Bus',
      color: 'blue',
      index: 3,
      name: '交通',
      tags: [
        { id: 701, index: 1, name: '捷運' },
        { id: 702, index: 2, name: '公車' },
        { id: 703, index: 3, name: '計程車' },
        { id: 704, index: 4, name: '加油' },
      ],
    },
    {
      id: 8,
      isExpense: true,
      icon: 'ShoppingCart',
      color: 'pink',
      index: 2,
      name: '購物',
      tags: [
        { id: 801, index: 1, name: '日用品' },
        { id: 802, index: 2, name: '3C' },
        { id: 803, index: 3, name: '網路購物' },
        { id: 804, index: 4, name: '禮物' },
      ],
    },
    {
      id: 9,
      isExpense: true,
      icon: 'Coffee',
      color: 'purple',
      index: 4,
      name: '娛樂',
      tags: [
        { id: 901, index: 1, name: '電影' },
        { id: 902, index: 2, name: '遊戲' },
        { id: 903, index: 3, name: '展覽' },
        { id: 904, index: 4, name: '聚會' },
      ],
    },
    {
      id: 10,
      isExpense: true,
      icon: 'House',
      color: 'lime',
      index: 5,
      name: '居家',
      tags: [
        { id: 1001, index: 1, name: '房租' },
        { id: 1002, index: 2, name: '水電瓦斯' },
        { id: 1003, index: 3, name: '家具' },
        { id: 1004, index: 4, name: '清潔' },
      ],
    },
    {
      id: 11,
      isExpense: true,
      icon: 'HeartPulse',
      color: 'coral',
      index: 6,
      name: '醫療',
      tags: [
        { id: 1101, index: 1, name: '掛號' },
        { id: 1102, index: 2, name: '藥品' },
        { id: 1103, index: 3, name: '牙科' },
        { id: 1104, index: 4, name: '健檢' },
      ],
    },
    {
      id: 12,
      isExpense: true,
      icon: 'GraduationCap',
      color: 'mint',
      index: 7,
      name: '教育',
      tags: [
        { id: 1201, index: 1, name: '書籍' },
        { id: 1202, index: 2, name: '課程' },
        { id: 1203, index: 3, name: '文具' },
        { id: 1204, index: 4, name: '考試' },
      ],
    },
    {
      id: 13,
      isExpense: true,
      icon: 'Plane',
      color: 'blue',
      index: 8,
      name: '旅行',
      tags: [
        { id: 1301, index: 1, name: '交通票券' },
        { id: 1302, index: 2, name: '住宿' },
        { id: 1303, index: 3, name: '景點門票' },
        { id: 1304, index: 4, name: '伴手禮' },
      ],
    },
    {
      id: 14,
      isExpense: true,
      icon: 'Smartphone',
      color: 'lime',
      index: 9,
      name: '通訊',
      tags: [
        { id: 1401, index: 1, name: '手機費' },
        { id: 1402, index: 2, name: '網路費' },
        { id: 1403, index: 3, name: '軟體訂閱' },
      ],
    },
    {
      id: 15,
      isExpense: true,
      icon: 'Shirt',
      color: 'pink',
      index: 10,
      name: '服飾',
      tags: [
        { id: 1501, index: 1, name: '上衣' },
        { id: 1502, index: 2, name: '褲子' },
        { id: 1503, index: 3, name: '鞋子' },
        { id: 1504, index: 4, name: '配件' },
      ],
    },
    {
      id: 16,
      isExpense: true,
      icon: 'Dumbbell',
      color: 'coral',
      index: 11,
      name: '運動',
      tags: [
        { id: 1601, index: 1, name: '健身房' },
        { id: 1602, index: 2, name: '運動裝備' },
        { id: 1603, index: 3, name: '場地' },
        { id: 1604, index: 4, name: '運動飲料' },
      ],
    },
    {
      id: 17,
      isExpense: true,
      icon: 'PawPrint',
      color: 'amber',
      index: 12,
      name: '寵物',
      tags: [
        { id: 1701, index: 1, name: '飼料' },
        { id: 1702, index: 2, name: '醫療' },
        { id: 1703, index: 3, name: '用品' },
        { id: 1704, index: 4, name: '美容' },
      ],
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
