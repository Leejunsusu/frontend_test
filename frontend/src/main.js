// src/main.js - Pinia 설정 및 UI Store 추가
import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

// ✅ Pinia 스토어 생성
const pinia = createPinia()

// ✅ Vue 앱 생성 및 Pinia 연결
const app = createApp(App)

app.use(pinia)

// ✅ 전역 에러 핸들러
app.config.errorHandler = (err, vm, info) => {
    console.error('Vue 전역 에러:', err)
    console.error('컴포넌트:', vm)
    console.error('정보:', info)

    // UI Store가 있으면 알림 표시
    try {
        const { useUIStore } = require('./stores/uiStore.js')
        const uiStore = useUIStore()
        uiStore.addNotification({
            message: '애플리케이션 오류가 발생했습니다',
            type: 'error',
            duration: 5000
        })
    } catch (e) {
        // UI Store 로드 실패시 콘솔에만 표시
        console.error('UI Store 로드 실패:', e)
    }
}

app.mount('#app')

console.log('🚀 DropIt 애플리케이션 초기화 완료')