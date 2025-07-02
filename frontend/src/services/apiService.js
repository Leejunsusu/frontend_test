// src/services/apiService.js - 확장 가능한 API 서비스
const API_BASE_URL = 'http://localhost:8080/api'

export const markerAPI = {
    // 🔍 모든 마커 조회
    async getAllMarkers() {
        try {
            console.log('📡 [API] 백엔드에서 마커 목록 요청...')

            const response = await fetch(`${API_BASE_URL}/markers`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                mode: 'cors',
                credentials: 'omit'
            })

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`)
            }

            const markers = await response.json()
            console.log('✅ [API] 마커 목록 받음:', markers.length + '개')
            return markers

        } catch (error) {
            console.error('❌ [API] 마커 조회 실패:', error)

            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                console.error('🌐 [API] 네트워크 연결 오류 - 백엔드 서버 확인 필요')
                console.error('📌 [API] 확인사항:')
                console.error('   1. IntelliJ에서 Spring Boot 앱이 실행 중인가?')
                console.error('   2. http://localhost:8080 에 접속되는가?')
                console.error('   3. 백엔드 CORS 설정이 올바른가?')
            }

            throw error
        }
    },

    // 🔧 서버 연결 테스트
    async testConnection() {
        try {
            console.log('🔧 [API] 백엔드 서버 연결 테스트...')

            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 5000)

            const response = await fetch(`${API_BASE_URL}/markers/test`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                signal: controller.signal,
                mode: 'cors',
                credentials: 'omit'
            })

            clearTimeout(timeoutId)

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`)
            }

            const message = await response.text()
            console.log('✅ [API] 서버 연결 성공:', message)
            return true

        } catch (error) {
            if (error.name === 'AbortError') {
                console.error('⏰ [API] 서버 연결 타임아웃 (5초)')
            } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
                console.error('🌐 [API] 네트워크 연결 오류')
            } else {
                console.error('❌ [API] 서버 연결 실패:', error)
            }
            return false
        }
    }
}

// 🚀 향후 확장용 API들 (현재는 주석 처리)
export const extendedAPI = {

    // ➕ 마커 생성 (향후 구현용)
    // async createMarker(markerData) {
    //     try {
    //         console.log('📡 [API] 새 마커 생성 요청...', markerData)
    //
    //         const response = await fetch(`${API_BASE_URL}/markers`, {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //             body: JSON.stringify(markerData),
    //             mode: 'cors',
    //             credentials: 'omit'
    //         })
    //
    //         if (!response.ok) {
    //             throw new Error(`HTTP ${response.status}`)
    //         }
    //
    //         const savedMarker = await response.json()
    //         console.log('✅ [API] 마커 생성 완료:', savedMarker)
    //         return savedMarker
    //
    //     } catch (error) {
    //         console.error('❌ [API] 마커 생성 실패:', error)
    //         throw error
    //     }
    // },

    // 🗑️ 마커 삭제 (향후 구현용)
    // async deleteMarker(markerId) {
    //     try {
    //         console.log('📡 [API] 마커 삭제 요청:', markerId)
    //
    //         const response = await fetch(`${API_BASE_URL}/markers/${markerId}`, {
    //             method: 'DELETE',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //             mode: 'cors',
    //             credentials: 'omit'
    //         })
    //
    //         if (!response.ok) {
    //             throw new Error(`HTTP ${response.status}`)
    //         }
    //
    //         console.log('✅ [API] 마커 삭제 완료:', markerId)
    //         return true
    //
    //     } catch (error) {
    //         console.error('❌ [API] 마커 삭제 실패:', error)
    //         throw error
    //     }
    // },

    // 🔍 마커 검색 (향후 구현용)
    // async searchMarkers(query) {
    //     try {
    //         console.log('🔍 [API] 마커 검색:', query)
    //
    //         const response = await fetch(`${API_BASE_URL}/markers/search?q=${encodeURIComponent(query)}`, {
    //             method: 'GET',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //             mode: 'cors',
    //             credentials: 'omit'
    //         })
    //
    //         if (!response.ok) {
    //             throw new Error(`HTTP ${response.status}`)
    //         }
    //
    //         const results = await response.json()
    //         console.log('✅ [API] 검색 결과:', results.length + '개')
    //         return results
    //
    //     } catch (error) {
    //         console.error('❌ [API] 검색 실패:', error)
    //         throw error
    //     }
    // },

    // 🏷️ 카테고리별 마커 조회 (향후 구현용)
    // async getMarkersByCategory(category) {
    //     try {
    //         console.log('🏷️ [API] 카테고리별 마커 조회:', category)
    //
    //         const response = await fetch(`${API_BASE_URL}/markers/category/${category}`, {
    //             method: 'GET',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //             mode: 'cors',
    //             credentials: 'omit'
    //         })
    //
    //         if (!response.ok) {
    //             throw new Error(`HTTP ${response.status}`)
    //         }
    //
    //         const markers = await response.json()
    //         console.log('✅ [API] 카테고리 마커:', markers.length + '개')
    //         return markers
    //
    //     } catch (error) {
    //         console.error('❌ [API] 카테고리 조회 실패:', error)
    //         throw error
    //     }
    // },

    // 📊 마커 통계 (향후 구현용)
    // async getMarkerStatistics() {
    //     try {
    //         console.log('📊 [API] 마커 통계 조회')
    //
    //         const response = await fetch(`${API_BASE_URL}/markers/statistics`, {
    //             method: 'GET',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //             mode: 'cors',
    //             credentials: 'omit'
    //         })
    //
    //         if (!response.ok) {
    //             throw new Error(`HTTP ${response.status}`)
    //         }
    //
    //         const stats = await response.json()
    //         console.log('✅ [API] 통계 정보:', stats)
    //         return stats
    //
    //     } catch (error) {
    //         console.error('❌ [API] 통계 조회 실패:', error)
    //         throw error
    //     }
    // },

    // 🌍 위치 검색 (향후 구현용)
    // async searchLocation(query) {
    //     try {
    //         console.log('🌍 [API] 위치 검색:', query)
    //
    //         // 네이버 지도 검색 API 또는 자체 검색 API 호출
    //         const response = await fetch(`${API_BASE_URL}/search/location?q=${encodeURIComponent(query)}`, {
    //             method: 'GET',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //             mode: 'cors',
    //             credentials: 'omit'
    //         })
    //
    //         if (!response.ok) {
    //             throw new Error(`HTTP ${response.status}`)
    //         }
    //
    //         const locations = await response.json()
    //         console.log('✅ [API] 위치 검색 결과:', locations.length + '개')
    //         return locations
    //
    //     } catch (error) {
    //         console.error('❌ [API] 위치 검색 실패:', error)
    //         throw error
    //     }
    // }
}

// 📱 사용자 설정 API (향후 구현용)
export const userAPI = {
    // async getUserPreferences() { ... },
    // async saveUserPreferences(preferences) { ... },
    // async getUserHistory() { ... },
    // async saveSearchHistory(query) { ... }
}

// 🔄 실시간 업데이트 API (향후 구현용)
export const realtimeAPI = {
    // WebSocket 연결 관리
    // async connectWebSocket() { ... },
    // async subscribeToMarkerUpdates() { ... },
    // async unsubscribeFromUpdates() { ... }
}