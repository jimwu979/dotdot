<template>
  <div class="component date-modal" :class="{ open }" @click.self="emit('cancel')">
    <div class="content">
      <DatePicker v-model="draftDate" />
      <div class="actions">
        <button class="cancel btn-click-effect" type="button" @click="emit('cancel')">取消</button>
        <button class="confirm btn-click-effect" type="button" @click="emit('confirm', draftDate)">確定</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import DatePicker from '@/desktop/components/index/aside/panel/DatePicker.vue'

const props = defineProps<{
  open: boolean
  selectedDate: string
}>()

const emit = defineEmits<{
  cancel: []
  confirm: [date: string]
}>()

const draftDate = ref(props.selectedDate)

watch(() => props.open, (open) => {
  if (open) draftDate.value = props.selectedDate
})
</script>

<style lang="scss" scoped>
  .component.date-modal{
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
      padding: 12px;
      border-radius: 18px;
      pointer-events: none;
      transform: scale(.94);
      background-color: $background;
      transition: opacity .2s, transform .2s;
      >.actions{
        gap: 10px;
        margin-top: 10px;
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
