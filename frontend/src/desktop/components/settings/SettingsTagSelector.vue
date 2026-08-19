<template>
  <section class="component settings-tag-selector">
    <b>標籤</b>
    <ul v-if="tags.length">
      <li
        v-for="tag in tags"
        :key="tag.id"
        :class="{ checked: selectedTagIds.includes(tag.id) }"
      >
        <button class="btn-click-effect" type="button" @click="toggleTag(tag.id)">
          {{ tag.name }}
        </button>
        <b><Check /></b>
      </li>
    </ul>
    <p v-else>此類別尚無標籤</p>
  </section>
</template>

<script lang="ts" setup>
import { Check } from '@lucide/vue'
import type { Tag } from '@/shared/stores/category'

const props = defineProps<{
  tags: Tag[]
  selectedTagIds: number[]
}>()
const emit = defineEmits<{
  'update:selectedTagIds': [tagIds: number[]]
}>()
const toggleTag = (tagId: number) => {
  emit(
    'update:selectedTagIds',
    props.selectedTagIds.includes(tagId)
      ? props.selectedTagIds.filter(selectedTagId => selectedTagId !== tagId)
      : [...props.selectedTagIds, tagId],
  )
}
</script>

<style lang="scss" scoped>
.component.settings-tag-selector{
  >b{
    display: block;
    font-weight: 600;
    margin-bottom: 10px;
  }
  >ul{
    gap: 12px;
    width: 100%;
    flex-wrap: wrap;
    @include flexbox(row, flex-start, flex-start);
    >li{
      position: relative;
      >button{
        color: $mustard;
        min-height: 34px;
        padding: 6px 10px;
        border-radius: 6px;
        border: 1px solid $stone;
        background-color: $white;
      }
      >b{
        width: 20px;
        opacity: 0;
        right: -8px;
        bottom: -8px;
        position: absolute;
        aspect-ratio: 1/1;
        border-radius: 50%;
        transition: opacity .2s;
        background-color: $yellow;
        @include flexbox(row, center, center);
        >svg{
          height: 70%;
          stroke: $black;
        }
      }
      &.checked{
        >button{
          background-color: $oat;
        }
        >b{
          opacity: 1;
        }
      }
    }
  }
  >p{
    color: $grey-light;
  }
}
</style>
