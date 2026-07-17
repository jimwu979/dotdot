import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: (source, filename) => {
          const normalizedFilename = filename.replaceAll('\\', '/')
          const device = normalizedFilename.includes('/mobile/') ? 'mobile' : 'desktop'

          return `@use "/src/assets/scss/public-variable.scss" as *;\n@use "/src/assets/scss/${device}/variable.scss" as *;\n${source}`
        },
      },
    },
  },
  server: {
    port: 3001,
  },
})
