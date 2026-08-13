import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from '@/App.vue'
import categoryIcons from '@/shared/icons/category'
import { useUiStore } from '@/shared/stores/ui'

const pinia = createPinia()
const uiStore = useUiStore(pinia)
const isMobile = window.matchMedia('(max-width: 767px)').matches
const routerModule = isMobile
  ? await import('@/mobile/router')
  : await import('@/desktop/router')

if (isMobile) {
  await import('@/mobile/assets/scss/main.scss')

  const pressSelector = '.btn-click-effect'
  let pressedElement: HTMLElement | null = null

  document.addEventListener('touchstart', event => {
    if (!(event.target instanceof Element)) return

    pressedElement = event.target.closest<HTMLElement>(pressSelector)
    pressedElement?.classList.add('is-pressed')
  }, { capture: true, passive: true })

  const clearPressedElement = () => {
    pressedElement?.classList.remove('is-pressed')
    pressedElement = null
  }

  document.addEventListener('touchend', clearPressedElement, { capture: true, passive: true })
  document.addEventListener('touchcancel', clearPressedElement, { capture: true, passive: true })
} else {
  await import('@/desktop/assets/scss/main.scss')
}

document.body.addEventListener('click', () => {
  uiStore.increaseClickTimes()
})

createApp(App)
  .use(pinia)
  .use(categoryIcons)
  .use(routerModule.default)
  .mount('#app')
