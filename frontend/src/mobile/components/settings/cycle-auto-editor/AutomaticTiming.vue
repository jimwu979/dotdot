<template>
  <div :class="['component automatic-timing', { disabled }]">
    <section class="frequency">
      <b>頻率</b>
      <div>
        <button
          v-for="option in frequencyOptions"
          :key="option.value"
          type="button"
          :class="{ selected: modelValue.frequency === option.value }"
          @click="updateValue({ frequency: option.value })"
        >
          <span />
          {{ option.label }}
        </button>
      </div>
    </section>

    <section
      v-if="modelValue.frequency === 'weekly'"
      class="weekdays"
    >
      <div>
        <button
          v-for="weekday in weekdays"
          :key="weekday.value"
          type="button"
          :class="{ selected: modelValue.weekdays.includes(weekday.value) }"
          @click="toggleWeekday(weekday.value)"
        >
          {{ weekday.label }}
          <span><Check /></span>
        </button>
      </div>
    </section>

    <section
      v-if="modelValue.frequency === 'monthly'"
      class="month-day"
    >
      <select
        :value="modelValue.monthDay ?? 1"
        @change="updateMonthDay"
      >
        <option
          v-for="day in monthDayOptions"
          :key="day"
          :value="day"
          v-text="day"
        />
      </select>
      <span>號</span>
    </section>

    <section class="time">
      <b>時間</b>
      <button
        type="button"
        @click="openTimeSelector"
      >
        <span v-text="formatTime(modelValue.time).time" />
        <small v-text="formatTime(modelValue.time).period" />
        <ChevronDown />
      </button>
    </section>

    <Lightbox
      :open="isTimeSelectorOpen"
      title="記帳時間"
      @close="closeTimeSelector"
    >
      <div class="time-selector">
        <div class="time-picker">
          <div class="selected-row" />
          <div
            ref="hourWheel"
            class="wheel"
            @scroll="updateHourFromScroll"
            @pointerdown="startWheelInteraction('hour', $event)"
            @pointerup="endWheelInteraction('hour')"
            @pointercancel="endWheelInteraction('hour')"
          >
            <button
              v-for="(hour, index) in hourOptions"
              :key="hour"
              type="button"
              :class="{ selected: draftHour === hour }"
              @click="selectHour(hour, index)"
              v-text="String(hour).padStart(2, '0')"
            />
          </div>
          <div
            ref="minuteWheel"
            class="wheel"
            @scroll="updateMinuteFromScroll"
            @pointerdown="startWheelInteraction('minute', $event)"
            @pointerup="endWheelInteraction('minute')"
            @pointercancel="endWheelInteraction('minute')"
          >
            <button
              v-for="(minute, index) in minuteOptions"
              :key="minute"
              type="button"
              :class="{ selected: draftMinute === minute }"
              @click="selectMinute(minute, index)"
              v-text="String(minute).padStart(2, '0')"
            />
          </div>
          <div
            ref="periodWheel"
            class="wheel period"
            @scroll="updatePeriodFromScroll"
            @pointerdown="startWheelInteraction('period', $event)"
            @pointerup="endWheelInteraction('period')"
            @pointercancel="endWheelInteraction('period')"
          >
            <button
              v-for="(period, index) in periodOptions"
              :key="period.value"
              type="button"
              :class="{ selected: draftPeriodIndex === index }"
              @click="selectPeriod(period.value, index)"
              v-text="period.label"
            />
            <span class="period-tail" aria-hidden="true" />
          </div>
        </div>
        <div class="btn-box">
          <Btn
            text="取消"
            type="cancel"
            @click="closeTimeSelector"
          />
          <Btn
            text="確認"
            type="confirm"
            @click="confirmTime"
          />
        </div>
      </div>
    </Lightbox>
  </div>
</template>

