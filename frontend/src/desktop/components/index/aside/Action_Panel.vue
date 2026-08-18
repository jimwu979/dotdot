<template>
  <aside class="component action-panel" :class="{ open: panel !== '' }">
    <header>
      <button class="btn-click-effect cancel" type="button" @click="emit('close')">取消</button>
      <h2>{{ panelTitle }}</h2>
      <a v-if="panel === 'dotdot'" class="btn-click-effect edit" href="#" @click.prevent>編輯</a>
      <span v-else />
    </header>
    <Normal v-if="panel === 'normal'" @close="emit('close')" />
    <Batch v-else-if="panel === 'batch'" @close="emit('close')" />
    <Dotdot v-else-if="panel === 'dotdot'" @close="emit('close')" />
  </aside>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import Batch from '@/desktop/components/index/aside/panel/Batch.vue'
import Dotdot from '@/desktop/components/index/aside/panel/Dotdot.vue'
import Normal from '@/desktop/components/index/aside/panel/Normal.vue'

export type ActionPanelType = 'normal' | 'batch' | 'dotdot' | ''

const props = defineProps<{
  panel: ActionPanelType
}>()

const emit = defineEmits<{
  close: []
}>()

const panelTitle = computed(() => ({
  normal: '一般記帳',
  batch: '批次記帳',
  dotdot: '點點記帳',
  '': '',
})[props.panel])
</script>

<style lang="scss" scoped>
  .component.action-panel{
    top: 0;
    z-index: 3;
    right: -420px;
    width: 420px;
    height: 100%;
    position: absolute;
    transition: transform .3s ease;
    border-left: 1px solid $oat;
    background-color: $background;
    box-shadow: -16px 0 36px rgba($black,.12);
    @include flexbox(column, flex-start, stretch);
    &.open{
      transform: translateX(-420px);
    }
    >header{
      height: 62px;
      flex: 0 0 62px;
      padding: 0 18px;
      border-bottom: 1px solid $oat;
      display: grid;
      align-items: center;
      grid-template-columns: 72px 1fr 72px;
      >.cancel,
      >.edit{
        height: 36px;
        color: $mustard;
        font-weight: 600;
        border-radius: 9px;
        @include flexbox(row, center, center);
      }
      >h2{
        text-align: center;
        font-size: 18px;
        font-weight: 600;
      }
    }
  }
</style>
