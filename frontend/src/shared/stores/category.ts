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

export type CategoryData = Omit<Category, 'id' | 'index'>

export const useCategoryStore = defineStore('category', () => {
  const categoryList: Ref<Category[]> = ref([
    {
      id: 1,
      isExpense: false,
      icon: 'Banknote',
      color: 'amber',
      index: 1,
      name: '薪水',
      tags: [
        { id: 101, index: 1, name: '本薪' },
        { id: 102, index: 2, name: '加班' },
        { id: 103, index: 3, name: '接案' },
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
        { id: 201, index: 1, name: '績效' },
        { id: 202, index: 2, name: '年終' },
        { id: 203, index: 3, name: '抽獎' },
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
        { id: 301, index: 1, name: '活存' },
        { id: 302, index: 2, name: '定存' },
        { id: 303, index: 3, name: '股息' },
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
        { id: 402, index: 2, name: 'ETF' },
        { id: 403, index: 3, name: '基金' },
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
        { id: 501, index: 1, name: '退貨' },
        { id: 502, index: 2, name: '回饋金' },
        { id: 503, index: 3, name: '公司報帳' },
      ],
    },
    {
      id: 6,
      isExpense: true,
      icon: 'Coffee',
      color: 'amber',
      index: 1,
      name: '早餐',
      tags: [
        { id: 601, index: 1, name: '超商' },
        { id: 602, index: 2, name: '早餐店' },
        { id: 603, index: 3, name: '自己煮' },
      ],
    },
    {
      id: 7,
      isExpense: true,
      icon: 'Utensils',
      color: 'blue',
      index: 2,
      name: '午餐',
      tags: [
        { id: 701, index: 1, name: '便當' },
        { id: 702, index: 2, name: '公司附近' },
        { id: 703, index: 3, name: '外送' },
      ],
    },
    {
      id: 8,
      isExpense: true,
      icon: 'Soup',
      color: 'purple',
      index: 3,
      name: '晚餐',
      tags: [
        { id: 801, index: 1, name: '自煮' },
        { id: 802, index: 2, name: '聚餐' },
        { id: 803, index: 3, name: '外帶' },
      ],
    },
    {
      id: 9,
      isExpense: true,
      icon: 'CupSoda',
      color: 'pink',
      index: 4,
      name: '飲料',
      tags: [
        { id: 901, index: 1, name: '咖啡' },
        { id: 902, index: 2, name: '手搖' },
        { id: 903, index: 3, name: '酒' },
      ],
    },
    {
      id: 10,
      isExpense: true,
      icon: 'Bus',
      color: 'blue',
      index: 5,
      name: '交通',
      tags: [
        { id: 1001, index: 1, name: '捷運' },
        { id: 1002, index: 2, name: '公車' },
        { id: 1003, index: 3, name: '計程車' },
        { id: 1004, index: 4, name: '加油' },
      ],
    },
    {
      id: 11,
      isExpense: true,
      icon: 'ShoppingCart',
      color: 'pink',
      index: 6,
      name: '購物',
      tags: [
        { id: 1101, index: 1, name: '日用品' },
        { id: 1102, index: 2, name: '網購' },
        { id: 1103, index: 3, name: '3C' },
      ],
    },
    {
      id: 12,
      isExpense: true,
      icon: 'Gamepad2',
      color: 'purple',
      index: 7,
      name: '玩',
      tags: [
        { id: 1201, index: 1, name: '電影' },
        { id: 1202, index: 2, name: '遊戲' },
        { id: 1203, index: 3, name: '展覽' },
        { id: 1204, index: 4, name: '演唱會' },
      ],
    },
    {
      id: 13,
      isExpense: true,
      icon: 'House',
      color: 'lime',
      index: 8,
      name: '生活費',
      tags: [
        { id: 1301, index: 1, name: '房租' },
        { id: 1302, index: 2, name: '水電' },
        { id: 1303, index: 3, name: '瓦斯' },
        { id: 1304, index: 4, name: '管理費' },
      ],
    },
    {
      id: 14,
      isExpense: true,
      icon: 'HeartPulse',
      color: 'coral',
      index: 9,
      name: '醫療',
      tags: [
        { id: 1401, index: 1, name: '掛號' },
        { id: 1402, index: 2, name: '藥' },
        { id: 1403, index: 3, name: '牙科' },
        { id: 1404, index: 4, name: '健檢' },
      ],
    },
    {
      id: 15,
      isExpense: true,
      icon: 'GraduationCap',
      color: 'mint',
      index: 10,
      name: '學習',
      tags: [
        { id: 1501, index: 1, name: '書' },
        { id: 1502, index: 2, name: '課程' },
        { id: 1503, index: 3, name: '文具' },
        { id: 1504, index: 4, name: '考試' },
      ],
    },
    {
      id: 16,
      isExpense: true,
      icon: 'Plane',
      color: 'blue',
      index: 11,
      name: '旅行',
      tags: [
        { id: 1601, index: 1, name: '車票' },
        { id: 1602, index: 2, name: '住宿' },
        { id: 1603, index: 3, name: '門票' },
        { id: 1604, index: 4, name: '伴手禮' },
      ],
    },
    {
      id: 17,
      isExpense: true,
      icon: 'Smartphone',
      color: 'lime',
      index: 12,
      name: '通訊費',
      tags: [
        { id: 1701, index: 1, name: '手機' },
        { id: 1702, index: 2, name: '網路' },
        { id: 1703, index: 3, name: '影音訂閱' },
        { id: 1704, index: 4, name: '雲端' },
      ],
    },
    {
      id: 18,
      isExpense: true,
      icon: 'Shirt',
      color: 'pink',
      index: 13,
      name: '衣',
      tags: [
        { id: 1801, index: 1, name: '上衣' },
        { id: 1802, index: 2, name: '褲' },
        { id: 1803, index: 3, name: '鞋' },
        { id: 1804, index: 4, name: '配件' },
      ],
    },
    {
      id: 19,
      isExpense: true,
      icon: 'Dumbbell',
      color: 'coral',
      index: 14,
      name: '運動',
      tags: [
        { id: 1901, index: 1, name: '健身房' },
        { id: 1902, index: 2, name: '裝備' },
        { id: 1903, index: 3, name: '場地' },
      ],
    },
    {
      id: 20,
      isExpense: true,
      icon: 'PawPrint',
      color: 'amber',
      index: 15,
      name: '寵物',
      tags: [
        { id: 2001, index: 1, name: '飼料' },
        { id: 2002, index: 2, name: '看診' },
        { id: 2003, index: 3, name: '用品' },
        { id: 2004, index: 4, name: '美容' },
      ],
    },
    {
      id: 21,
      isExpense: true,
      icon: 'LayoutDashboard',
      color: 'grey',
      index: 16,
      name: '其他',
      tags: [
        { id: 2101, index: 1, name: '捐款' },
        { id: 2102, index: 2, name: '手續費' },
        { id: 2103, index: 3, name: '人情' },
        { id: 2104, index: 4, name: '雜貨' },
        { id: 2105, index: 5, name: '維修' },
        { id: 2106, index: 6, name: '郵資' },
        { id: 2107, index: 7, name: '影印' },
        { id: 2108, index: 8, name: '清潔' },
        { id: 2109, index: 9, name: '搬家' },
        { id: 2110, index: 10, name: '保管' },
        { id: 2111, index: 11, name: '租借' },
        { id: 2112, index: 12, name: '罰款' },
        { id: 2113, index: 13, name: '稅費' },
        { id: 2114, index: 14, name: '服務費' },
        { id: 2115, index: 15, name: '會員費' },
        { id: 2116, index: 16, name: '活動費' },
        { id: 2117, index: 17, name: '禮物' },
        { id: 2118, index: 18, name: '二手交易' },
        { id: 2119, index: 19, name: '臨時支出' },
        { id: 2120, index: 20, name: '未分類' },
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

  const normalizeTags = (tags: Tag[]) => tags.map((tag, index) => ({
    ...tag,
    index: index + 1,
  }))

  const addCategory = (categoryData: CategoryData) => {
    const category: Category = {
      ...categoryData,
      id: Math.max(0, ...categoryList.value.map(category => category.id)) + 1,
      index: Math.max(
        0,
        ...categoryList.value
          .filter(category => category.isExpense === categoryData.isExpense)
          .map(category => category.index),
      ) + 1,
      tags: normalizeTags(categoryData.tags),
    }

    categoryList.value.push(category)

    return category
  }

  const updateCategory = (categoryId: number, categoryData: CategoryData) => {
    const category = categoryList.value.find(category => category.id === categoryId)

    if (!category) return false

    if (category.isExpense !== categoryData.isExpense) {
      categoryList.value
        .filter(item => (
          item.isExpense === category.isExpense
          && item.index > category.index
        ))
        .forEach(item => {
          item.index -= 1
        })

      category.index = Math.max(
        0,
        ...categoryList.value
          .filter(item => item.isExpense === categoryData.isExpense)
          .map(item => item.index),
      ) + 1
    }

    category.name = categoryData.name
    category.isExpense = categoryData.isExpense
    category.icon = categoryData.icon
    category.color = categoryData.color
    category.tags = normalizeTags(categoryData.tags)

    return true
  }

  const deleteCategory = (categoryId: number) => {
    const categoryIndex = categoryList.value
      .findIndex(category => category.id === categoryId)

    if (categoryIndex === -1) return false

    const [deletedCategory] = categoryList.value.splice(categoryIndex, 1)

    categoryList.value
      .filter(category => (
        category.isExpense === deletedCategory.isExpense
        && category.index > deletedCategory.index
      ))
      .forEach(category => {
        category.index -= 1
      })

    return true
  }

  return {
    categoryList,
    addCategory,
    updateCategory,
    deleteCategory,
    updateCategoryOrder,
  }
})
