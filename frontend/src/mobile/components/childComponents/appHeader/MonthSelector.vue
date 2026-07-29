<template>
  <div class="component monthSelector">

    <div class="title">
      <button type="button" @click="changeMonth(-1)" />
      <button
        type="button"
        v-text="`${selectedMonth}月`"
        @click="toggleSelector"
      />
      <button type="button" @click="changeMonth(1)" />
    </div>

    <div class="selector" :class="{'isOpen': isOpen}" @click="isOpen = false">

      <!-- options -->
      <div class="options" @click.stop>
        <button type="button" class="now" @click="goToNow">NOW</button>
        <div class="year">
          <button type="button" class="prev" @click="browseYear--" />
          <h6 v-text="browseYear" />
          <button type="button" class="next" @click="browseYear++" />
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
  import CloseBtn from '@/mobile/components/closeBtn.vue'

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

  const monthRoute = (year: number, month: number) => ({
    name: 'index',
    params: {
      year: String(year),
      month: String(month).padStart(2, '0'),
    },
  })

  const toggleSelector = () => {
    if (!isOpen.value) browseYear.value = selectedYear.value
    isOpen.value = !isOpen.value
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
      height: 100%;
      padding: 8px;
      touch-action: manipulation;
      >img{
        width: 16px;
      }
      &:nth-of-type(odd){
        &:before{
          width: 12px;
          content: '';
          aspect-ratio: 16/9;
          display: inline-block;
          background-image: url('/arrow_fill_black.png');
        }
      }
      &:nth-of-type(1){
        padding-right: 18px;
        &:before{
          transform: rotateZ(-90deg);
        }
      }
      &:nth-of-type(2){
        @include h2();
        font-weight: 600;
      }
      &:nth-of-type(3){
        padding-left: 18px;
        &:before{
          transform: rotateZ(90deg);
        }
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
        @include flexbox(row, center, center);
        >h6{
          @include h3();
        }
        >button{
          &:before{
            width: 16px;
            content: '';
            aspect-ratio: 16/9;
            display: inline-block;
            background-image: url('/arrow_line_black.png');
          }
          &.prev{
            padding-right: 18px;
            &:before{
              transform: rotateZ(-90deg);
            }
          }
          &.next{
            padding-left: 18px;
            &:before{
              transform: rotateZ(90deg);
            }
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
