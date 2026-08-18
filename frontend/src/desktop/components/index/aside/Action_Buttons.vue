<template>
  <section class="component actionButtons">
    <button type="button" @click="emit('select', 'normal')">
      <span class="btn-click-effect"><Plus /></span>
      <b>一般記帳</b>
    </button>
    <button type="button" @click="emit('select', 'batch')">
      <span class="btn-click-effect"><ListPlus /></span>
      <b>批次記帳</b>
    </button>
    <button type="button" @click="emit('select', 'dotdot')">
      <span class="btn-click-effect"><Sparkles /></span>
      <b>點點記帳</b>
    </button>
  </section>
</template>

<script lang="ts" setup>
import { ListPlus, Plus, Sparkles } from '@lucide/vue'
import type { ActionPanelType } from '@/desktop/components/index/aside/Action_Panel.vue'

const emit = defineEmits<{
  select: [panel: Exclude<ActionPanelType, ''>]
}>()
</script>

<style lang="scss" scoped>
  .component.actionButtons{
    gap: 10px;
    @include flexbox(row, flex-start, stretch);
    >button{
      flex: 1;
      gap: 4px;
      height: 86px;
      transition: .2s;
      @include flexbox(column, center, center);
      &:hover{
        >span{
          transform: scale(1.2);
          &:before{
            opacity: 1;
          }
        }
      }
      &:active{
        >span:after{
          opacity: 1;
          animation: btn-click-effect .3s ease-out forwards;
          transition: opacity 0s;
        }
      }
      >span{
        width: 40px;
        transition: .2s;
        aspect-ratio: 1/1;
        border-radius: 50%;
        background-color: $yellow;
        @include flexbox(row, center, center);
        >svg{
          width: 20px;
        }
      }
      >b{
        font-size: 12px;
        font-weight: 600;
      }
    }
  }
</style>
