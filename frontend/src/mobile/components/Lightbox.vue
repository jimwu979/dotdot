<template>
  <div
    class="component lightbox"
    :class="{'open': open}"
    @click.self="emit('close')"
  >
    <section>
      <div class="top-bar">
        <h2
          v-if="title"
          v-text="title"
        />
        <button
          class="btn-click-effect"
          type="button"
          @click="emit('close')"
        >
          <X />
        </button>
      </div>
      <div class="content">
        <slot />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, watch } from 'vue'
import { X } from '@lucide/vue'

const props = defineProps<{
  open: boolean
  title?: string
}>()

const emit = defineEmits<{
  close: []
}>()

let isScrollLocked = false
let bodyOverflow = ''
let htmlOverflow = ''

const lockBackgroundScroll = () => {
  if (isScrollLocked) return

  bodyOverflow = document.body.style.overflow
  htmlOverflow = document.documentElement.style.overflow
  document.body.style.overflow = 'hidden'
  document.documentElement.style.overflow = 'hidden'
  isScrollLocked = true
}

const unlockBackgroundScroll = () => {
  if (!isScrollLocked) return

  document.body.style.overflow = bodyOverflow
  document.documentElement.style.overflow = htmlOverflow
  isScrollLocked = false
}

watch(
  () => props.open,
  open => {
    if (open) {
      lockBackgroundScroll()
      return
    }

    unlockBackgroundScroll()
  },
  { immediate: true },
)

onBeforeUnmount(unlockBackgroundScroll)
</script>

<style scoped lang="scss">
.component.lightbox{
  top: 0;
  left: 0;
  z-index: 1;
  opacity: 0;
  width: 100%;
  height: 100%;
  transition: .2s;
  position: fixed;
  visibility: hidden;
  pointer-events: none;
  overscroll-behavior: none;
  padding-bottom: $header_height;
  @include flexbox(row, center, center);
  background-color: rgba($color: #000, $alpha: .4);
  >section{
    transition: .2s;
    overflow: hidden;
    border-radius: 12px;
    transform: scale(.95);
    border: 1px solid $oat;
    width: calc(100% - 24px);
    background-color: $background;
    @include flexbox(column, flex-start, flex-end);
    max-height: calc(100dvh - $header_height - 24px);
    >.top-bar{
      width: 100%;
      padding: 12px;
      @include flexbox(row, space-between, center);
      >h2{
        @include h2();
        font-weight: 600;
      }
      >button{
        width: 40px;
        margin-left: auto;
        aspect-ratio: 1/1;
        border-radius: 50%;
        background-color: $oat;
        @include flexbox(row, center, center);
        >svg{
          width: 32px;
          stroke: $black;
        }
      }
    }
    >.content{
      width: 100%;
      min-height: 0;
      overflow: hidden;
      position: relative;
      &:before{
        left: 0;
        top: -20px;
        width: 100%;
        content: '';
        height: 20px;
        position: absolute;
        border-radius: 50%;
        display: inline-block;
        box-shadow: 0px 0px 14px rgba($color: $black, $alpha: .1);
      }
    }
  }
  &.open{
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
    >section{
      transform: scale(1);
    }
  }
}
</style>
