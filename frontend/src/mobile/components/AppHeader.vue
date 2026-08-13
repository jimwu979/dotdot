<template>
  <header class="component appHeader">
    <section class="left">
      <NavBox v-if="showMenu" />
      <PrevPage v-else />
    </section>
    <section class="center">
      <slot name="center">
        <Title v-if="title" :text="title" />
        <MonthSelector v-else />
      </slot>
    </section>
    <section class="right">
      <button
        class="delete btn-click-effect"
        v-if="rightAction === 'delete'"
        type="button"
        @click="emit('delete')"
      >
        <Trash />
      </button>
      <button
        class="scroll btn-click-effect"
        v-else-if="rightAction === 'scroll'"
        type="button"
        :class="{ 'at-bottom': isAtBottom }"
        @click="togglePagePosition"
      >
        <ArrowDown />
      </button>
    </section>
  </header>
</template>

<script lang="ts" setup>
  import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
  import { useRoute } from 'vue-router'
  import { ArrowDown, Trash } from '@lucide/vue'
  import NavBox        from '@/mobile/components/childComponents/appHeader/NavBox.vue'
  import PrevPage      from '@/mobile/components/childComponents/appHeader/PrevPage.vue'
  import Title         from '@/mobile/components/childComponents/appHeader/Title.vue'
  import MonthSelector from '@/mobile/components/childComponents/appHeader/MonthSelector.vue'

  const route = useRoute()
  const menuRouteNames = ['index', 'statistics', 'settings', 'saving']
  const showMenu = computed(() => (
    typeof route.name === 'string' && menuRouteNames.includes(route.name)
  ))

  const props = defineProps<{
    title?: string
    rightAction?: 'scroll' | 'delete'
  }>()

  const emit = defineEmits<{
    delete: []
  }>()

  const isAtBottom = ref(false)
  let scrollAnimationFrame: number | null = null
  let documentResizeObserver: ResizeObserver | null = null

  const getMaximumScroll = () => Math.max(
    0,
    document.documentElement.scrollHeight - window.innerHeight,
  )

  const updatePagePosition = () => {
    isAtBottom.value = window.scrollY >= getMaximumScroll() - 2
  }

  const animatePageScroll = (targetPosition: number) => {
    if (scrollAnimationFrame !== null) cancelAnimationFrame(scrollAnimationFrame)

    const startPosition = window.scrollY
    const distance = targetPosition - startPosition
    const startTime = performance.now()

    const movePage = (currentTime: number) => {
      const progress = Math.min((currentTime - startTime) / 500, 1)
      const easedProgress = progress < .5
        ? 2 * progress * progress
        : 1 - ((-2 * progress + 2) ** 2) / 2

      window.scrollTo(0, startPosition + distance * easedProgress)

      if (progress < 1) {
        scrollAnimationFrame = requestAnimationFrame(movePage)
        return
      }

      scrollAnimationFrame = null
      updatePagePosition()
    }

    scrollAnimationFrame = requestAnimationFrame(movePage)
  }

  const togglePagePosition = () => {
    animatePageScroll(isAtBottom.value ? 0 : getMaximumScroll())
  }

  onMounted(() => {
    if (props.rightAction !== 'scroll') return

    updatePagePosition()
    window.addEventListener('scroll', updatePagePosition, { passive: true })
    window.addEventListener('resize', updatePagePosition)
    documentResizeObserver = new ResizeObserver(updatePagePosition)
    documentResizeObserver.observe(document.documentElement)
    documentResizeObserver.observe(document.body)
  })

  onBeforeUnmount(() => {
    if (scrollAnimationFrame !== null) cancelAnimationFrame(scrollAnimationFrame)
    window.removeEventListener('scroll', updatePagePosition)
    window.removeEventListener('resize', updatePagePosition)
    documentResizeObserver?.disconnect()
  })
</script>

<style lang="scss" scoped>
.component.appHeader {
  left: 0;
  bottom: 0;
  z-index: 1;
  width: 100%;
  position: fixed;
  height: $header_height;
  padding: 12px 12px 32px;
  background-color: $yellow;
  box-shadow: 0px 0px 8px rgba(0,0,0,.2);
  @include flexbox(row, center, center);
  >section{
    &.left{
      left: 32px;
      position: absolute;
      height: calc(100% - 44px);
    }
    &.center{
      height: 100%;
      
    }
    &.right{
      right: 32px;
      position: absolute;
      height: calc(100% - 44px);
      aspect-ratio: 1/1;
      >button{
        width: 100%;
        height: 100%;
        padding: 8px;
        aspect-ratio: 1/1;
        border-radius: 8px;
        @include flexbox(row, center, center);
        >svg{
          width: 22px;
          stroke: $black;
        }
        &.scroll{
          >svg{
            transition: transform .2s;
          }
          &.at-bottom{
            >svg{
              transform: rotate(180deg);
            }
          }
        }
      }
    }
  }
}
</style>
