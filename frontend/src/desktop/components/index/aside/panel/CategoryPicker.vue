<template>
  <section class="component asideCategoryPicker">
    <header>
      <b>類別</b>
      <div>
        <button class="btn-click-effect" type="button" :class="{ now: !isExpense }" @click="isExpense = false">
          收入
        </button>
        <button class="btn-click-effect" type="button" :class="{ now: isExpense }" @click="isExpense = true">
          支出
        </button>
      </div>
    </header>
    <div class="list">
      <button
        v-for="category in filteredCategories"
        :key="category.id"
        class="btn-click-effect"
        type="button"
        :class="{ selected: category.id === modelValue }"
        @click="emit('update:modelValue', category.id)"
      >
        <span :style="{ backgroundColor: categoryColors[category.color] }">
          <component :is="categoryIcons[category.icon]" />
        </span>
        <b>{{ category.name }}</b>
      </button>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { categoryColors } from '@/shared/colors/category'
import { categoryIcons } from '@/shared/icons/category'
import { useCategoryStore } from '@/shared/stores/category'

const props = defineProps<{
  modelValue: number
}>()

const emit = defineEmits<{
  'update:modelValue': [categoryId: number]
}>()

const categoryStore = useCategoryStore()
const isExpense = ref(true)
const selectedCategory = computed(() => (
  categoryStore.categoryList.find(category => category.id === props.modelValue)
))
const filteredCategories = computed(() => (
  categoryStore.categoryList
    .filter(category => category.isExpense === isExpense.value)
    .slice()
    .sort((categoryA, categoryB) => categoryA.index - categoryB.index)
))

watch(selectedCategory, (category) => {
  if (category) isExpense.value = category.isExpense
}, { immediate: true })
</script>

<style lang="scss" scoped>
  .component.asideCategoryPicker{
    >header{
      margin-bottom: 10px;
      @include flexbox(row, space-between, center);
      >b{
        font-size: 15px;
        font-weight: 600;
      }
      >div{
        padding: 2px;
        border-radius: 8px;
        background-color: $oat;
        @include flexbox(row, flex-start, center);
        >button{
          width: 52px;
          height: 26px;
          color: $grey;
          font-size: 12px;
          border-radius: 6px;
          &.now{
            color: $black;
            font-weight: 600;
            background-color: $yellow;
          }
        }
      }
    }
    >.list{
      gap: 6px;
      display: grid;
      grid-template-columns: repeat(5, minmax(0, 1fr));
      >button{
        gap: 3px;
        padding: 7px 3px;
        min-width: 0;
        border-radius: 10px;
        @include flexbox(column, center, center);
        >span{
          width: 34px;
          aspect-ratio: 1/1;
          border-radius: 50%;
          @include flexbox(row, center, center);
          >svg{
            width: 20px;
            stroke: $white;
          }
        }
        >b{
          width: 100%;
          overflow: hidden;
          font-size: 11px;
          font-weight: 600;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
        &.selected{
          background-color: $white;
          box-shadow: inset 0 0 0 1px $stone;
        }
      }
    }
  }
</style>
