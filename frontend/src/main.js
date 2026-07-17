import { createApp } from 'vue'
import App from './App.vue'

const isMobile = window.matchMedia('(max-width: 767px)').matches
const routerModule = isMobile
  ? await import('./router/mobile')
  : await import('./router/desktop')

if (isMobile) {
  await import('./assets/scss/mobile/main.scss')
} else {
  await import('./assets/scss/desktop/main.scss')
}

createApp(App).use(routerModule.default).mount('#app')
