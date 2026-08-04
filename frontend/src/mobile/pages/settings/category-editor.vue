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
      <section>
        <label class="require">名稱</label>
        <div class="input">
          <input type="text">
        </div>
      </section>

      <!-- 類別 -->
      <section>
        <label class="require">類別</label>
        <div class="radio">
          <button class="selected">收入</button>
          <button>支出</button>
        </div>
      </section>

      <!-- 圖示 -->
      <section>
        <label class="require">圖示</label>
        <IconEditor />
      </section>

      <!-- 標籤 -->
      <section>
        <label>標籤</label>
        <div class="tag">
          <TagEditor />
        </div>
      </section>

      <!-- 按鈕 -->
      <div>
        <div class="btn-box">
          <btn text="取消" type="cancel" />
          <btn text="儲存" type="confirm" />
        </div>
        <button
          type="button"
          @click="isDeleteConfirmOpen = true"
        >
          <trash />
          刪除此類別
        </button>
      </div>

    </main>
    <AppHeader />
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
  import { ref } from 'vue'
  import { Trash } from '@lucide/vue'
  import AppHeader from '@/mobile/components/AppHeader.vue'
  import Breadcrumb from '@/mobile/components/Breadcrumb.vue'
  import ConfirmDialog from '@/mobile/components/ConfirmDialog.vue'
  import btn from '@/mobile/components/btn.vue'
  import IconEditor from '@/mobile/components/settings/type-edit/IconEditor.vue'
  import TagEditor from '@/mobile/components/settings/type-edit/TagEditor.vue'

  const isDeleteConfirmOpen = ref(false)

  const confirmDeleteCategory = () => {
    isDeleteConfirmOpen.value = false
  }
</script>

<style scoped lang="scss">
  .page.category-editor{
    >main{
      gap: 28px;
      @include flexbox(column, flex-start, stretch);
      >section{
        gap: 6px;
        @include flexbox(column, flex-start, flex-start);
        >label{
          color: $grey;
          @include h3();
          &.require{
            &:after{
              content: '*';
              color: $brown;
              font-size: 22px;
              display: inline-block;
              transform: translateY(-2px);
            }
          }
        }
        >div{
          width: 100%;
          margin-top: 4px;
          &.input{
            >input{
              width: 100%;
              height: 50px;
              padding: 0 4px;
              border-radius: 8px;
              border: 1px solid $stone;
              background-color: $white;
            }
          }
          &.radio{
            gap: 20px;
            @include flexbox(row, flex-start, center);
            >button{
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
          &.tag{
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
        >button{
          gap: 2px;
          color: $brown;
          padding: 4px 12px;
          border-radius: 8px;
          background-color: $oat;
          border: 1px solid $stone;
          @include flexbox(row, center, center);
          >svg{
            width: 18px;
            stroke: $brown;
          }
        }
      }
    }
  }
</style>
