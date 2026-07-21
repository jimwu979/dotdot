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

    <div class="selector" :class="{'isOpen': isOpen}">

      <!-- options -->
      <div class="options">
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
          width: 16px;
          content: '';
          aspect-ratio: 16/9;
          display: inline-block;
          background-image: url('/arrow_line_black.png');
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
    left: 12px;
    opacity: 0;
    position: fixed;
    transition: .2s;
    border-radius: 6px;
    pointer-events: none;
    background-color: $yellow;
    width: calc(100dvw - 24px);
    transform: translateY(10px);
    bottom: calc($header_height + 12px);
    overflow: hidden;
    @include flexbox(column, flex-start, stretch);
    >.options{
      padding: 12px;
      position: relative;
      background-color: $yellow;
      @include flexbox(row, center, center);
      >button.now{
        left: 12px;
        padding: 2px 12px;
        position: absolute;
        border-radius: 8px;
        background-color: rgba(255,255,255,.4);
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
      padding-top: 12px;
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
          position: absolute;
          border-radius: 50%;
          display: inline-block;
          width: calc(100% - 12px);
          height: calc(100% - 12px);
          background-color: rgba(255,255,255,.4);
        }
        &.now:before{
          opacity: 1;
          z-index: -1;
        }
        &.current{
          font-weight: 700;
          text-decoration: underline;
          text-underline-offset: 4px;
        }
      }
    }
    &.isOpen{
      opacity: 1;
      pointer-events: auto;
      transform: translateY(0);
    }
  }
}
</style>
