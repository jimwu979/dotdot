<template>
  <Teleport :to="teleportTo">
    <div
      class="component confirm-dialog-backdrop"
      :class="{ open, contained }"
      @click.self="emit('cancel')"
    >
      <div class="confirm-dialog">
        <h2>{{ title }}</h2>
        <p>{{ message }}</p>
        <div class="dialog-actions">
          <Btn
            v-if="showCancel"
            :text="cancelText"
            type="cancel"
            @click="emit('cancel')"
          />
          <Btn
            :text="confirmText"
            :type="confirmType"
            @click="emit('confirm')"
          />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import Btn from '@/mobile/components/btn.vue'

withDefaults(defineProps<{
  open: boolean
  title?: string
  message?: string
  cancelText?: string
  confirmText?: string
  confirmType?: 'confirm' | 'delete'
  showCancel?: boolean
  teleportTo?: string
  contained?: boolean
}>(), {
  cancelText: '取消',
  confirmText: '確定',
  confirmType: 'confirm',
  showCancel: true,
  teleportTo: 'body',
  contained: false,
})

const emit = defineEmits<{
  cancel: []
  confirm: []
}>()
</script>

<style scoped lang="scss">
.component.confirm-dialog-backdrop{
  inset: 0;
  opacity: 0;
  z-index: 40;
  padding: 20px;
  position: fixed;
  pointer-events: none;
  transition: opacity .2s;
  @include flexbox(row, center, center);
  background-color: rgba(42, 36, 24, .45);
  &.contained{
    position: absolute;
  }
  &.open{
    opacity: 1;
    pointer-events: auto;
    >.confirm-dialog{
      opacity: 1;
      transform: scale(1);
      pointer-events: auto;
    }
  }
  >.confirm-dialog{
    opacity: 0;
    width: 100%;
    padding: 24px;
    max-width: 320px;
    border-radius: 16px;
    pointer-events: none;
    transform: scale(.95);
    background-color: $white;
    transition: opacity .2s, transform .2s;
    box-shadow: 0 8px 30px rgba(42, 36, 24, .18);
    >h2{
      @include h2();
      min-height: 22px;
    }
    >p{
      color: $grey;
      @include h3();
      margin-top: 12px;
      text-align: center;
    }
    >.dialog-actions{
      gap: 8px;
      flex-wrap: wrap;
      margin-top: 40px;
      @include flexbox(row, flex-end, center);
    }
  }
}
</style>
