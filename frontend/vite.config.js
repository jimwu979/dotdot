import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: (source, filename) => {
          const normalizedFilename = filename.replaceAll('\\', '/')
          const device = normalizedFilename.includes('/mobile/') ? 'mobile' : 'desktop'

          return `@use "/src/shared/assets/scss/variable.scss" as *;\n@use "/src/${device}/assets/scss/variable.scss" as *;\n${source}`
        },
      },
    },
  },
  server: {
    port: 3001,
  },
})
