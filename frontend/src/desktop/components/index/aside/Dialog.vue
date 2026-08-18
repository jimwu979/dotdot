<template>
  <div
    class="component aside-dialog-backdrop"
    :class="{ open }"
    @click.self="emit('cancel')"
  >
    <div class="aside-dialog">
      <h2>{{ title }}</h2>
      <p>{{ message }}</p>
      <div class="actions">
        <button
          v-if="showCancel"
          class="cancel btn-click-effect"
          type="button"
          @click="emit('cancel')"
        >
          {{ cancelText }}
        </button>
        <button
          class="btn-click-effect"
          :class="confirmType"
          type="button"
          @click="emit('confirm')"
        >
          {{ confirmText }}
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
  cancelText?: string
  confirmText?: string
  confirmType?: 'confirm' | 'delete'
  showCancel?: boolean
}>(), {
  title: '',
  cancelText: '取消',
  confirmText: '確定',
  confirmType: 'confirm',
  showCancel: true,
})

const emit = defineEmits<{
  cancel: []
  confirm: []
}>()
</script>

<style lang="scss" scoped>
  .component.aside-dialog-backdrop{
    inset: 0;
    z-index: 40;
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
      >.aside-dialog{
        opacity: 1;
        transform: scale(1);
        pointer-events: auto;
      }
    }
    >.aside-dialog{
      opacity: 0;
      width: 100%;
      padding: 24px;
      max-width: 360px;
      border-radius: 16px;
      pointer-events: none;
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
      >.actions{
        gap: 10px;
        margin-top: 32px;
        @include flexbox(row, flex-end, center);
        >button{
          min-width: 92px;
          height: 42px;
          padding: 0 18px;
          font-weight: 600;
          border-radius: 10px;
          &.cancel{
            border: 1px solid $stone;
          }
          &.confirm{
            background-color: $yellow;
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
