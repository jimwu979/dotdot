<template>
  <div class="page category-editor">
    <Breadcrumb
      :items="[
        { url: '/mobile/settings', text: '設定' },
        { url: '/mobile/settings/category', text: '類別' },
        { url: '', text: '編輯' },
      ]"
    />
    <main>

      <!-- 名稱 -->
      <FormItem
        class="input"
        :label="'名稱'"
        :require="true"
      >
        <input
          v-model="categoryData.name"
          type="text"
        >
        <p
          v-if="nameError"
          class="error-message"
          v-text="nameError"
        />
      </FormItem>

      <!-- 類別 -->
      <FormItem
        class="radio"
        :label="'類別'"
        :require="true"
      >
        <button
          type="button"
          :class="{ selected: categoryData.isExpense === false }"
          @click="categoryData.isExpense = false"
        >
          收入
        </button>
        <button
          type="button"
          :class="{ selected: categoryData.isExpense === true }"
          @click="categoryData.isExpense = true"
        >
          支出
        </button>
      </FormItem>

      <!-- 圖示 -->
      <FormItem
        :label="'圖示'"
        :require="true"
      >
        <IconEditor
          v-model:icon="categoryData.icon"
          v-model:color-id="categoryData.color"
        />
      </FormItem>

      <!-- 標籤 -->
      <FormItem :label="'標籤'">
        <TagEditor
          v-model:tags="categoryData.tags"
          :next-tag-id="nextTagId"
        />
      </FormItem>

      <!-- 按鈕 -->
      <div>
        <div class="btn-box">
          <btn
            text="取消"
            type="cancel"
            @click="isCancelConfirmOpen = true"
          />
          <btn
            text="儲存"
            type="confirm"
            @click="saveCategory"
          />
        </div>
      </div>

    </main>
    <AppHeader
      title="設定"
      :right-action="categoryId !== null ? 'delete' : undefined"
      @delete="isDeleteConfirmOpen = true"
    />
    <ConfirmDialog
      :open="isCancelConfirmOpen"
      message="確定要取消編輯嗎？尚未儲存的變更將會遺失。"
      confirm-text="確定取消"
      @cancel="isCancelConfirmOpen = false"
      @confirm="cancelEdit"
    />
    <ConfirmDialog
      :open="isNameErrorDialogOpen"
      message="類別名稱為必填欄位"
      confirm-text="知道了"
      :show-cancel="false"
      @cancel="isNameErrorDialogOpen = false"
      @confirm="isNameErrorDialogOpen = false"
    />
    <ConfirmDialog
      :open="isDeleteConfirmOpen"
      message="確定要刪除此類別嗎？"
      confirm-text="確認刪除"
      confirm-type="delete"
      @cancel="isDeleteConfirmOpen = false"
      @confirm="confirmDeleteCategory"
    />
  </div>
</template>

