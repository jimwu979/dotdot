import { createApp } from 'vue'
import App from '@/App.vue'

const isMobile = window.matchMedia('(max-width: 767px)').matches
const routerModule = isMobile
  ? await import('@/mobile/router')
  : await import('@/desktop/router')

if (isMobile) {
  await import('@/mobile/assets/scss/main.scss')
} else {
  await import('@/desktop/assets/scss/main.scss')
}

createApp(App).use(routerModule.default).mount('#app')
