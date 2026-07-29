<template>
  <div class="fixed-btn-box">

    <!-- 按鈕 -->
    <button class="assistant" @click="selectorType = 'dotdot'" />
    <button :class="['add', {'close-btn': selectorType !== ''}]" @click="clickAddBtn" />

    <!-- 記帳類別選擇器 -->
    <section class="category-selector" :class="{'isOpen': selectorType === 'category'}">
      <ul>
        <li :class="{'now': !isExpense}" @click="isExpense = false">收入</li>
        <li :class="{'now': isExpense}" @click="isExpense = true">支出</li>
      </ul>
      <div>
        <template v-for="(i, index) in categoryList">
          <router-link
            v-if="i.isExpense === isExpense"
            :key="index"
            :to="`${i.id}`"
          >
            <div :style="{'background-color': i.color}">
              <!-- <img src="" alt=""> -->
            </div>
            <b>{{ i.name }}</b>
          </router-link>
        </template>
      </div>
    </section>

    <!-- 點點記帳 -->
    <section class="dotdot-selector" :class="{'isOpen': selectorType === 'dotdot'}">
      <div class="title">
        <h2>點點記帳</h2>
        <button>編輯</button>
      </div>
      <div class="list fixed">
        <h5>釘選</h5>
        <ul>
          <li v-for="(i, index) in getDotdotList(true)" :key="index">
            <transaction
              :icon="i.categoryIcon"
              :color="i.categoryColor"
              :category="i.categoryName"
              :is-expense="i.isExpense"
              :tag="i.tag"
              :note="i.note"
              :amount="i.amount"
            />
          </li>
        </ul>
      </div>
      <div class="list">
        <ul>
          <li v-for="(i, index) in getDotdotList(false)" :key="index">
            <transaction
              :icon="i.categoryIcon"
              :color="i.categoryColor"
              :category="i.categoryName"
              :is-expense="i.isExpense"
              :tag="i.tag"
              :note="i.note"
              :amount="i.amount"
            />
          </li>
        </ul>
      </div>
    </section>

  </div>
</template>

<script lang="ts" setup>
  import { ref, type Ref, computed } from 'vue'
  import Transaction from '@/mobile/components/transaction.vue'
  const isExpense: Ref<boolean> = ref(true)
  // const selectorIsOpen: Ref<boolean> = ref(true)
  const selectorType: Ref<string> = ref('dotdot') // category || dotdot
  const categoryList = [
    {
      icon: '',
      color: '#FFF3BD',
      name: '電話費',
      id: 0,
      isExpense: true,
    },
    {
      icon: '',
      color: '#DDEFD8',
      name: '水電費',
      id: 0,
      isExpense: true,
    },
    {
      icon: '',
      color: '#DCEBFA',
      name: '正餐',
      id: 0,
      isExpense: true,
    },
    {
      icon: '',
      color: '#E8DDF5',
      name: '飲料',
      id: 0,
      isExpense: true,
    },
    {
      icon: '',
      color: '#F9DCCF',
      name: '其他',
      id: 0,
      isExpense: true,
    },
    {
      icon: '',
      color: '#F6D6DF',
      name: '生活費',
      id: 0,
      isExpense: false,
    },
    {
      icon: '',
      color: '#D7EFEA',
      name: '發票中獎',
      id: 0,
      isExpense: false,
    },
  ]
  const dotdotList = [
    {
      fixed: true,
      sort: 3,
      categoryIcon: '',
      categoryColor: '#FFF3BD',
      categoryName: '電話費',
      tag: [],
      note: '',
      amount: 599,
      isExpense: true,
    },
    {
      fixed: true,
      sort: 2,
      categoryIcon: '',
      categoryColor: '#DDEFD8',
      categoryName: '交通',
      tag: ['悠遊卡'],
      note: '',
      amount: 1000,
      isExpense: true,
    },
    {
      fixed: true,
      sort: 1,
      categoryIcon: '',
      categoryColor: '#DCEBFA',
      categoryName: '生活費',
      tag: [],
      note: '',
      amount: 10000,
      isExpense: false,
    },
    {
      fixed: false,
      sort: 1,
      categoryIcon: '',
      categoryColor: '#DCEBFA',
      categoryName: '正餐',
      tag: ['早餐'],
      note: '茶葉蛋 + 鮮奶',
      amount: 50,
      isExpense: true,
    },
    {
      fixed: false,
      sort: 3,
      categoryIcon: '',
      categoryColor: '#DCEBFA',
      categoryName: '正餐',
      tag: ['早餐', '711拿鐵'],
      note: '茶葉蛋 + 拿鐵 + 拿鐵 + 拿鐵 + 拿鐵 + 拿鐵',
      amount: 55,
      isExpense: true,
    },
    {
      fixed: false,
      sort: 2,
      categoryIcon: '',
      categoryColor: '#E8DDF5',
      categoryName: '晚餐',
      tag: [],
      note: '',
      amount: 75,
      isExpense: true,
    },
    {
      fixed: true,
      sort: 4,
      categoryIcon: '',
      categoryColor: '#F9DCCF',
      categoryName: '儲糧',
      tag: ['豆漿'],
      note: '',
      amount: 50,
      isExpense: true,
    },
    {
      fixed: true,
      sort: 5,
      categoryIcon: '',
      categoryColor: '#F9DCCF',
      categoryName: '儲糧',
      tag: ['鮮奶'],
      note: '',
      amount: 100,
      isExpense: true,
    },
  ]
  const getDotdotList = (isFixed: boolean) => {
    return dotdotList
      .filter(i => i.fixed === isFixed)
      .sort((a, b) => a.sort - b.sort)
  }
  const clickAddBtn = () => {
    selectorType.value = (selectorType.value === '') ? 'category' : ''
  }
