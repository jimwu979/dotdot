<template>
  <div
    :class="['component dateSelector', { open }]"
    @click="cancelSelection"
  >
    <div class="content" @click.stop>

      <!-- head -->
      <section class="head">
        <p>{{ todayYear }}年</p>
        <b v-text="todayText" />
      </section>

      <!-- month -->
      <section class="month">
        <button class="btn-click-effect" type="button" @click="changeMonth(-1)">
          <ChevronLeft />
        </button>
        <p v-text="displayMonth" />
        <button class="btn-click-effect" type="button" @click="changeMonth(1)">
          <ChevronRight />
        </button>
      </section>

      <!-- 月曆 -->
      <section class="calendar">
        <ul class="week">
          <li v-for="(i, index) in ['日', '一', '二', '三', '四', '五', '六']" :key="index" v-text="i" />
        </ul>
        <ul class="day">
          <li
            v-for="day in calendarDays"
            :key="day.value"
            :class="{
              'prev-month': day.monthOffset === -1,
              'next-month': day.monthOffset === 1,
              'select': day.value === draftDate,
              'today': day.value === todayValue,
            }"
            @click="selectDate(day.value)"
            v-text="day.date"
          />
        </ul>
      </section>

      <!-- 按鈕 -->
      <section class="btn-box">
        <Btn text="取消" type="cancel" @click="cancelSelection" />
        <Btn text="確定" type="confirm" @click="confirmSelection" />
      </section>

    </div>
  </div>
</template>

<script lang="ts" setup>
  import { computed, ref, watch } from 'vue'
  import Btn from '@/mobile/components/btn.vue'
  import { ChevronLeft, ChevronRight } from '@lucide/vue'

  const props = defineProps<{
    open: boolean
    selectedDate: string
  }>()

  const emit = defineEmits<{
    cancel: []
    confirm: [selectedDate: string]
  }>()

  const today = new Date()
  const visibleMonth = ref(new Date(today.getFullYear(), today.getMonth(), 1))
  const draftDate = ref('')
  const todayYear = today.getFullYear()
  const todayText = new Intl.DateTimeFormat('zh-TW', {
    month: 'numeric',
    day: 'numeric',
    weekday: 'short',
  }).format(today)

  const formatDate = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
  }

  const parseDate = (value: string) => {
    const [year, month, date] = value.split('-').map(Number)
    const parsedDate = new Date(year, month - 1, date)
    const isValid = parsedDate.getFullYear() === year
      && parsedDate.getMonth() === month - 1
      && parsedDate.getDate() === date

    return isValid ? parsedDate : new Date(today)
  }

  const todayValue = formatDate(today)
  const displayMonth = computed(() => (
    `${visibleMonth.value.getFullYear()}年${visibleMonth.value.getMonth() + 1}月`
  ))
  const calendarDays = computed(() => {
    const year = visibleMonth.value.getFullYear()
    const month = visibleMonth.value.getMonth()
    const firstDay = new Date(year, month, 1)
    const calendarStart = new Date(year, month, 1 - firstDay.getDay())

    return Array.from({ length: 42 }, (_, index) => {
      const currentDate = new Date(
        calendarStart.getFullYear(),
        calendarStart.getMonth(),
        calendarStart.getDate() + index,
      )
      const currentMonth = currentDate.getMonth()
      const monthOffset = currentDate.getFullYear() < year || (
        currentDate.getFullYear() === year && currentMonth < month
      )
        ? -1
        : currentDate.getFullYear() > year || currentMonth > month
          ? 1
          : 0

      return {
        date: currentDate.getDate(),
        monthOffset,
        value: formatDate(currentDate),
      }
    })
  })

  watch(() => props.open, (isOpen) => {
    if (!isOpen) return

    const selectedDate = parseDate(props.selectedDate)

    draftDate.value = formatDate(selectedDate)
    visibleMonth.value = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      1,
    )
  })

  const changeMonth = (offset: number) => {
    visibleMonth.value = new Date(
      visibleMonth.value.getFullYear(),
      visibleMonth.value.getMonth() + offset,
      1,
    )
  }

  const selectDate = (date: string) => {
    draftDate.value = date
  }

  const cancelSelection = () => {
    emit('cancel')
  }

  const confirmSelection = () => {
    emit('confirm', draftDate.value)
  }
</script>

<style scoped lang="scss">
  .component.dateSelector{
    top: 0;
    left: 0;
    z-index: 2;
    opacity: 0;
    width: 100%;
    position: fixed;
    pointer-events: none;
    transition: opacity .2s;
    height: calc(100% - $header_height);
    @include flexbox(row, center, center);
    background-color: rgba($color: #000, $alpha: .6);
    &.open{
      opacity: 1;
      pointer-events: auto;
      >.content{
        transform: scale(1);
      }
    }
    >.content{
      width: 300px;
      overflow: hidden;
      border-radius: 12px;
      transform: scale(.9);
      transition: transform .2s;
      background-color: $background;
      @include flexbox(column, flex-start, stretch);
      >section{
        padding: 12px;
        &.head{
          gap: 6px;
          background-color: $yellow-dark;
          @include flexbox(column, flex-start, flex-start);
          >p{
            color: $white;
            @include h3();
          }
          >b{
            color: $white;
            @include h1();
            font-weight: 600;
          }
        }
        &.month{
          @include flexbox(row, space-between, center);
          >button{
            width: 40px;
            height: 40px;
            @include flexbox(row, center, center);
            >svg{
              width: 20px;
              height: 20px;
            }
          }
          >p{
            font-weight: 600;
          }
        }
        &.calendar{
          padding: 0 12px;
          @include flexbox(column, flex-start, stretch);
          >ul{
            flex-wrap: wrap;
            @include flexbox(row, flex-start, flex-start);
            >li{
              aspect-ratio: 1/1;
              width: calc(100%/7);
              @include flexbox(row, center, center);
            }
            &.week{
              >li{
                color: $grey;
              }
            }
            &.day{
              >li{
                z-index: 1;
                cursor: pointer;
                position: relative;
                &:before, &:after{
                  content: '';
                  opacity: 0;
                  transition: .2s;
                  position: absolute;
                  display: inline-block;
                }
                &:before{
                  width: 100%;
                  height: 100%;
                  z-index: -1;
                  border-radius: 50%;
                  transform: scale(.6);
                  background-color: $yellow;
                }
                &:after{
                  width: 20px;
                  height: 3px;
                  border-radius: 99px;
                  top: calc(50% + 9px);
                  transform: scaleX(.6);
                  background-color: $black;
                }
                &.prev-month,
                &.next-month{
                  color: $grey-light;
                }
                &.select{
                  &:before{
                    opacity: 1;
                    transform: scale(1);
                  }
                }
                &.today{
                  font-weight: 600;
                  &:after{
                    opacity: 1;
                    transform: scaleX(1);
                  }
                }
              }
            }
          }
        }
        &.btn-box{
          gap: 12px;
          @include flexbox(row, flex-end, center);
        }
      }
    }
  }
</style>
