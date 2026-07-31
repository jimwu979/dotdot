import { createApp } from 'vue'
import App from '@/App.vue'
import categoryIcons from '@/shared/icons/category'

const isMobile = window.matchMedia('(max-width: 767px)').matches
const routerModule = isMobile
  ? await import('@/mobile/router')
  : await import('@/desktop/router')

if (isMobile) {
  await import('@/mobile/assets/scss/main.scss')
} else {
  await import('@/desktop/assets/scss/main.scss')
}

createApp(App)
  .use(categoryIcons)
  .use(routerModule.default)
  .mount('#app')