</script>

<style lang="scss" scoped>
.fixed-btn-box{
  gap: 12px;
  right: 12px;
  bottom: 106px;
  position: fixed;
  @include flexbox(column, flex-end, flex-end);
  > button {
    width: 64px;
    aspect-ratio: 1/1;
    position: relative;
    border-radius: 50%;
    border: 2px solid $black;
    box-shadow: 0 8px 22px rgba(42, 36, 24, .2);
    &.assistant {
      gap: 8px;
      background-color: $white;
      @include flexbox(row, center, center);
      &::before,
      &::after {
        width: 14px;
        content: '';
        aspect-ratio: 1/1;
        border-radius: 50%;
        background-color: $black;
      }
    }
    &.add {
      z-index: 1;
      transition: .2s;
      background-color: $yellow;
      &::before,
      &::after {
        top: 50%;
        left: 50%;
        content: '';
        position: absolute;
        border-radius: 99px;
        background-color: $black;
        transform: translate(-50%, -50%);
      }
      &::before {
        width: 22px;
        height: 2px;
      }
      &::after {
        width: 2px;
        height: 22px;
      }
      &.close-btn{
        transform: rotateZ(45deg);
      }
    }
  }
  >section{
    left: 12px;
    opacity: 0;
    bottom: 180px;
    padding: 12px;
    overflow: auto;
    position: fixed;
    transition: .2s;
    border-radius: 28px;
    transform: scale(.6);
    pointer-events: none;
    border: 1px solid $oat;
    width: calc(100% - 24px);
    background-color: $white;
    transform-origin: right bottom;
    @include flexbox(column, flex-start, stretch);
    box-shadow: 0px  4px  8px rgba($color: $black, $alpha: .1),
                0px 12px 24px rgba($color: $black, $alpha: .2);
    &.isOpen{
      opacity: 1;
      transform: scale(1);
      pointer-events: auto;
    }
    &.category-selector{
      gap: 12px;
      height: 400px;
      >ul{
        gap: 12px;
        @include flexbox(row, center, center);
        >li{
          flex: 1;
          gap: 4px;
          @include h3();
          padding: 12px 0;
          @include flexbox(column, center, center);
          &:after{
            opacity: 0;
            width: 20px;
            height: 2px;
            content: '';
            transition: .2s;
            border-radius: 99px;
            transform: scaleX(0);
            display: inline-block;
            background-color: $yellow;
          }
          &.now:after{
            opacity: 1;
            transform: scaleX(1);
          }
        }
      }
      >div{
        flex-wrap: wrap;
        @include flexbox(row, flex-start, flex-start);
        >a{
          gap: 4px;
          padding: 12px;
          width: calc(100%/4);
          @include flexbox(column, center, center);
          >div{
            width: 46px;
            aspect-ratio: 1/1;
            border-radius: 50%;
          }
          >b{
          }
        }
      }
    }
    &.dotdot-selector{
      gap: 12px;
      min-height: 200px;
      max-height: calc(100% - 180px - 12px);
      @include flexbox(column, flex-start, stretch);
      >.title{
        padding-top: 12px;
        @include flexbox(row, space-between, center);
        >h2{
          @include h2();
        }
        >button{
          color: $brown;
          padding: 4px 20px;
          border-radius: 8px;
          letter-spacing: 1px;
          border: 1px solid $oat;
          background-color: $background;
        }
      }
      >.list{
        gap: 12px;
        width: 100%;
        @include flexbox(column, flex-start, stretch);
        >h5{
          color: $grey;
        }
        >ul{
          gap: 8px;
          @include flexbox(column, flex-start, stretch);
          >li{
            height: 46px;
            @include flexbox(row, center, center);
          }
        }
        &.fixed{
          padding: 12px 8px;
          border-radius: 12px;
          border: 1px solid $oat;
          background-color: $background;
        }
      }
    }
  }
}
</style>
