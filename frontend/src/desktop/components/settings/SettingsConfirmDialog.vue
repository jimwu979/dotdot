<template>
  <div
    class="component settings-confirm-dialog"
    :class="{ open }"
    role="dialog"
    aria-modal="true"
    :aria-labelledby="titleId"
    :aria-describedby="messageId"
    @click.self="emit('cancel')"
  >
    <div>
      <h2 :id="titleId">{{ title }}</h2>
      <p :id="messageId">{{ message }}</p>
      <div>
        <button
          class="btn-click-effect cancel"
          type="button"
          @click="emit('cancel')"
        >
          取消
        </button>
        <button
          class="btn-click-effect delete"
          type="button"
          @click="emit('confirm')"
        >
          確認刪除
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
withDefaults(defineProps<{
  open: boolean
  title?: string
  message: string
}>(), {
  title: '',
})

const emit = defineEmits<{
  cancel: []
  confirm: []
}>()
const titleId = 'settings-confirm-dialog-title'
const messageId = 'settings-confirm-dialog-message'
</script>

<style lang="scss" scoped>
.component.settings-confirm-dialog{
  inset: 0;
  z-index: 10;
  opacity: 0;
  padding: 24px;
  position: absolute;
  pointer-events: none;
  transition: opacity .2s;
  background-color: rgba($black,.45);
  @include flexbox(row, center, center);
  &.open{
    opacity: 1;
    pointer-events: auto;
    >div{
      opacity: 1;
      transform: scale(1);
    }
  }
  >div{
    opacity: 0;
    width: 100%;
    padding: 24px;
    max-width: 360px;
    border-radius: 16px;
    transform: scale(.95);
    background-color: $white;
    transition: opacity .2s, transform .2s;
    box-shadow: 0 8px 30px rgba($black,.18);
    >h2{
      min-height: 24px;
      font-size: 20px;
      font-weight: 600;
    }
    >p{
      color: $grey;
      margin-top: 12px;
      text-align: center;
    }
    >div{
      gap: 10px;
      margin-top: 32px;
      @include flexbox(row, flex-end, center);
      >button{
        height: 42px;
        min-width: 92px;
        padding: 0 18px;
        font-weight: 600;
        border-radius: 10px;
        &.cancel{
          border: 1px solid $stone;
        }
        &.delete{
          color: $white;
          background-color: $red;
        }
      }
    }
  }
}
</style>
