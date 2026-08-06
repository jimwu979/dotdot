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
        <template v-for="i in categoryList" :key="i.id">
          <router-link
            v-if="i.isExpense === isExpense"
            :to="{
              path: '/mobile/record',
              query: { categoryID: i.id },
            }"
          >
            <div :style="{'background-color': categoryColors[i.color]}">
              <component :is="categoryIcons[i.icon]" />
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
          <li
            v-for="i in getDotdotList(true)"
            :key="i.id"
            @click="addDotdotRecord(i)"
          >
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
          <li
            v-for="i in getDotdotList(false)"
            :key="i.id"
            @click="addDotdotRecord(i)"
          >
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
  import { computed, onBeforeUnmount, onMounted, ref, type Ref } from 'vue'
  import Transaction from '@/mobile/components/transaction.vue'
  import { categoryColors } from '@/shared/colors/category'
  import { categoryIcons } from '@/shared/icons/category'
  import { useCategoryStore } from '@/shared/stores/category'
  import { useDotdotStore, type DotdotItem } from '@/shared/stores/dotdot'
  import { useRecordStore } from '@/shared/stores/record'

  interface DotdotDisplayItem extends DotdotItem {
    categoryIcon: string
    categoryColor: string
    categoryName: string
    tag: string[]
    note: string
    amount: number
    isExpense: boolean
  }

  const categoryStore = useCategoryStore()
  const dotdotStore = useDotdotStore()
  const recordStore = useRecordStore()
  const isExpense: Ref<boolean> = ref(true)
  const currentTime = ref(new Date())
  // const selectorIsOpen: Ref<boolean> = ref(true)
  const selectorType: Ref<string> = ref('') // 'category' || 'dotdot' || ''
  let currentTimeTimer: number | undefined

  const categoryList = computed(() => (
    categoryStore.categoryList
      .slice()
      .sort((categoryA, categoryB) => categoryA.index - categoryB.index)
  ))

  const getTimeInMinutes = (time: string) => {
    const [hour = 0, minute = 0] = time.split(':').map(Number)

    return hour * 60 + minute
  }

  const isInDisplayTiming = (item: DotdotItem) => {
    if (item.fixed) return true

    const now = currentTime.value

    if (!item.displayTiming.weekdays.includes(now.getDay())) return false

    const minutes = now.getHours() * 60 + now.getMinutes()
    const startMinutes = getTimeInMinutes(item.displayTiming.startTime)
    const endMinutes = getTimeInMinutes(item.displayTiming.endTime)

    if (startMinutes <= endMinutes) {
      return minutes >= startMinutes && minutes <= endMinutes
    }

    return minutes >= startMinutes || minutes <= endMinutes
  }

  const getDotdotDisplayItem = (item: DotdotItem): DotdotDisplayItem => {
    const category = categoryStore.categoryList
      .find(category => category.id === item.record.categoryId)
    const selectedTagIds = new Set(item.record.tagIds)

    return {
      ...item,
      categoryIcon: category?.icon ?? '',
      categoryColor: category ? categoryColors[category.color] : '',
      categoryName: category?.name ?? '',
      tag: category?.tags
        .filter(tag => selectedTagIds.has(tag.id))
        .sort((tagA, tagB) => tagA.index - tagB.index)
        .map(tag => tag.name) ?? [],
      note: item.record.note,
      amount: item.record.amount,
      isExpense: category?.isExpense ?? true,
    }
  }

  const getDotdotList = (isFixed: boolean) => {
    return dotdotStore
      .getDotdotList(isFixed, true)
      .filter(isInDisplayTiming)
      .map(getDotdotDisplayItem)
  }

  const getCurrentDate = () => {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
  }

  const addDotdotRecord = (item: DotdotItem) => {
    recordStore.addRecord({
      categoryId: item.record.categoryId,
      tagIds: [...item.record.tagIds],
      note: item.record.note,
      amount: item.record.amount,
      occurredAt: getCurrentDate(),
    })
    selectorType.value = ''
  }

  onMounted(() => {
    currentTimeTimer = window.setInterval(() => {
      currentTime.value = new Date()
    }, 30_000)
  })

  onBeforeUnmount(() => {
    window.clearInterval(currentTimeTimer)
  })

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
            @include flexbox(row, center, center);
            >svg{
              width: 32px;
              stroke: $white;
            }
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
            cursor: pointer;
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
