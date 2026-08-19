import {
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  type CSSProperties,
  type Ref,
} from 'vue'

export const useOverlayScrollbar = (scrollElement: Ref<HTMLElement | null>) => {
  const isScrollbarVisible = ref(false)
  const scrollbarStyle = ref<CSSProperties>({})
  let hideTimer: number | undefined
  let resizeObserver: ResizeObserver | undefined

  const updateScrollbar = () => {
    const element = scrollElement.value

    if (!element || element.scrollHeight <= element.clientHeight) {
      isScrollbarVisible.value = false
      scrollbarStyle.value = {}
      return false
    }

    const thumbHeight = Math.max(28, element.clientHeight ** 2 / element.scrollHeight)
    const availableTrack = element.clientHeight - thumbHeight
    const availableScroll = element.scrollHeight - element.clientHeight
    const thumbTop = availableScroll > 0
      ? (element.scrollTop / availableScroll) * availableTrack
      : 0

    scrollbarStyle.value = {
      height: `${thumbHeight}px`,
      transform: `translateY(${thumbTop}px)`,
    }

    return true
  }

  const handleScroll = () => {
    if (!updateScrollbar()) return

    isScrollbarVisible.value = true
    window.clearTimeout(hideTimer)
    hideTimer = window.setTimeout(() => {
      isScrollbarVisible.value = false
    }, 600)
  }

  onMounted(async () => {
    await nextTick()
    scrollElement.value?.addEventListener('scroll', handleScroll, { passive: true })
    resizeObserver = new ResizeObserver(updateScrollbar)
    if (scrollElement.value) resizeObserver.observe(scrollElement.value)
    updateScrollbar()
  })

  onBeforeUnmount(() => {
    scrollElement.value?.removeEventListener('scroll', handleScroll)
    resizeObserver?.disconnect()
    window.clearTimeout(hideTimer)
  })

  return {
    isScrollbarVisible,
    scrollbarStyle,
    updateScrollbar,
  }
}
