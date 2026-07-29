<template>
  <div class="transaction">

    <!-- icon -->
    <div class="icon" :style="{'background-color': color}" >
      <img :src="icon" alt="">
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
  defineProps<{
    icon: string
    color: string
    category: string
    isExpense: boolean
    tag: string[]
    note: string
    amount: number
  }>()
</script>

<style lang="scss" scoped>
.transaction {
  width: 100%;
  height: 100%;
  @include flexbox(row, flex-start, center);
  > .icon {
    width: 32px;
    aspect-ratio: 1/1;
    border-radius: 50%;
    > img {

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
