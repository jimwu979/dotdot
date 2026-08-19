<template>
  <section class="component savingMonthPicker">
    <header>
      <button class="btn-click-effect" type="button" @click="visibleYear -= 1">
        <ChevronLeft />
      </button>
      <b>{{ visibleYear }} 年</b>
      <button class="btn-click-effect" type="button" @click="visibleYear += 1">
        <ChevronRight />
      </button>
    </header>
    <div>
      <div
        v-for="month in 12"
        :key="month"
      >
        <button
          class="btn-click-effect"
          type="button"
          :class="{ selected: visibleYear === selectedYear && month === selectedMonth }"
          @click="selectMonth(month)"
        >
          {{ month }} 月
        </button>
        <i :class="{ show: visibleYear === currentYear && month === currentMonth }" />
      </div>
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
  'update:modelValue': [month: string]
}>()

const now = new Date()
const currentYear = now.getFullYear()
const currentMonth = now.getMonth() + 1
const selectedYear = computed(() => Number(props.modelValue.slice(0, 4)))
const selectedMonth = computed(() => Number(props.modelValue.slice(5, 7)))
const visibleYear = ref(selectedYear.value || currentYear)

watch(selectedYear, year => {
  if (year) visibleYear.value = year
})

const selectMonth = (month: number) => {
  emit('update:modelValue', `${visibleYear.value}-${String(month).padStart(2, '0')}`)
}
</script>

<style lang="scss" scoped>
.component.savingMonthPicker {
  width: 100%;
  > header {
    padding-bottom: 10px;
    @include flexbox(row, space-between, center);
    > button {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      @include flexbox(row, center, center);
      > svg {
        width: 18px;
      }
    }
    > b {
      font-weight: 600;
    }
  }
  > div {
    gap: 4px 0;
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    > div {
      width: 60px;
      height: 60px;
      margin: 0 auto;
      position: relative;
      > button {
        width: 52px;
        height: 52px;
        margin: 0 auto;
        border-radius: 50%;
        transition: background-color .2s;
        @include flexbox(row, center, center);
        &.selected {
          font-weight: 600;
          background-color: $yellow;
        }
      }
      > i {
        width: 18px;
        height: 2px;
        opacity: 0;
        position: absolute;
        left: calc(50% - 9px);
        top: calc(50% + 7px);
        border-radius: 99px;
        background-color: $black;
        &.show {
          opacity: 1;
        }
      }
    }
  }
}
</style>
