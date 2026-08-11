<template>
  <div class="component statisticsPeriodSelector">
    <button type="button" :aria-label="previousLabel" @click="changePeriod(-1)" />
    <strong>{{ title }}</strong>
    <button type="button" :aria-label="nextLabel" @click="changePeriod(1)" />
  </div>
</template>

<script lang="ts" setup>
  import { computed } from 'vue'
  import { useRoute, useRouter } from 'vue-router'

  const props = defineProps<{
    mode: 'year' | 'month'
  }>()

  const route = useRoute()
  const router = useRouter()
  const now = new Date()

  const getRouteNumber = (value: unknown, fallback: number) => {
    const rawValue = Array.isArray(value) ? value[0] : value
    const numberValue = Number(rawValue)

    return Number.isInteger(numberValue) ? numberValue : fallback
  }

  const selectedYear = computed(() => props.mode === 'year'
    ? getRouteNumber(route.query.year, now.getFullYear())
    : getRouteNumber(route.params.year, now.getFullYear()),
  )
  const selectedMonth = computed(() =>
    getRouteNumber(route.params.month, now.getMonth() + 1),
  )
  const title = computed(() => props.mode === 'year'
    ? `${selectedYear.value}年`
    : `${selectedMonth.value}月`,
  )
  const previousLabel = computed(() => props.mode === 'year' ? '上一年' : '上個月')
  const nextLabel = computed(() => props.mode === 'year' ? '下一年' : '下個月')

  const changePeriod = (offset: number) => {
    if (props.mode === 'year') {
      void router.push({
        name: 'statistics',
        query: { year: selectedYear.value + offset },
      })
      return
    }

    const date = new Date(selectedYear.value, selectedMonth.value - 1 + offset, 1)
    const params = {
      year: String(date.getFullYear()),
      month: String(date.getMonth() + 1).padStart(2, '0'),
    }

    if (route.name === 'statistics-category') {
      void router.push({
        name: 'statistics-category',
        params: {
          ...params,
          kind: route.params.kind,
          categoryId: route.params.categoryId,
        },
      })
      return
    }

    void router.push({ name: 'statistics-month', params })
  }
</script>

<style lang="scss" scoped>
.component.statisticsPeriodSelector {
  height: 100%;
  @include flexbox(row, center, center);
  > strong {
    min-width: 70px;
    text-align: center;
    @include h2();
  }
  > button {
    width: 42px;
    height: 100%;
    position: relative;
    &::before {
      top: 50%;
      left: 50%;
      width: 9px;
      height: 9px;
      content: '';
      position: absolute;
      border-left: 2px solid $black;
      border-bottom: 2px solid $black;
    }
    &:first-of-type::before {
      transform: translate(-30%, -50%) rotate(45deg);
    }
    &:last-of-type::before {
      transform: translate(-70%, -50%) rotate(225deg);
    }
  }
}
</style>
