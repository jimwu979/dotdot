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
    <AppHeader />

  </main>
</template>

<script lang="ts" setup>
  import { computed } from 'vue'
  import AppHeader    from '@/mobile/components/AppHeader.vue'
  import BalanceCard  from '@/mobile/components/index/BalanceCard.vue'
  import FixedBtnBox  from '@/mobile/components/index/FixedBtnBox.vue'
  import Records      from '@/mobile/components/index/Records.vue'

  const currentDate = new Date()
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth() + 1
  const date = currentDate.getDate()

  const list = [
    {
      day: 24,
      week: '週三',
      record: [
        {
          icon: '',
          color: '#fff3bd',
          category: '正餐',
          isExpense: true,
          tag: [],
          note: '',
          amount: 0,
        },
      ]
    },
    {
      day: 23,
      week: '週四',
      record: [
        {
          icon: '',
          color: '#e9f4ef',
          category: '其他',
          isExpense: true,
          tag: [],
          note: '拖把',
          amount: 0,
        },
        {
          icon: '',
          color: '#e9f4ef',
          category: '酒',
          isExpense: true,
          tag: ['酒精飲料'],
          note: '',
          amount: 52,
        },
        {
          icon: '',
          color: '#e9f4ef',
          category: '豆漿',
          isExpense: true,
          tag: ['健康', '健身'],
          note: '一整罐',
          amount: 50,
        },
        {
          icon: '',
          color: '#e9f4ef',
          category: '正餐',
          isExpense: true,
          tag: [],
          note: '',
          amount: 0,
        },
      ]
    },
    {
      day: 22,
      week: '週五',
      record: [
        {
          icon: '',
          color: '#f3edff',
          category: '正餐',
          isExpense: true,
          tag: [],
          note: '',
          amount: 99,
        },
      ]
    },
    {
      day: 1,
      week: '週三',
      record: [
        {
          icon: '',
          color: '#f3eEEf',
          category: '生活費',
          isExpense: false,
          tag: [],
          note: '',
          amount: 20000,
        },
        {
          icon: '',
          color: '#f3eEEf',
          category: '其他',
          isExpense: true,
          tag: ['訂閱'],
          note: 'Netflix, AWS, Spotify',
          amount: 598,
        },
      ]
    },
  ]

  const records = computed(() => list.flatMap(item => item.record))
  const totalIncome = computed(() => records.value
    .filter(item => !item.isExpense)
    .reduce((total, item) => total + item.amount, 0)
  )
  const totalExpense = computed(() => records.value
    .filter(item => item.isExpense)
    .reduce((total, item) => total + item.amount, 0)
  )
</script>

<style lang="scss" scoped>
.page.index {
  padding: 28px 12px 260px;
  background: radial-gradient(circle at 25% 4%, rgba(249, 219, 97, .2), transparent 28%),  $background;
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
