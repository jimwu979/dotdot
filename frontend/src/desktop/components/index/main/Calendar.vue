<template>
  <section class="component calendarCard">
    <div class="weekdays">
      <span v-for="weekday in ['日', '一', '二', '三', '四', '五', '六']" :key="weekday">
        {{ weekday }}
      </span>
    </div>
    <div class="calendar">
      <button
        v-for="calendarDay in calendarDays"
        :key="calendarDay.timestamp"
        class="btn-click-effect"
        type="button"
        :class="{
          otherMonth: !calendarDay.isCurrentMonth,
          selected: calendarDay.timestamp === selectedDate,
          today: isToday(calendarDay),
        }"
        @click="emit('update:selectedDate', calendarDay.timestamp)"
      >
        <span>{{ calendarDay.day }}</span>
      </button>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

const props = defineProps<{
  year: number
  month: number
  selectedDate: number
}>()

const emit = defineEmits<{
  'update:selectedDate': [timestamp: number]
}>()

const now = new Date()
const calendarDays = computed(() => {
  const firstDate = new Date(props.year, props.month - 1, 1)
  const startDate = new Date(props.year, props.month - 1, 1 - firstDate.getDay())

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate() + index,
    )

    return {
      timestamp: date.getTime(),
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
      isCurrentMonth: date.getMonth() === props.month - 1,
    }
  })
})
const isToday = (calendarDay: { year: number, month: number, day: number }) => (
  calendarDay.year === now.getFullYear()
  && calendarDay.month === now.getMonth() + 1
  && calendarDay.day === now.getDate()
)
</script>

<style lang="scss" scoped>
  .component.calendarCard{
    width: 100%;
    padding: 12px 0;
    max-width: 600px;
    border-radius: 16px;
    border: 1px solid $oat;
    background-color: $white;
    >.weekdays{
      padding-bottom: 12px;
      border-bottom: 1px solid $oat;
      @include flexbox(row, flex-start, center);
      >span{
        color: $grey;
        text-align: center;
        width: calc(100%/7);
      }
    }
    >.calendar{
      gap: 4px 0;
      display: grid;
      margin-top: 4px;
      grid-template-columns: repeat(7, 1fr);
      >button{
        width: 32px;
        height: 32px;
        margin: 0 auto;
        position: relative;
        border-radius: 50%;
        &.otherMonth >span{
          color: $grey-light;
        }
        &.selected{
          font-weight: 600;
          background-color: $yellow;
        }
        >span{
          width: 100%;
          height: 100%;
          @include flexbox(row, center, center);
        }
        &.today >span:after{
          width: 14px;
          height: 2px;
          content: '';
          position: absolute;
          border-radius: 99px;
          top: calc(50% + 9px);
          left: calc(50% - 7px);
          background-color: $mustard;
        }
      }
    }
  }
</style>
