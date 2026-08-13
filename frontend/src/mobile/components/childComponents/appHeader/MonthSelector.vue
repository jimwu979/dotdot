<template>
  <div class="component monthSelector">

    <div class="title">
      <button class="btn-click-effect" type="button" @click="changeMonth(-1)" />
      <button
        class="btn-click-effect"
        type="button"
        v-text="`${selectedMonth}月`"
        @click="toggleSelector"
      />
      <button class="btn-click-effect" type="button" @click="changeMonth(1)" />
    </div>

    <div class="selector" :class="{'isOpen': isOpen}" @click.self="isOpen = false">

      <!-- options -->
      <div class="options" @click="markCurrentClick">
        <button type="button" class="now btn-click-effect" @click="goToNow">NOW</button>
        <div class="year">
          <button type="button" class="prev btn-click-effect" @click="browseYear--">
            <ChevronLeft />
          </button>
          <h6 v-text="browseYear" />
          <button type="button" class="next btn-click-effect" @click="browseYear++">
            <ChevronRight />
          </button>
        </div>
        <CloseBtn @click="isOpen = false" />
      </div>

      <!-- list -->
      <div class="list">
        <router-link 
          v-for="month in 12"
          :key="month"
          :class="{
            now: isSelectedMonth(browseYear, month),
            current: isCurrentMonth(browseYear, month),
          }"
          :to="monthRoute(browseYear, month)"
          @click="isOpen = false"
        >
          {{ month }}月
        </router-link>
      </div>

    </div>

  </div>
</template>

<script lang="ts" setup>
  import { computed, ref, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { ChevronLeft, ChevronRight } from '@lucide/vue'
  import CloseBtn from '@/mobile/components/closeBtn.vue'
  import { useCloseOnBodyClick } from '@/shared/composables/useCloseOnBodyClick'

  const route = useRoute()
  const router = useRouter()
  const now = new Date()

  const isOpen = ref(false)
  const getRouteNumber = (value: unknown, fallback: number, min: number, max: number) => {
    const rawValue = Array.isArray(value) ? value[0] : value
    const numberValue = Number(rawValue)

    return Number.isInteger(numberValue) && numberValue >= min && numberValue <= max
      ? numberValue
      : fallback
  }

  const selectedYear = computed(() =>
    getRouteNumber(route.params.year, now.getFullYear(), 1000, 9999),
  )
  const selectedMonth = computed(() =>
    getRouteNumber(route.params.month, now.getMonth() + 1, 1, 12),
  )
  const browseYear = ref(selectedYear.value)
  const { markCurrentClick } = useCloseOnBodyClick(
    () => isOpen.value,
    () => { isOpen.value = false },
  )

  const monthRoute = (year: number, month: number) => ({
    name: 'index',
    params: {
      year: String(year),
      month: String(month).padStart(2, '0'),
    },
  })

  const toggleSelector = () => {
    const willOpen = !isOpen.value

    if (willOpen) {
      browseYear.value = selectedYear.value
      markCurrentClick()
    }

    isOpen.value = willOpen
  }

  const changeMonth = (offset: number) => {
    const date = new Date(selectedYear.value, selectedMonth.value - 1 + offset, 1)
    void router.push(monthRoute(date.getFullYear(), date.getMonth() + 1))
  }

  const goToNow = () => {
    isOpen.value = false
    void router.push(monthRoute(now.getFullYear(), now.getMonth() + 1))
  }

  const isCurrentMonth = (year: number, month: number) =>
    year === now.getFullYear() && month === now.getMonth() + 1

  const isSelectedMonth = (year: number, month: number) =>
    year === selectedYear.value && month === selectedMonth.value

  watch(
    () => route.fullPath,
    () => {
      isOpen.value = false
      browseYear.value = selectedYear.value
    },
  )

</script>

<style lang="scss" scoped>
.component.monthSelector{
  height: 100%;
  position: relative;
  >.title{
    height: 100%;
    touch-action: manipulation;
    @include flexbox(row, center, center);
    >button{
      width: 42px;
      height: 100%;
      position: relative;
      touch-action: manipulation;
      &::before{
        top: 50%;
        left: 50%;
        width: 9px;
        height: 9px;
        content: '';
        position: absolute;
        border-left: 2px solid $black;
        border-bottom: 2px solid $black;
      }
      &:first-of-type::before{
        transform: translate(-30%, -50%) rotate(45deg);
      }
      &:nth-of-type(2){
        min-width: 70px;
        @include h2();
        font-weight: 600;
        &::before{
          content: none;
        }
      }
      &:last-of-type::before{
        transform: translate(-70%, -50%) rotate(225deg);
      }
    }
  }
  >.selector{
    left: 0;
    opacity: 0;
    height: auto;
    width: 100dvw;
    position: fixed;
    transition: .2s;
    pointer-events: none;
    border: 1px solid $oat;
    bottom: $header_height;
    background-color: $white;
    @include flexbox(column, flex-start, stretch);
    &:before{
      left: -1px;
      content: '';
      z-index: -2;
      bottom: 100%;
      width: 100dvw;
      height: 100dvh;
      position: absolute;
      display: inline-block;
      background-color: rgba(0,0,0,.6);
    }
    >.options{
      padding: 20px 12px;
      position: relative;
      @include flexbox(row, center, center);
      >button.now{
        left: 12px;
        padding: 4px 16px;
        position: absolute;
        border-radius: 8px;
        background-color: #EEE;
      }
      >.year{
        height: 32px;
        @include flexbox(row, center, center);
        >h6{
          height: 100%;
          min-width: 60px;
          @include h3();
          @include flexbox(row, center, center);
        }
        >button{
          width: 42px;
          height: 100%;
          @include flexbox(row, center, center);
          >svg{
            width: 16px;
            height: 16px;
            display: block;
            stroke: $black;
          }
        }
      }
      >.closeBtn{
        right: 12px;
        position: absolute;
      }
    }
    >.list{
      flex-wrap: wrap;
      padding: 0 0 12px;
      @include flexbox(row, space-around, flex-start);
      >a{
        aspect-ratio: 1/1;
        position: relative;
        width: calc(100%/6);
        @include flexbox(row, center, center);
        &:before{
          top: 6px;
          left: 6px;
          opacity: 0;
          content: '';
          z-index: -1;
          position: absolute;
          border-radius: 50%;
          display: inline-block;
          width: calc(100% - 12px);
          height: calc(100% - 12px);
          background-color: $yellow;
        }
        &:after{
          opacity: 0;
          width: 14px;
          height: 2px;
          content: '';
          bottom: 20px;
          transition: .2s;
          position: absolute;
          border-radius: 99px;
          display: inline-block;
          left: calc(50% - 7px);
          background-color: $black;
        }
        &.now{
          font-weight: 600;
          &:before{
            opacity: 1;
          }
        }
        &.current:after{
          opacity: 1;
        }
      }
    }
    &.isOpen{
      opacity: 1;
      pointer-events: auto;
    }
  }
}
</style>
