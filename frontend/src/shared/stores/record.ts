import { ref, type Ref } from 'vue'
import { defineStore } from 'pinia'

export interface RecordItem {
  id: number
  categoryId: number
  tagIds: number[]
  note: string
  amount: number
  occurredAt: string
}

type RecordSeed = Pick<RecordItem, 'categoryId' | 'amount' | 'occurredAt'> & {
  tagIds?: number[]
  note?: string
}

const recordSeeds: RecordSeed[] = [
  // 8/1：月初固定支出與三餐
  { occurredAt: '2026-08-01', categoryId: 13, amount: 15000, tagIds: [1301] },
  { occurredAt: '2026-08-01', categoryId: 13, amount: 1800 },
  { occurredAt: '2026-08-01', categoryId: 17, amount: 390, tagIds: [1703], note: 'Netflix' },
  { occurredAt: '2026-08-01', categoryId: 17, amount: 169, note: 'Spotify' },
  { occurredAt: '2026-08-01', categoryId: 17, amount: 90, note: 'iCloud 200GB' },
  { occurredAt: '2026-08-01', categoryId: 17, amount: 599 },
  { occurredAt: '2026-08-01', categoryId: 17, amount: 899 },
  { occurredAt: '2026-08-01', categoryId: 6, amount: 55 },
  { occurredAt: '2026-08-01', categoryId: 7, amount: 125 },
  { occurredAt: '2026-08-01', categoryId: 8, amount: 180 },

  // 8/2
  { occurredAt: '2026-08-02', categoryId: 6, amount: 65 },
  { occurredAt: '2026-08-02', categoryId: 7, amount: 140 },
  { occurredAt: '2026-08-02', categoryId: 8, amount: 220 },
  { occurredAt: '2026-08-02', categoryId: 9, amount: 70 },
  { occurredAt: '2026-08-02', categoryId: 11, amount: 346, tagIds: [1101, 1102] },

  // 8/3
  { occurredAt: '2026-08-03', categoryId: 1, amount: 52000, tagIds: [101], note: '八月薪水' },
  { occurredAt: '2026-08-03', categoryId: 6, amount: 50 },
  { occurredAt: '2026-08-03', categoryId: 7, amount: 115 },
  { occurredAt: '2026-08-03', categoryId: 8, amount: 160 },
  { occurredAt: '2026-08-03', categoryId: 10, amount: 60 },

  // 8/4
  { occurredAt: '2026-08-04', categoryId: 6, amount: 45 },
  { occurredAt: '2026-08-04', categoryId: 7, amount: 120 },
  { occurredAt: '2026-08-04', categoryId: 8, amount: 135 },

  // 8/5
  { occurredAt: '2026-08-05', categoryId: 6, amount: 75 },
  { occurredAt: '2026-08-05', categoryId: 7, amount: 130 },
  { occurredAt: '2026-08-05', categoryId: 8, amount: 190 },
  { occurredAt: '2026-08-05', categoryId: 9, amount: 55 },
  { occurredAt: '2026-08-05', categoryId: 10, amount: 60 },
  { occurredAt: '2026-08-05', categoryId: 20, amount: 980, tagIds: [2001, 2003] },

  // 8/6
  { occurredAt: '2026-08-06', categoryId: 6, amount: 60 },
  { occurredAt: '2026-08-06', categoryId: 7, amount: 115 },
  { occurredAt: '2026-08-06', categoryId: 8, amount: 250 },
  { occurredAt: '2026-08-06', categoryId: 12, amount: 299 },

  // 8/7
  { occurredAt: '2026-08-07', categoryId: 6, amount: 55 },
  { occurredAt: '2026-08-07', categoryId: 7, amount: 135 },
  { occurredAt: '2026-08-07', categoryId: 8, amount: 175 },
  { occurredAt: '2026-08-07', categoryId: 9, amount: 65 },

  // 8/8：睡過頭，沒吃早餐
  { occurredAt: '2026-08-08', categoryId: 7, amount: 180 },
  { occurredAt: '2026-08-08', categoryId: 8, amount: 420 },
  { occurredAt: '2026-08-08', categoryId: 12, amount: 360, tagIds: [1201], note: 'IMAX' },
  { occurredAt: '2026-08-08', categoryId: 10, amount: 265 },

  // 8/9
  { occurredAt: '2026-08-09', categoryId: 6, amount: 80 },
  { occurredAt: '2026-08-09', categoryId: 7, amount: 150 },
  { occurredAt: '2026-08-09', categoryId: 8, amount: 210 },
  { occurredAt: '2026-08-09', categoryId: 19, amount: 1088, tagIds: [1901] },
  { occurredAt: '2026-08-09', categoryId: 11, amount: 259 },

  // 8/10
  { occurredAt: '2026-08-10', categoryId: 6, amount: 50 },
  { occurredAt: '2026-08-10', categoryId: 7, amount: 120 },
  { occurredAt: '2026-08-10', categoryId: 8, amount: 155 },
  { occurredAt: '2026-08-10', categoryId: 10, amount: 60 },

  // 8/11
  { occurredAt: '2026-08-11', categoryId: 6, amount: 65 },
  { occurredAt: '2026-08-11', categoryId: 7, amount: 135 },
  { occurredAt: '2026-08-11', categoryId: 8, amount: 180 },
  { occurredAt: '2026-08-11', categoryId: 14, amount: 200, note: '感冒' },
  { occurredAt: '2026-08-11', categoryId: 14, amount: 160, tagIds: [1402] },

  // 8/12
  { occurredAt: '2026-08-12', categoryId: 6, amount: 55 },
  { occurredAt: '2026-08-12', categoryId: 7, amount: 110 },
  { occurredAt: '2026-08-12', categoryId: 8, amount: 145 },
  { occurredAt: '2026-08-12', categoryId: 15, amount: 680, tagIds: [1501, 1503] },

  // 8/13
  { occurredAt: '2026-08-13', categoryId: 6, amount: 90 },
  { occurredAt: '2026-08-13', categoryId: 7, amount: 155 },
  { occurredAt: '2026-08-13', categoryId: 8, amount: 240 },
  { occurredAt: '2026-08-13', categoryId: 9, amount: 75 },
  { occurredAt: '2026-08-13', categoryId: 11, amount: 1280, note: '補充洗衣精、垃圾袋、廚房紙巾還有幾個收納盒，提著回家才發現超級重' },

  // 8/14
  { occurredAt: '2026-08-14', categoryId: 6, amount: 45 },
  { occurredAt: '2026-08-14', categoryId: 7, amount: 105 },
  { occurredAt: '2026-08-14', categoryId: 8, amount: 130 },

  // 8/15：週末小旅行
  { occurredAt: '2026-08-15', categoryId: 6, amount: 75 },
  { occurredAt: '2026-08-15', categoryId: 7, amount: 200 },
  { occurredAt: '2026-08-15', categoryId: 8, amount: 360 },
  { occurredAt: '2026-08-15', categoryId: 16, amount: 1350 },
  { occurredAt: '2026-08-15', categoryId: 16, amount: 2400, tagIds: [1602], note: '台南兩天一夜' },
  { occurredAt: '2026-08-15', categoryId: 9, amount: 60 },

  // 8/16
  { occurredAt: '2026-08-16', categoryId: 6, amount: 80 },
  { occurredAt: '2026-08-16', categoryId: 7, amount: 160 },
  { occurredAt: '2026-08-16', categoryId: 8, amount: 260 },
  { occurredAt: '2026-08-16', categoryId: 16, amount: 200 },
  { occurredAt: '2026-08-16', categoryId: 16, amount: 580, tagIds: [1604] },

  // 8/17
  { occurredAt: '2026-08-17', categoryId: 6, amount: 50 },
  { occurredAt: '2026-08-17', categoryId: 7, amount: 120 },
  { occurredAt: '2026-08-17', categoryId: 8, amount: 150 },
  { occurredAt: '2026-08-17', categoryId: 5, amount: 690, tagIds: [501], note: '尺寸不合' },
  { occurredAt: '2026-08-17', categoryId: 10, amount: 60 },

  // 8/18
  { occurredAt: '2026-08-18', categoryId: 6, amount: 60 },
  { occurredAt: '2026-08-18', categoryId: 7, amount: 130 },
  { occurredAt: '2026-08-18', categoryId: 8, amount: 175 },

  // 8/19
  { occurredAt: '2026-08-19', categoryId: 6, amount: 55 },
  { occurredAt: '2026-08-19', categoryId: 7, amount: 145 },
  { occurredAt: '2026-08-19', categoryId: 8, amount: 190 },
  { occurredAt: '2026-08-19', categoryId: 4, amount: 2200, tagIds: [402] },
  { occurredAt: '2026-08-19', categoryId: 9, amount: 80 },

  // 8/20
  { occurredAt: '2026-08-20', categoryId: 6, amount: 70 },
  { occurredAt: '2026-08-20', categoryId: 7, amount: 125 },
  { occurredAt: '2026-08-20', categoryId: 8, amount: 210 },
  { occurredAt: '2026-08-20', categoryId: 18, amount: 890, tagIds: [1801, 1804] },

  // 8/21
  { occurredAt: '2026-08-21', categoryId: 6, amount: 50 },
  { occurredAt: '2026-08-21', categoryId: 7, amount: 115 },
  { occurredAt: '2026-08-21', categoryId: 8, amount: 180 },
  { occurredAt: '2026-08-21', categoryId: 3, amount: 128, tagIds: [301] },

  // 8/22
  { occurredAt: '2026-08-22', categoryId: 6, amount: 65 },
  { occurredAt: '2026-08-22', categoryId: 7, amount: 135 },
  { occurredAt: '2026-08-22', categoryId: 8, amount: 220 },
  { occurredAt: '2026-08-22', categoryId: 11, amount: 1680, tagIds: [1101, 1102], note: '網購小邊桌和床頭燈，商品照片看起來很小，實際收到比想像中大很多' },
  { occurredAt: '2026-08-22', categoryId: 13, amount: 245 },

  // 8/23：晚起，沒吃早餐
  { occurredAt: '2026-08-23', categoryId: 7, amount: 260 },
  { occurredAt: '2026-08-23', categoryId: 8, amount: 390 },
  { occurredAt: '2026-08-23', categoryId: 20, amount: 650, tagIds: [2002], note: '年度預防針' },
  { occurredAt: '2026-08-23', categoryId: 9, amount: 95 },

  // 8/24
  { occurredAt: '2026-08-24', categoryId: 6, amount: 55 },
  { occurredAt: '2026-08-24', categoryId: 7, amount: 120 },
  { occurredAt: '2026-08-24', categoryId: 8, amount: 160 },
  { occurredAt: '2026-08-24', categoryId: 13, amount: 1680, tagIds: [1302], note: '七月水電' },
  { occurredAt: '2026-08-24', categoryId: 10, amount: 30 },

  // 8/25
  { occurredAt: '2026-08-25', categoryId: 6, amount: 60 },
  { occurredAt: '2026-08-25', categoryId: 7, amount: 145 },
  { occurredAt: '2026-08-25', categoryId: 8, amount: 190 },
  { occurredAt: '2026-08-25', categoryId: 17, amount: 650, tagIds: [1702, 1704], note: 'Figma 與雲端服務' },

  // 8/26
  { occurredAt: '2026-08-26', categoryId: 6, amount: 45 },
  { occurredAt: '2026-08-26', categoryId: 7, amount: 130 },
  { occurredAt: '2026-08-26', categoryId: 8, amount: 170 },
  { occurredAt: '2026-08-26', categoryId: 14, amount: 200, tagIds: [1403] },

  // 8/27
  { occurredAt: '2026-08-27', categoryId: 6, amount: 85 },
  { occurredAt: '2026-08-27', categoryId: 7, amount: 150 },
  { occurredAt: '2026-08-27', categoryId: 8, amount: 230 },
  { occurredAt: '2026-08-27', categoryId: 15, amount: 1800, tagIds: [1502], note: '線上設計課' },
  { occurredAt: '2026-08-27', categoryId: 9, amount: 75 },

  // 8/28
  { occurredAt: '2026-08-28', categoryId: 6, amount: 55 },
  { occurredAt: '2026-08-28', categoryId: 7, amount: 140 },
  { occurredAt: '2026-08-28', categoryId: 8, amount: 520, note: '和大學同學聚餐，吃完飯又去附近咖啡廳聊天，最後還一起搭計程車回家' },
  { occurredAt: '2026-08-28', categoryId: 2, amount: 3000, tagIds: [201] },
  { occurredAt: '2026-08-28', categoryId: 11, amount: 880, note: '生日禮物' },
  { occurredAt: '2026-08-28', categoryId: 10, amount: 190 },

  // 8/29
  { occurredAt: '2026-08-29', categoryId: 6, amount: 90 },
  { occurredAt: '2026-08-29', categoryId: 7, amount: 165 },
  { occurredAt: '2026-08-29', categoryId: 8, amount: 280 },
  { occurredAt: '2026-08-29', categoryId: 12, amount: 590, tagIds: [1202] },
  { occurredAt: '2026-08-29', categoryId: 9, amount: 120 },

  // 8/30
  { occurredAt: '2026-08-30', categoryId: 6, amount: 70 },
  { occurredAt: '2026-08-30', categoryId: 7, amount: 180 },
  { occurredAt: '2026-08-30', categoryId: 8, amount: 250 },
  { occurredAt: '2026-08-30', categoryId: 19, amount: 450, tagIds: [1902] },
  { occurredAt: '2026-08-30', categoryId: 20, amount: 320, tagIds: [2001, 2003] },

  // 8/31
  { occurredAt: '2026-08-31', categoryId: 6, amount: 55 },
  { occurredAt: '2026-08-31', categoryId: 7, amount: 125 },
  { occurredAt: '2026-08-31', categoryId: 8, amount: 680, note: '月底聚餐人數比預期多，又臨時加點了好幾道菜和甜點，所以最後分攤的金額比原本估計高' },
  { occurredAt: '2026-08-31', categoryId: 21, amount: 500, tagIds: [2101] },
]

export const useRecordStore = defineStore('record', () => {
  const recordList: Ref<RecordItem[]> = ref(recordSeeds.map((record, index) => ({
    id: index + 1,
    categoryId: record.categoryId,
    tagIds: record.tagIds ?? [],
    note: record.note ?? '',
    amount: record.amount,
    occurredAt: record.occurredAt,
  })))

  const getRecordsByMonth = (year: number, month: number) => {
    const monthKey = `${year}-${String(month).padStart(2, '0')}`

    return recordList.value.filter(record => record.occurredAt.startsWith(monthKey))
  }

  return {
    recordList,
    getRecordsByMonth,
  }
})
