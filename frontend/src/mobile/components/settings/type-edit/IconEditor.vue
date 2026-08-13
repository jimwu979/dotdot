<template>
  <div class="component iconEditor">

    <!-- 示意 -->
    <div
      class="img"
      :style="{backgroundColor: selectedColor}"
    >
      <component :is="selectedIcon" />
    </div>

    <!-- 選擇 icon -->
    <div class="icon">
      <label>icon</label>
      <button
        class="btn-click-effect"
        type="button"
        @click="isIconSelectorOpen = true"
      >
        <component :is="selectedIcon" />
        <ChevronDown class="selector-icon" />
      </button>
    </div>

    <!-- 選擇顏色 -->
    <div class="color">
      <label>顏色</label>
      <button
        class="btn-click-effect"
        type="button"
        @click="isColorSelectorOpen = true"
      >
        <b :style="{backgroundColor: selectedColor}" />
        <ChevronDown class="selector-icon" />
      </button>
    </div>
  </div>

  <!-- 彈窗 -->
  <Lightbox
    :open="isIconSelectorOpen"
    @close="isIconSelectorOpen = false"
  >
    <ul class="icon-list">
      <li
        v-for="i in categoryIconList"
        :key="i"
        :class="{'select': i === icon}"
        @click="selectCategoryIcon(i)"
      >
        <component :is="categoryIcons[i]" />
        <b>
          <Check />
        </b>
      </li>
    </ul>
  </Lightbox>
  <Lightbox
    :open="isColorSelectorOpen"
    @close="isColorSelectorOpen = false"
  >
    <ul class="color-list">
      <li
        v-for="colorId in categoryColorList"
        :key="colorId"
        :class="{'select': colorId === colorIdValue}"
        :style="{backgroundColor: categoryColors[colorId]}"
        @click="selectCategoryColor(colorId)"
      >
        <b>
          <Check />
        </b>
      </li>
    </ul>
  </Lightbox>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Check, ChevronDown } from '@lucide/vue'
import Lightbox from '@/mobile/components/Lightbox.vue'
import {
  categoryColors,
  categoryColorList,
  type CategoryColorId,
} from '@/shared/colors/category'
import {
  categoryIcons,
  categoryIconList,
  type CategoryIconName,
} from '@/shared/icons/category'

const props = defineProps<{
  icon: CategoryIconName | null
  colorId: CategoryColorId | null
}>()

const emit = defineEmits<{
  'update:icon': [icon: CategoryIconName]
  'update:colorId': [colorId: CategoryColorId]
}>()

const selectedIcon = computed(() => (
  props.icon ? categoryIcons[props.icon] : undefined
))
const selectedColor = computed(() => (
  props.colorId ? categoryColors[props.colorId] : undefined
))
const icon = computed(() => props.icon)
const colorIdValue = computed(() => props.colorId)
const isIconSelectorOpen = ref(false)
const isColorSelectorOpen = ref(false)

const selectCategoryIcon = (icon: CategoryIconName) => {
  emit('update:icon', icon)
  isIconSelectorOpen.value = false
}

const selectCategoryColor = (colorId: CategoryColorId) => {
  emit('update:colorId', colorId)
  isColorSelectorOpen.value = false
}
</script>

<style scoped lang="scss">
.component.iconEditor{
  gap: 20px;
  @include flexbox(row, flex-start, center);
  >div{
    gap: 6px;
    @include flexbox(row, flex-start, center);
    &.img{
      width: 46px;
      aspect-ratio: 1/1;
      border-radius: 50%;
      background-color: #EEE;
      @include flexbox(row, center, center);
      >svg{
        width: 40px;
        stroke: $white;
      }
    }
    &.icon, &.color{
      >label{
        @include h3();
        color: $grey;
      }
      >button{
        width: 80px;
        height: 46px;
        position: relative;
        border-radius: 12px;
        padding-right: 18px;
        border: 1px solid $oat;
        @include flexbox(row, center, center);
        >.selector-icon{
          width: 16px;
          right: 8px;
          position: absolute;
        }
      }
    }
    &.icon{

    }
    &.color{
      >button{
        >b{
          width: 32px;
          aspect-ratio: 1/1;
          border-radius: 50%;
          background-color: #EEE;
        }
      }
    }
  }
}
.icon-list, .color-list{
  gap: 24px;
  width: 100%;
  flex-wrap: wrap;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  max-height: calc(100dvh - $header_height - 88px);
  padding: 24px 12px;
  @include flexbox(row, space-between, flex-start);
  >li{
    transition: .2s;
    aspect-ratio: 1/1;
    position: relative;
    border-radius: 50%;
    background-color: $oat;
    width: calc((100% - (24px * 4))/5);
    @include flexbox(row, center, center);
    >svg{
      width: 80%;
    }
    >b{
      width: 26px;
      aspect-ratio: 1/1;
      position: absolute;
      border-radius: 50%;
      right: -10px;
      bottom: -6px;
      opacity: 0;
      border: 2px solid $black;
      background-color: $yellow;
      @include flexbox(row, center, center);
      >svg{
        height: 70%;
        transform: translateY(1px);
      }
    }
    &.select{
      box-shadow: inset 0 0 0 2px $black;
      >b{
        opacity: 1;
      }
    }
  }
}
.icon-list{
  >li{
    background-color: $oat;
    &.select{
      // background-color: $yellow;
    }
  }
}
</style>