<script lang="ts" setup>
  import { nextTick, onBeforeUnmount, ref } from 'vue'
  import { Check, ChevronDown } from '@lucide/vue'
  import Btn from '@/mobile/components/btn.vue'
  import Lightbox from '@/mobile/components/Lightbox.vue'
  import type { AutomaticFrequency } from '@/shared/stores/automatic'

  interface AutomaticTimingValue {
    frequency: AutomaticFrequency
    weekdays: number[]
    monthDay: number | null
    time: string
  }

  type Period = 'AM' | 'PM'
  type WheelName = 'hour' | 'minute' | 'period'

  const props = withDefaults(defineProps<{
    modelValue: AutomaticTimingValue
    disabled?: boolean
  }>(), {
    disabled: false,
  })

  const emit = defineEmits<{
    'update:modelValue': [value: AutomaticTimingValue]
  }>()

  const frequencyOptions: { value: AutomaticFrequency, label: string }[] = [
    { value: 'daily', label: '每天' },
    { value: 'weekly', label: '每週' },
    { value: 'monthly', label: '每月' },
  ]
  const weekdays = [
    { value: 0, label: '日' },
    { value: 1, label: '一' },
    { value: 2, label: '二' },
    { value: 3, label: '三' },
    { value: 4, label: '四' },
    { value: 5, label: '五' },
    { value: 6, label: '六' },
  ]
  const monthDayOptions = Array.from({ length: 31 }, (_, index) => index + 1)
  const hourOptions = Array.from({ length: 12 }, (_, index) => index + 1)
  const minuteOptions = [0, 15, 30]
  const periodOptions: { value: Period, label: string }[] = [
    { value: 'AM', label: 'AM' },
    { value: 'PM', label: 'PM' },
  ]
  const wheelItemHeight = 56
  const isTimeSelectorOpen = ref(false)
  const periodWheel = ref<HTMLDivElement | null>(null)
  const hourWheel = ref<HTMLDivElement | null>(null)
  const minuteWheel = ref<HTMLDivElement | null>(null)
  const draftHour = ref(8)
  const draftMinute = ref(30)
  const draftPeriod = ref<Period>('AM')
  const draftPeriodIndex = ref(0)
  const wheelSnapTimers: Record<WheelName, number | undefined> = {
    hour: undefined,
    minute: undefined,
    period: undefined,
  }
  const interactingWheels: Record<WheelName, boolean> = {
    hour: false,
    minute: false,
    period: false,
  }

  const updateValue = (value: Partial<AutomaticTimingValue>) => {
    emit('update:modelValue', {
      ...props.modelValue,
      ...value,
    })
  }

  const toggleWeekday = (weekday: number) => {
    const selectedWeekdays = props.modelValue.weekdays.includes(weekday)
      ? props.modelValue.weekdays.filter(selectedWeekday => selectedWeekday !== weekday)
      : [...props.modelValue.weekdays, weekday].sort((dayA, dayB) => dayA - dayB)

    updateValue({ weekdays: selectedWeekdays })
  }

  const updateMonthDay = (event: Event) => {
    updateValue({ monthDay: Number((event.target as HTMLSelectElement).value) })
  }

  const parseTime = (value: string) => {
    const [hourValue, minuteValue] = value.split(':').map(Number)
    const hour = Number.isInteger(hourValue) ? hourValue : 0
    const minute = minuteOptions.includes(minuteValue) ? minuteValue : 0

    return {
      hour: hour % 12 || 12,
      minute,
      period: hour >= 12 ? 'PM' as const : 'AM' as const,
    }
  }

  const formatTime = (value: string) => {
    const time = parseTime(value)

    return {
      time: `${String(time.hour).padStart(2, '0')}:${String(time.minute).padStart(2, '0')}`,
      period: time.period,
    }
  }

  const scrollWheel = (
    element: HTMLDivElement | null,
    index: number,
    behavior: 'auto' | 'smooth' = 'auto',
  ) => {
    element?.scrollTo({
      top: index * wheelItemHeight,
      behavior,
    })
  }

  const openTimeSelector = () => {
    const time = parseTime(props.modelValue.time)

    draftHour.value = time.hour
    draftMinute.value = time.minute
    draftPeriod.value = time.period
    draftPeriodIndex.value = time.period === 'AM' ? 0 : 1
    isTimeSelectorOpen.value = true

    nextTick(() => {
      requestAnimationFrame(() => {
        scrollWheel(hourWheel.value, time.hour - 1)
        scrollWheel(minuteWheel.value, minuteOptions.indexOf(time.minute))
        scrollWheel(periodWheel.value, draftPeriodIndex.value)
      })
    })
  }

  const getWheelIndex = (event: Event, optionCount: number) => {
    const element = event.currentTarget as HTMLDivElement

    return Math.max(
      0,
      Math.min(optionCount - 1, Math.round(element.scrollTop / wheelItemHeight)),
    )
  }

  const updateHourFromScroll = (event: Event) => {
    draftHour.value = hourOptions[getWheelIndex(event, hourOptions.length)]
    scheduleWheelSnap('hour')
  }

  const updateMinuteFromScroll = (event: Event) => {
    draftMinute.value = minuteOptions[getWheelIndex(event, minuteOptions.length)]
    scheduleWheelSnap('minute')
  }

  const updatePeriodFromScroll = (event: Event) => {
    const index = getWheelIndex(event, periodOptions.length)

    draftPeriodIndex.value = index
    draftPeriod.value = periodOptions[index].value
    scheduleWheelSnap('period')
  }

  const getWheelElement = (wheelName: WheelName) => {
    if (wheelName === 'hour') return hourWheel.value
    if (wheelName === 'minute') return minuteWheel.value

    return periodWheel.value
  }

  const getWheelTargetTop = (wheelName: WheelName) => {
    if (wheelName === 'hour') return (draftHour.value - 1) * wheelItemHeight
    if (wheelName === 'minute') {
      return minuteOptions.indexOf(draftMinute.value) * wheelItemHeight
    }

    return draftPeriodIndex.value * wheelItemHeight
  }

  const clearWheelSnapTimer = (wheelName: WheelName) => {
    window.clearTimeout(wheelSnapTimers[wheelName])
    wheelSnapTimers[wheelName] = undefined
  }

  const snapWheel = (wheelName: WheelName) => {
    const element = getWheelElement(wheelName)

    if (!element || interactingWheels[wheelName]) return

    const targetTop = getWheelTargetTop(wheelName)

    if (Math.abs(element.scrollTop - targetTop) < 1) return

    element.scrollTo({ top: targetTop, behavior: 'smooth' })
  }

  const scheduleWheelSnap = (wheelName: WheelName) => {
    clearWheelSnapTimer(wheelName)

    if (interactingWheels[wheelName]) return

    wheelSnapTimers[wheelName] = window.setTimeout(() => {
      snapWheel(wheelName)
    }, 120)
  }

  const startWheelInteraction = (wheelName: WheelName, event: PointerEvent) => {
    const element = event.currentTarget as HTMLDivElement

    interactingWheels[wheelName] = true
    clearWheelSnapTimer(wheelName)
    element.scrollTo({ top: element.scrollTop, behavior: 'auto' })
  }

  const endWheelInteraction = (wheelName: WheelName) => {
    interactingWheels[wheelName] = false
    scheduleWheelSnap(wheelName)
  }

  const selectHour = (hour: number, index: number) => {
    draftHour.value = hour
    scrollWheel(hourWheel.value, index, 'smooth')
  }

  const selectMinute = (minute: number, index: number) => {
    draftMinute.value = minute
    scrollWheel(minuteWheel.value, index, 'smooth')
  }

  const selectPeriod = (period: Period, index: number) => {
    draftPeriod.value = period
    draftPeriodIndex.value = index
    scrollWheel(periodWheel.value, index, 'smooth')
  }

  const closeTimeSelector = () => {
    isTimeSelectorOpen.value = false
  }

  const confirmTime = () => {
    const hour = draftHour.value % 12 + (draftPeriod.value === 'PM' ? 12 : 0)

    updateValue({
      time: `${String(hour).padStart(2, '0')}:${String(draftMinute.value).padStart(2, '0')}`,
    })
    closeTimeSelector()
  }

  onBeforeUnmount(() => {
    clearWheelSnapTimer('hour')
    clearWheelSnapTimer('minute')
    clearWheelSnapTimer('period')
  })
