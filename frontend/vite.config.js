import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  server: {
    port: 3000,  // 포트 고정
    host: true,   // 네트워크 접근 허용
    strictPort: true,  // 포트가 사용 중이면 에러 발생 (자동 변경 방지)
    open: true      // 브라우저 자동 열기
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
