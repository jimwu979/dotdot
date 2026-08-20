<template>
  <div class="component category-modal" :class="{ open }" @click.self="emit('cancel')">
    <div class="content">
      <CategoryPicker v-model="draftCategoryId" />
      <SettingsTagSelector
        v-model:selected-tag-ids="draftTagIds"
        :tags="availableTags"
      />
      <div class="actions">
        <button class="cancel btn-click-effect" type="button" @click="emit('cancel')">取消</button>
        <button class="confirm btn-click-effect" type="button" @click="emit('confirm', draftCategoryId, draftTagIds)">確定</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import CategoryPicker from '@/desktop/components/index/aside/panel/CategoryPicker.vue'
import SettingsTagSelector from '@/desktop/components/settings/SettingsTagSelector.vue'
import { useCategoryStore } from '@/shared/stores/category'

const props = defineProps<{
  open: boolean
  selectedCategoryId: number
  selectedTagIds: number[]
}>()

const emit = defineEmits<{
  cancel: []
  confirm: [categoryId: number, tagIds: number[]]
}>()

const categoryStore = useCategoryStore()
const draftCategoryId = ref(props.selectedCategoryId)
const draftTagIds = ref<number[]>([])
const availableTags = computed(() => (
  categoryStore.categoryList
    .find(category => category.id === draftCategoryId.value)
    ?.tags.slice()
    .sort((tagA, tagB) => tagA.index - tagB.index) ?? []
))

watch(draftCategoryId, () => {
  draftTagIds.value = []
}, { flush: 'sync' })

watch(() => props.open, (open) => {
  if (!open) return

  draftCategoryId.value = props.selectedCategoryId
  draftTagIds.value = [...props.selectedTagIds]
})
</script>

<style lang="scss" scoped>
  .component.category-modal{
    inset: 0;
    z-index: 3;
    opacity: 0;
    padding: 18px;
    position: absolute;
    pointer-events: none;
    transition: opacity .2s;
    background-color: rgba($black,.42);
    @include flexbox(row, center, center);
    &.open{
      opacity: 1;
      pointer-events: auto;
      >.content{
        opacity: 1;
        transform: scale(1);
        pointer-events: auto;
      }
    }
    >.content{
      opacity: 0;
      width: 100%;
      padding: 18px;
      border-radius: 18px;
      pointer-events: none;
      transform: scale(.94);
      background-color: $background;
      transition: opacity .2s, transform .2s;
      >.settings-tag-selector{
        margin-top: 18px;
      }
      >.actions{
        gap: 10px;
        margin-top: 18px;
        @include flexbox(row, flex-end, center);
        >button{
          width: 92px;
          height: 42px;
          font-weight: 600;
          border-radius: 10px;
          &.cancel{
            border: 1px solid $stone;
            background-color: $white;
          }
          &.confirm{
            background-color: $yellow;
          }
        }
      }
    }
  }
</style>
