<template>
  <section class="component asideDatePicker">
    <header>
      <button class="btn-click-effect" type="button" aria-label="上個月" @click="changeMonth(-1)">
        <ChevronLeft />
      </button>
      <b>{{ visibleYear }} 年 {{ visibleMonth }} 月</b>
      <button class="btn-click-effect" type="button" aria-label="下個月" @click="changeMonth(1)">
        <ChevronRight />
      </button>
    </header>
    <div class="weekdays">
      <span v-for="weekday in ['日', '一', '二', '三', '四', '五', '六']" :key="weekday">
        {{ weekday }}
      </span>
    </div>
    <div class="days">
      <button
        v-for="day in calendarDays"
        :key="day.value"
        class="btn-click-effect"
        type="button"
        :class="{
          otherMonth: !day.isCurrentMonth,
          selected: day.value === modelValue,
          today: day.value === todayValue,
        }"
        @click="selectDate(day.value)"
      >
        {{ day.day }}
      </button>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { ChevronLeft, ChevronRight } from '@lucide/vue'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [date: string]
}>()

const formatDate = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}
const parseDate = (value: string) => {
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(year, month - 1, day)

  return date.getFullYear() === year
    && date.getMonth() === month - 1
    && date.getDate() === day
    ? date
    : new Date()
}
const todayValue = formatDate(new Date())
const visibleDate = ref(parseDate(props.modelValue))
const visibleYear = computed(() => visibleDate.value.getFullYear())
const visibleMonth = computed(() => visibleDate.value.getMonth() + 1)
const calendarDays = computed(() => {
  const firstDate = new Date(visibleYear.value, visibleMonth.value - 1, 1)
  const startDate = new Date(visibleYear.value, visibleMonth.value - 1, 1 - firstDate.getDay())

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate() + index,
    )

    return {
      value: formatDate(date),
      day: date.getDate(),
      isCurrentMonth: date.getMonth() === visibleMonth.value - 1,
    }
  })
})

watch(() => props.modelValue, (value) => {
  const date = parseDate(value)

  visibleDate.value = new Date(date.getFullYear(), date.getMonth(), 1)
})

const changeMonth = (offset: number) => {
  visibleDate.value = new Date(visibleYear.value, visibleMonth.value - 1 + offset, 1)
}
const selectDate = (date: string) => {
  emit('update:modelValue', date)
}
</script>

<style lang="scss" scoped>
  .component.asideDatePicker{
    width: 100%;
    padding: 12px;
    border-radius: 16px;
    border: 1px solid $oat;
    background-color: $white;
    >header{
      padding-bottom: 8px;
      @include flexbox(row, space-between, center);
      >button{
        width: 34px;
        height: 34px;
        border-radius: 50%;
        @include flexbox(row, center, center);
        >svg{
          width: 18px;
        }
      }
      >b{
        font-weight: 600;
      }
    }
    >.weekdays,
    >.days{
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      >*{
        height: 34px;
        text-align: center;
      }
    }
    >.weekdays>span{
      color: $grey;
      font-size: 12px;
      @include flexbox(row, center, center);
    }
    >.days>button{
      width: 34px;
      margin: 0 auto;
      position: relative;
      border-radius: 50%;
      &:after{
        opacity: 0;
        width: 20px;
        height: 3px;
        content: '';
        position: absolute;
        border-radius: 99px;
        top: calc(50% + 9px);
        left: calc(50% - 10px);
        transform: scaleX(.6);
        transition: opacity .2s, transform .2s;
        background-color: $black;
      }
      &.otherMonth{
        color: $grey-light;
      }
      &.selected{
        font-weight: 600;
        background-color: $yellow;
      }
      &.today:after{
        opacity: 1;
        transform: scaleX(1);
      }
    }
  }
</style>