<script setup lang="ts">
  import { computed, reactive, ref, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import AppHeader from '@/mobile/components/AppHeader.vue'
  import Breadcrumb from '@/mobile/components/Breadcrumb.vue'
  import ConfirmDialog from '@/mobile/components/ConfirmDialog.vue'
  import FormItem from '@/mobile/components/FormItem.vue'
  import btn from '@/mobile/components/btn.vue'
  import IconEditor from '@/mobile/components/settings/type-edit/IconEditor.vue'
  import TagEditor from '@/mobile/components/settings/type-edit/TagEditor.vue'
  import {
    categoryColorList,
    type CategoryColorId,
  } from '@/shared/colors/category'
  import {
    categoryIconList,
    type CategoryIconName,
  } from '@/shared/icons/category'
  import {
    useCategoryStore,
    type CategoryData,
    type Tag,
  } from '@/shared/stores/category'

  interface CategoryEditorData {
    name: string
    isExpense: boolean | null
    icon: CategoryIconName | null
    color: CategoryColorId | null
    tags: Tag[]
  }

  const route = useRoute()
  const router = useRouter()
  const categoryStore = useCategoryStore()
  const categoryId = ref<number | null>(null)
  const nameError = ref('')
  const isCancelConfirmOpen = ref(false)
  const isNameErrorDialogOpen = ref(false)
  const isDeleteConfirmOpen = ref(false)
  const categoryData = reactive<CategoryEditorData>({
    name: '',
    isExpense: null,
    icon: null,
    color: null,
    tags: [],
  })

  const nextTagId = computed(() => {
    const tagIds = categoryStore.categoryList
      .flatMap(category => category.tags.map(tag => tag.id))

    return Math.max(0, ...tagIds, ...categoryData.tags.map(tag => tag.id)) + 1
  })

  const resetCategoryData = () => {
    categoryId.value = null
    nameError.value = ''
    isCancelConfirmOpen.value = false
    isNameErrorDialogOpen.value = false
    isDeleteConfirmOpen.value = false
    categoryData.name = ''
    categoryData.isExpense = route.query.isExpense !== 'false'
    categoryData.icon = categoryIconList[0]
    categoryData.color = categoryColorList[0]
    categoryData.tags = []
  }

  const loadCategoryData = () => {
    resetCategoryData()

    const queryId = Array.isArray(route.query.id)
      ? route.query.id[0]
      : route.query.id

    if (typeof queryId !== 'string' || !queryId) return

    const id = Number(queryId)

    if (!Number.isInteger(id)) return

    const category = categoryStore.categoryList.find(category => category.id === id)

    if (!category) return

    categoryId.value = category.id
    categoryData.name = category.name
    categoryData.isExpense = category.isExpense
    categoryData.icon = category.icon
    categoryData.color = category.color
    categoryData.tags = category.tags.map(tag => ({ ...tag }))
  }

  watch(() => route.query.id, loadCategoryData, { immediate: true })

  const cancelEdit = () => {
    isCancelConfirmOpen.value = false
    router.back()
  }

  const saveCategory = () => {
    nameError.value = categoryData.name.trim()
      ? ''
      : '類別名稱為必填欄位'

    if (nameError.value) {
      isNameErrorDialogOpen.value = true
      return
    }

    const isExpense = categoryData.isExpense
    const icon = categoryData.icon
    const color = categoryData.color

    if (isExpense === null || icon === null || color === null) return

    const nextCategoryData: CategoryData = {
      name: categoryData.name.trim(),
      isExpense,
      icon,
      color,
      tags: categoryData.tags.map(tag => ({ ...tag })),
    }

    if (categoryId.value === null) {
      categoryStore.addCategory(nextCategoryData)
    } else {
      categoryStore.updateCategory(categoryId.value, nextCategoryData)
    }

    router.back()
  }

  const confirmDeleteCategory = () => {
    isDeleteConfirmOpen.value = false

    if (categoryId.value === null) return

    if (categoryStore.deleteCategory(categoryId.value)) router.back()
  }
</script>

<style scoped lang="scss">
  .page.category-editor{
    >main{
      gap: 28px;
      @include flexbox(column, flex-start, stretch);
      >.form-item{
        &.input{
          :deep(>div > input){
            width: 100%;
            height: 50px;
            padding: 0 4px;
            border-radius: 8px;
            border: 1px solid $stone;
            background-color: $white;
          }
          :deep(>div > .error-message){
            color: $red;
            margin-top: 4px;
            @include p();
          }
        }
        &.radio{
          :deep(>div){
            gap: 20px;
            @include flexbox(row, flex-start, center);
          }
          :deep(>div > button){
            $size: 16px;
            @include h3();
            position: relative;
            padding-left: 28px;
            &:before, &:after{
              left: 0;
              content: '';
              aspect-ratio: 1/1;
              position: absolute;
              border-radius: 50%;
              display: inline-block;
            }
            &:before{
              width: 24px;
              top: calc(50% - 12px);
              border: 1px solid $brown;
            }
            &:after{
              left: 4px;
              opacity: 0;
              width: 16px;
              transition: .2s;
              top: calc(50% - 8px);
              transform: scale(.6);
              background-color: $brown;
            }
            &.selected{
              &:after{
                opacity: 1;
                transform: scale(1);
              }
            }
          }
        }
      }
      >div{
        gap: 24px;
        @include flexbox(column, flex-start, center);
        >.btn-box{
          gap: 12px;
          width: 100%;
          @include flexbox(row, flex-end, center);
        }
      }
    }
  }
</style>