</script>

<style lang="scss" scoped>
  .component.automatic-timing{
    gap: 12px;
    transition: opacity .2s;
    @include flexbox(column, flex-start, stretch);
    &.disabled{
      opacity: .35;
      pointer-events: none;
    }
    >section{
      min-height: 42px;
      gap: 12px;
      @include flexbox(row, flex-start, center);
      >b{
        width: 42px;
        flex: 0 0 auto;
      }
      &.frequency{
        >div{
          gap: 20px;
          @include flexbox(row, flex-start, center);
          >button{
            gap: 6px;
            white-space: nowrap;
            @include flexbox(row, flex-start, center);
            >span{
              width: 20px;
              flex: 0 0 auto;
              aspect-ratio: 1/1;
              border-radius: 50%;
              border: 1px solid $black;
              background-color: $white;
              &:after{
                width: 12px;
                opacity: 0;
                content: '';
                aspect-ratio: 1/1;
                border-radius: 50%;
                display: block;
                transition: opacity .2s;
                background-color: $black;
              }
              @include flexbox(row, center, center);
            }
            &.selected >span:after{
              opacity: 1;
            }
          }
        }
      }
      &.weekdays{
        padding-left: 54px;
        >div{
          flex: 1;
          gap: 8px;
          @include flexbox(row, space-between, center);
          >button{
            width: calc((100% - 48px)/7);
            max-width: 36px;
            position: relative;
            aspect-ratio: 1/1;
            border-radius: 50%;
            background-color: $oat;
            @include flexbox(row, center, center);
            >span{
              right: -4px;
              bottom: -4px;
              width: 18px;
              opacity: 0;
              position: absolute;
              aspect-ratio: 1/1;
              border-radius: 50%;
              transition: opacity .2s;
              background-color: $yellow;
              @include flexbox(row, center, center);
              >svg{
                height: 13px;
                stroke: $black;
              }
            }
            &.selected{
              background-color: $grey-light;
              >span{
                opacity: 1;
              }
            }
          }
        }
      }
      &.month-day{
        padding-left: 54px;
        >select{
          width: 64px;
          height: 42px;
          padding: 0 10px;
          border-radius: 8px;
          border: 1px solid $stone;
          background-color: $white;
        }
      }
      &.time{
        >button{
          height: 42px;
          overflow: hidden;
          border-radius: 8px;
          border: 1px solid $stone;
          background-color: $white;
          @include flexbox(row, flex-start, center);
          >span{
            padding-left: 10px;
          }
          >small{
            padding-left: 4px;
          }
          >svg{
            width: 16px;
            margin: 0 8px 0 4px;
          }
        }
      }
    }
    :deep(.lightbox > section){
      max-width: 360px;
    }
    .time-selector{
      gap: 28px;
      padding: 32px 20px 20px;
      @include flexbox(column, flex-start, stretch);
      >.time-picker{
        height: 240px;
        overflow: hidden;
        position: relative;
        @include flexbox(row, center, stretch);
        &:before,
        &:after{
          left: 0;
          z-index: 2;
          width: 100%;
          height: 72px;
          content: '';
          position: absolute;
          pointer-events: none;
        }
        &:before{
          top: 0;
          background: linear-gradient($background, rgba($background, 0));
        }
        &:after{
          bottom: 0;
          background: linear-gradient(rgba($background, 0), $background);
        }
        >.selected-row{
          left: 0;
          top: 92px;
          width: 100%;
          height: 56px;
          position: absolute;
          border-radius: 18px;
          pointer-events: none;
          background-color: $oat;
        }
        >.wheel{
          z-index: 1;
          width: calc(100%/3);
          height: 100%;
          overflow-y: auto;
          padding: 92px 0;
          cursor: grab;
          user-select: none;
          touch-action: pan-y;
          -webkit-user-select: none;
          scrollbar-width: none;
          overscroll-behavior: contain;
          -webkit-overflow-scrolling: touch;
          @include flexbox(column, flex-start, stretch);
          &::-webkit-scrollbar{
            display: none;
          }
          &.period{
            padding-bottom: 0;
            >.period-tail{
              flex: 0 0 92px;
              pointer-events: none;
            }
          }
          >button{
            width: 100%;
            height: 56px;
            opacity: .25;
            flex: 0 0 auto;
            transition: opacity .15s;
            @include h1();
            @include flexbox(row, center, center);
            &.selected{
              opacity: 1;
            }
          }
        }
      }
      >.btn-box{
        gap: 12px;
        @include flexbox(row, flex-end, center);
      }
    }
  }
</style>
