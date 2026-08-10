<template>
  <main class="page index">
    <p>{{ year }} 年 {{ month }} 月 {{ date }} 日</p>
    <h1>記帳</h1>

    <!-- 資訊卡 -->
    <BalanceCard :total-income="totalIncome" :total-expense="totalExpense" />

    <!-- 記帳紀錄 -->
    <Records :list="list" />

    <!-- 記帳按鈕 -->
    <FixedBtnBox />

    <!-- header -->
    <AppHeader right-action="scroll" />

  </main>
</template>

<script lang="ts" setup>
  import { computed, onMounted } from 'vue'
  import { useRoute } from 'vue-router'
  import AppHeader    from '@/mobile/components/AppHeader.vue'
  import BalanceCard  from '@/mobile/components/index/BalanceCard.vue'
  import FixedBtnBox  from '@/mobile/components/index/FixedBtnBox.vue'
  import Records      from '@/mobile/components/index/Records.vue'
  import { categoryColors } from '@/shared/colors/category'
  import type { CategoryIconName } from '@/shared/icons/category'
  import { useCategoryStore } from '@/shared/stores/category'
  import { useRecordStore } from '@/shared/stores/record'

  interface HomeRecordItem {
    id: number
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

  interface DailyRecords {
    date: string
    month: number
    day: number
    week: string
    total: number
    record: HomeRecordItem[]
  }

  const currentDate = new Date()
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth() + 1
  const date = currentDate.getDate()
  const weekList = ['週日', '週一', '週二', '週三', '週四', '週五', '週六']
  const route = useRoute()
  const categoryStore = useCategoryStore()
  const recordStore = useRecordStore()
  const getRouteNumber = (value: unknown, fallback: number, min: number, max: number) => {
    const rawValue = Array.isArray(value) ? value[0] : value
    const numberValue = Number(rawValue)

    return Number.isInteger(numberValue) && numberValue >= min && numberValue <= max
      ? numberValue
      : fallback
  }
  const selectedYear = computed(() => (
    getRouteNumber(route.params.year, year, 1000, 9999)
  ))
  const selectedMonth = computed(() => (
    getRouteNumber(route.params.month, month, 1, 12)
  ))

  const records = computed<HomeRecordItem[]>(() => {
    return recordStore.getRecordsByMonth(selectedYear.value, selectedMonth.value)
      .reduce<HomeRecordItem[]>((items, record) => {
        const category = categoryStore.categoryList
          .find(category => category.id === record.categoryId)

        if (!category) return items

        const tag = category.tags
          .filter(tag => record.tagIds.includes(tag.id))
          .sort((a, b) => a.index - b.index)
          .map(tag => tag.name)

        items.push({
          id: record.id,
          occurredAt: record.occurredAt,
          icon: category.icon,
          color: categoryColors[category.color],
          category: category.name,
          isExpense: category.isExpense,
          tag,
          note: record.note,
          amount: record.amount,
          isAutomatic: record.isAutomatic,
        })

        return items
      }, [])
  })

  const list = computed<DailyRecords[]>(() => {
    const recordMap = new Map<string, HomeRecordItem[]>()

    records.value.forEach(record => {
      const dailyRecords = recordMap.get(record.occurredAt) ?? []

      dailyRecords.push(record)
      recordMap.set(record.occurredAt, dailyRecords)
    })

    return Array.from(recordMap.entries())
      .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
      .map(([occurredAt, dailyRecords]) => {
        const [recordYear, recordMonth, recordDate] = occurredAt
          .split('-')
          .map(Number)
        const recordDay = new Date(recordYear, recordMonth - 1, recordDate).getDay()
        const total = dailyRecords.reduce((sum, record) => (
          sum + (record.isExpense ? -record.amount : record.amount)
        ), 0)

        return {
          date: occurredAt,
          month: recordMonth,
          day: recordDate,
          week: weekList[recordDay],
          total,
          record: dailyRecords,
        }
      })
  })

  const totalIncome = computed(() => records.value
    .filter(item => !item.isExpense)
    .reduce((total, item) => total + item.amount, 0)
  )
  const totalExpense = computed(() => records.value
    .filter(item => item.isExpense)
    .reduce((total, item) => total + item.amount, 0)
  )

  const isIOSWebKit = () => {
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const isTouchMac = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1

    return isIOSDevice || isTouchMac
  }

  onMounted(() => {
    if (!isIOSWebKit()) return

    // iOS Safari 在 SPA 換頁後可能保留錯誤的 visual viewport 與觸控位置；
    // 實際捲動 1px 再回到頂端，可強制 WebKit 重新計算畫面與 hit-test 區域。
    requestAnimationFrame(() => {
      window.scrollTo(0, 1)

      requestAnimationFrame(() => {
        window.scrollTo(0, 0)
      })
    })
  })
</script>

<style lang="scss" scoped>
.page.index {
  z-index: 1;
  position: relative;
  padding-bottom: 260px;
  &:before{
    top: 0;
    left: 0;
    width: 100%;
    z-index: -1;
    content: '';
    height: 100dvh;
    position: fixed;
    display: inline-block;
    background: radial-gradient(circle at 25% 4%, rgba(249, 219, 97, .2), transparent 28%),  $background;
  }
  > p {
    color: $grey;
    font-size: 13px;
  }
  > h1 {
    @include h1();
    margin-top: 2px;
  }
}
</style>
