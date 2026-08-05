<template>
  <div class="component category">
    <button
      type="button"
      @click="toggleCategorySelector"
    >
      <div
        v-if="selectedCategory"
        class="icon"
        :style="{ backgroundColor: selectedCategoryColor }"
      >
        <component :is="selectedCategoryIcon" />
      </div>
      <b
        v-if="selectedCategory"
        v-text="selectedCategory.name"
      />
      <ChevronDown />
    </button>
    <section
      class="category-selector"
      :class="{ 'open': isOpen }"
    >
      <ul>
        <li :class="{ now: !isExpense }">
          <button
            type="button"
            @click="isExpense = false"
            v-text="'收入'"
          />
        </li>
        <li :class="{ now: isExpense }">
          <button
            type="button"
            @click="isExpense = true"
            v-text="'支出'"
          />
        </li>
      </ul>
      <div>
        <button
          v-for="category in filteredCategoryList"
          :key="category.id"
          type="button"
          :class="{ selected: category.id === categoryId }"
          @click="selectCategory(category.id)"
        >
          <div :style="{ backgroundColor: categoryColors[category.color] }">
            <component :is="categoryIcons[category.icon]" />
          </div>
          <b v-text="category.name" />
        </button>
      </div>
    </section>
  </div>

</template>

<script lang="ts" setup>
  import { computed, ref, watch } from 'vue'
  import { ChevronDown } from '@lucide/vue'
  import { categoryColors } from '@/shared/colors/category'
  import { categoryIcons } from '@/shared/icons/category'
  import { useCategoryStore } from '@/shared/stores/category'

  const props = defineProps<{
    categoryId: number | null
  }>()

  const emit = defineEmits<{
    'update:categoryId': [categoryId: number]
  }>()

  const categoryStore = useCategoryStore()
  const isOpen = ref(false)
  const isExpense = ref(true)
  const selectedCategory = computed(() => (
    categoryStore.categoryList.find(category => category.id === props.categoryId)
  ))
  const selectedCategoryColor = computed(() => (
    selectedCategory.value
      ? categoryColors[selectedCategory.value.color]
      : undefined
  ))
  const selectedCategoryIcon = computed(() => (
    selectedCategory.value
      ? categoryIcons[selectedCategory.value.icon]
      : undefined
  ))
  const filteredCategoryList = computed(() => (
    categoryStore.categoryList
      .filter(category => category.isExpense === isExpense.value)
      .sort((categoryA, categoryB) => categoryA.index - categoryB.index)
  ))

  watch(selectedCategory, (category) => {
    if (category) isExpense.value = category.isExpense
  }, { immediate: true })

  const toggleCategorySelector = () => {
    isOpen.value = !isOpen.value
  }

  const selectCategory = (categoryId: number) => {
    emit('update:categoryId', categoryId)
    isOpen.value = false
  }
</script>

<style lang="scss" scoped>
  .component.category{
    position: relative;
    >button{
      gap: 8px;
      height: 50px;
      padding: 0 12px;
      min-width: 120px;
      border-radius: 12px;
      border: 1px solid $oat;
      background-color: $white;
      @include flexbox(row, flex-start, center);
      >.icon{
        width: 36px;
        aspect-ratio: 1/1;
        border-radius: 50%;
        @include flexbox(row, center, center);
        >svg{
          width: 24px;
          stroke: $white;
        }
      }
      >b{
        color: $grey;
      }
      >svg{
        width: 20px;
        margin-left: auto;
        stroke: $black;
      }
    }
    >.category-selector{
      gap: 12px;
      opacity: 0;
      z-index: 1;
      position: absolute;
      top: calc(100% + 12px);
      left: 0;
      height: 400px;
      padding: 12px;
      overflow-y: auto;
      transition: .2s;
      pointer-events: none;
      border-radius: 28px;
      transform: scale(.6);
      border: 1px solid $oat;
      width: 100%;
      background-color: $white;
      transform-origin: left top;
      overscroll-behavior: contain;
      -webkit-overflow-scrolling: touch;
      box-shadow: 0px 4px 8px rgba($color: $black, $alpha: .1),
                  0px 12px 24px rgba($color: $black, $alpha: .2);
      @include flexbox(column, flex-start, stretch);
      &.open{
        opacity: 1;
        transform: scale(1);
        pointer-events: auto;
      }
      >ul{
        gap: 12px;
        @include flexbox(row, center, center);
        >li{
          flex: 1;
          gap: 4px;
          @include flexbox(column, center, center);
          >button{
            width: 100%;
            padding: 12px 0;
            @include h3();
          }
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
        >button{
          gap: 4px;
          padding: 12px;
          width: calc(100%/4);
          border-radius: 12px;
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
            max-width: 100%;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
          }
          &.selected{
            background-color: $background;
            box-shadow: inset 0 0 0 1px $oat;
          }
        }
      }
    }
  }
</style>
