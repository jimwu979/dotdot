<template>
  <div class="component display-timing" :class="{ desktop }">
    <div class="permanent">
      <b>釘選</b>
      <button
        type="button"
        :class="[{ checked: modelValue.permanent }, { 'btn-click-effect': !desktop }]"
        @click="updatePermanent"
      >
        <span><Check /></span>
        <template v-if="!desktop">釘選後，將常駐於點點記帳列表上</template>
      </button>
      <span v-if="desktop">釘選後，將常駐於點點記帳列表上</span>
    </div>

    <div :class="['schedule', { disabled: modelValue.permanent }]">
      <section class="weekdays">
        <b>每週</b>
        <div>
          <button
            class="btn-click-effect"
            v-for="weekday in weekdays"
            :key="weekday.value"
            type="button"
            :class="{ selected: modelValue.weekdays.includes(weekday.value) }"
            :disabled="modelValue.permanent"
            @click="toggleWeekday(weekday.value)"
          >
            {{ weekday.label }}
            <span><Check /></span>
          </button>
        </div>
      </section>

      <section class="times">
        <div>
          <b>開始</b>
          <button
            class="btn-click-effect"
            type="button"
            :disabled="modelValue.permanent"
            @click="openTimeSelector('start')"
          >
            <span v-text="formatTime(modelValue.startTime).time" />
            <small v-text="formatTime(modelValue.startTime).period" />
          </button>
        </div>
        <div>
          <b>結束</b>
          <button
            class="btn-click-effect"
            type="button"
            :disabled="modelValue.permanent"
            @click="openTimeSelector('end')"
          >
            <span v-text="formatTime(modelValue.endTime).time" />
            <small v-text="formatTime(modelValue.endTime).period" />
          </button>
        </div>
      </section>
    </div>

    <Lightbox
      :open="selectedTime !== null"
      :title="selectedTime === 'start' ? '開始時間' : '結束時間'"
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
              :class="[{ selected: draftHour === hour }, { 'btn-click-effect': !desktop }]"
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
              :class="[{ selected: draftMinute === minute }, { 'btn-click-effect': !desktop }]"
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
              :class="[{ selected: draftPeriodIndex === index }, { 'btn-click-effect': !desktop }]"
              @click="selectPeriod(period.value, index)"
              v-text="period.label"
            />
            <span
              class="period-tail"
            />
          </div>
        </div>
        <div class="btn-box">
          <Btn
            text="取消"
            type="cancel"
            @click="closeTimeSelector"
          />
          <Btn
            text="確定"
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
  import { Check } from '@lucide/vue'
  import Btn from '@/mobile/components/btn.vue'
  import Lightbox from '@/mobile/components/Lightbox.vue'

  interface DisplayTimingValue {
    permanent: boolean
    weekdays: number[]
    startTime: string
    endTime: string
  }

  type TimeTarget = 'start' | 'end'
  type Period = 'AM' | 'PM'
  type WheelName = 'hour' | 'minute' | 'period'

  const props = defineProps<{
    modelValue: DisplayTimingValue
    desktop?: boolean
  }>()

  const emit = defineEmits<{
    'update:modelValue': [value: DisplayTimingValue]
  }>()

  const weekdays = [
    { value: 0, label: '日' },
    { value: 1, label: '一' },
    { value: 2, label: '二' },
    { value: 3, label: '三' },
    { value: 4, label: '四' },
    { value: 5, label: '五' },
    { value: 6, label: '六' },
  ]
  const selectedTime = ref<TimeTarget | null>(null)
  const periodWheel = ref<HTMLDivElement | null>(null)
  const hourWheel = ref<HTMLDivElement | null>(null)
  const minuteWheel = ref<HTMLDivElement | null>(null)
  const draftHour = ref(12)
  const draftMinute = ref(0)
  const draftPeriod = ref<Period>('AM')
  const draftPeriodIndex = ref(0)
  const wheelItemHeight = 56
  const periodOptions: { value: Period; label: string }[] = [
    { value: 'AM', label: 'AM' },
    { value: 'PM', label: 'PM' },
  ]
  const hourOptions = Array.from({ length: 12 }, (_, index) => index + 1)
  const minuteOptions = Array.from({ length: 60 }, (_, index) => index)
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

  const updateValue = (value: Partial<DisplayTimingValue>) => {
    emit('update:modelValue', {
      ...props.modelValue,
      ...value,
    })
  }

  const updatePermanent = () => {
    updateValue({ permanent: !props.modelValue.permanent })
  }

  const toggleWeekday = (weekday: number) => {
    if (props.modelValue.permanent) return

    const selectedWeekdays = props.modelValue.weekdays.includes(weekday)
      ? props.modelValue.weekdays.filter(selectedWeekday => selectedWeekday !== weekday)
      : [...props.modelValue.weekdays, weekday].sort((dayA, dayB) => dayA - dayB)

    updateValue({ weekdays: selectedWeekdays })
  }

  const parseTime = (value: string) => {
    const [hourValue, minuteValue] = value.split(':').map(Number)
    const hour = Number.isInteger(hourValue) ? hourValue : 0
    const minute = Number.isInteger(minuteValue) ? minuteValue : 0

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

  const openTimeSelector = (target: TimeTarget) => {
    if (props.modelValue.permanent) return

    const time = parseTime(
      target === 'start'
        ? props.modelValue.startTime
        : props.modelValue.endTime,
    )

    draftHour.value = time.hour
    draftMinute.value = time.minute
    draftPeriod.value = time.period
    draftPeriodIndex.value = time.period === 'AM' ? 0 : 1
    selectedTime.value = target

    nextTick(() => {
      requestAnimationFrame(() => {
        scrollPeriodWheel(draftPeriodIndex.value)
        scrollWheel(hourWheel.value, time.hour - 1)
        scrollWheel(minuteWheel.value, time.minute)
      })
    })
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

  const getWheelIndex = (event: Event, optionCount: number, offset = 0) => {
    const element = event.currentTarget as HTMLDivElement

    return Math.max(
      0,
      Math.min(
        optionCount - 1,
        Math.round((element.scrollTop - offset) / wheelItemHeight),
      ),
    )
  }

  const updatePeriodFromScroll = (event: Event) => {
    const index = getWheelIndex(event, periodOptions.length)

    draftPeriodIndex.value = index
    draftPeriod.value = periodOptions[index].value
    scheduleWheelSnap('period')
  }

  const updateHourFromScroll = (event: Event) => {
    draftHour.value = hourOptions[getWheelIndex(event, hourOptions.length)]
    scheduleWheelSnap('hour')
  }

  const updateMinuteFromScroll = (event: Event) => {
    draftMinute.value = minuteOptions[getWheelIndex(event, minuteOptions.length)]
    scheduleWheelSnap('minute')
  }

  const selectPeriod = (period: Period, index: number) => {
    draftPeriod.value = period
    draftPeriodIndex.value = index
    scrollPeriodWheel(index, 'smooth')
  }

  const scrollPeriodWheel = (
    index: number,
    behavior: 'auto' | 'smooth' = 'auto',
  ) => {
    periodWheel.value?.scrollTo({
      top: index * wheelItemHeight,
      behavior,
    })
  }

  const getWheelElement = (wheelName: WheelName) => {
    if (wheelName === 'hour') return hourWheel.value
    if (wheelName === 'period') return periodWheel.value

    return minuteWheel.value
  }

  const getWheelTargetTop = (wheelName: WheelName) => {
    if (wheelName === 'hour') {
      return (draftHour.value - 1) * wheelItemHeight
    }
    if (wheelName === 'period') {
      return draftPeriodIndex.value * wheelItemHeight
    }

    return draftMinute.value * wheelItemHeight
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

    element.scrollTo({
      top: targetTop,
      behavior: 'smooth',
    })
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
    element.scrollTo({
      top: element.scrollTop,
      behavior: 'auto',
    })
  }

  const endWheelInteraction = (wheelName: WheelName) => {
    interactingWheels[wheelName] = false
    scheduleWheelSnap(wheelName)
  }

  onBeforeUnmount(() => {
    clearWheelSnapTimer('hour')
    clearWheelSnapTimer('minute')
    clearWheelSnapTimer('period')
  })

  const selectHour = (hour: number, index: number) => {
    draftHour.value = hour
    scrollWheel(hourWheel.value, index, 'smooth')
  }

  const selectMinute = (minute: number, index: number) => {
    draftMinute.value = minute
    scrollWheel(minuteWheel.value, index, 'smooth')
  }

  const closeTimeSelector = () => {
    selectedTime.value = null
  }

  const confirmTime = () => {
    if (selectedTime.value === null) return

    const hour = draftHour.value % 12 + (draftPeriod.value === 'PM' ? 12 : 0)
    const time = `${String(hour).padStart(2, '0')}:${String(draftMinute.value).padStart(2, '0')}`

    updateValue({
      [selectedTime.value === 'start' ? 'startTime' : 'endTime']: time,
    })
    closeTimeSelector()
  }
</script>

<style lang="scss" scoped>
  .component.display-timing{
    gap: 12px;
    @include flexbox(column, flex-start, stretch);
    >.permanent{
      min-height: 50px;
      gap: 12px;
      @include flexbox(row, flex-start, center);
      >b{
        flex: 0 0 auto;
      }
      >button{
        gap: 6px;
        color: $grey;
        text-align: left;
        @include flexbox(row, flex-start, center);
        >span{
          flex: 0 0 auto;
          width: 24px;
          aspect-ratio: 1/1;
          border-radius: 4px;
          border: 1px solid $grey;
          background-color: $white;
          @include flexbox(row, center, center);
          >svg{
            width: 18px;
            opacity: 0;
            stroke: $black;
            transition: opacity .2s;
          }
        }
        &.checked{
          >span{
            background-color: $yellow;
            border-color: $yellow-dark;
            >svg{
              opacity: 1;
            }
          }
        }
      }
      >span{
        color: $grey;
      }
    }
    >.schedule{
      gap: 12px;
      transition: opacity .2s;
      @include flexbox(column, flex-start, stretch);
      &.disabled{
        opacity: .35;
        pointer-events: none;
      }
      >.weekdays{
        min-height: 50px;
        gap: 12px;
        @include flexbox(row, flex-start, center);
        >b{
          flex: 0 0 auto;
        }
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
              width: 18px;
              opacity: 0;
              right: -4px;
              bottom: -4px;
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
      >.times{
        min-height: 50px;
        @include flexbox(row, space-between, center);
        >div{
          gap: 10px;
          @include flexbox(row, flex-start, center);
          >button{
            height: 50px;
            min-width: 120px;
            border-radius: 12px;
            border: 1px solid $oat;
            background-color: $white;
            @include flexbox(row, flex-start, center);
            >span{
              flex: 1;
              padding: 0 10px;
              text-align: center;
            }
            >small{
              height: 28px;
              padding: 0 8px;
              border-left: 1px solid $stone;
              @include flexbox(row, center, center);
            }
          }
        }
      }
    }
    &.desktop{
      >.permanent{
        >button{
          width: 24px;
          height: 24px;
          flex: 0 0 24px;
          padding: 0;
          cursor: pointer;
          overflow: visible;
          position: static;
          isolation: auto;
          >span{
            width: 24px;
          }
        }
      }
      >.schedule{
        >.weekdays >div >button{
          overflow: visible;
        }
        >.times{
          gap: 24px;
          justify-content: flex-start;
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
          scroll-snap-type: none;
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
