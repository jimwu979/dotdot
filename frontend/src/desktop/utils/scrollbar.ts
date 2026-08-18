const scrollbarTimers = new WeakMap<HTMLElement, number>()

export const initializeDesktopScrollbars = () => {
  document.addEventListener('scroll', event => {
    const target = event.target === document
      ? document.scrollingElement
      : event.target

    if (!(target instanceof HTMLElement)) return

    target.classList.add('show-scrollbar')
    window.clearTimeout(scrollbarTimers.get(target))
    scrollbarTimers.set(target, window.setTimeout(() => {
      target.classList.remove('show-scrollbar')
      scrollbarTimers.delete(target)
    }, 600))
  }, { capture: true, passive: true })
}
