<template>
  <div class="transaction">

    <!-- icon -->
    <div class="icon" :style="{'background-color': color}" >
      <component
        v-if="iconComponent"
        :is="iconComponent"
      />
      <span
        v-if="status"
        :class="['status', status]"
      >
        <Repeat2 />
      </span>
    </div>

    <!-- 類別名稱 -->
    <h6 v-text="category" />

    <!-- 標籤 -->
    <b v-for="(item, index) in tag" :key="index" v-text="item" />

    <!-- 備註 -->
    <p v-text="note" />

    <!-- 金額 -->
    <strong :class="{'isNotExpense': !isExpense}">
      {{ isExpense ? '' : '+' }}{{ amount }}
    </strong>

  </div>
</template>

<script lang="ts" setup>
  import { computed } from 'vue'
  import { Repeat2 } from '@lucide/vue'
  import {
    categoryIcons,
    type CategoryIconName,
  } from '@/shared/icons/category'

  const props = defineProps<{
    icon: string
    color: string
    category: string
    isExpense: boolean
    tag: string[]
    note: string
    amount: number
    status?: 'automatic'
  }>()

  const iconComponent = computed(() => {
    if (!(props.icon in categoryIcons)) return undefined

    return categoryIcons[props.icon as CategoryIconName]
  })
</script>

<style lang="scss" scoped>
.transaction {
  width: 100%;
  height: 100%;
  @include flexbox(row, flex-start, center);
  > .icon {
    width: 32px;
    flex: 0 0 auto;
    position: relative;
    aspect-ratio: 1/1;
    border-radius: 50%;
    @include flexbox(row, center, center);
    > svg {
      width: 18px;
      stroke: $white;
    }
    >.status{
      right: -4px;
      bottom: -4px;
      width: 18px;
      flex: 0 0 auto;
      position: absolute;
      aspect-ratio: 1/1;
      border-radius: 50%;
      background-color: $yellow;
      @include flexbox(row, center, center);
      >svg{
        height: 13px;
        stroke: $black;
      }
    }
  }
  > h6 {
    font-size: 16px;
    margin-left: 8px;
  }
  > b {
    line-height: 1;
    color: $mustard;
    font-size: 12px;
    padding: 3px 4px;
    margin-left: 8px;
    border-radius: 4px;
    letter-spacing: 1px;
    border: 1px solid $mustard;
    background-color: $background;
    ~ b {
      margin-left: 4px;
    }
  }
  > p {
    flex: 1;
    color: $grey;
    font-size: 12px;
    margin-left: 8px;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    text-overflow: ellipsis;
    -webkit-box-orient: vertical;
  }
  > strong {
    &.isNotExpense {
      color: $green;
      font-weight: 600;
    }
  }
}
</style>
