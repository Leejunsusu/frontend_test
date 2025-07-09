// src/services/apiService.js - 마커 관련 API 서비스 (수정 버전)
import { createAuthenticatedRequest } from './authService.js'
// ✅ authAPI import 추가
import { authAPI } from './authService.js'

const API_BASE_URL = 'http://localhost:8080/api'

// 🔧 공통 응답 처리 함수
const handleApiResponse = async (response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `HTTP ${response.status}` }))
        throw new Error(errorData.message || `API 오류: HTTP ${response.status}`)
    }

    const data = await response.json()

    // ApiResponse 형태인 경우 data 필드 추출
    if (data && typeof data.success === 'boolean') {
        if (!data.success) {
            throw new Error(data.message || data.error || 'API 오류가 발생했습니다.')
        }
        return data.data || data
    }

    return data
}

export const markerAPI = {
    // 📍 모든 마커 조회 (공개)
    async getAllMarkers() {
        try {
            console.log('📡 [Marker API] 모든 마커 조회 요청...')

            const response = await fetch(`${API_BASE_URL}/markers`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                mode: 'cors',
                credentials: 'omit'
            })

            const markers = await handleApiResponse(response)
            console.log(`✅ [Marker API] 마커 ${markers.length || 0}개 조회 완료`)
            return markers || []

        } catch (error) {
            console.error('❌ [Marker API] 마커 조회 실패:', error)

            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                console.error('🌐 [Marker API] 네트워크 연결 오류 - 백엔드 서버 확인 필요')
                console.error('📌 [Marker API] 확인사항:')
                console.error('   1. IntelliJ에서 Spring Boot 앱이 실행 중인가?')
                console.error('   2. http://localhost:8080 에 접속되는가?')
                console.error('   3. 백엔드 CORS 설정이 올바른가?')
                throw new Error('서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.')
            }

            throw error
        }
    },

    // 🔒 마커 생성 (인증 필요)
    async createMarker(markerData) {
        try {
            console.log('📡 [Marker API] 마커 생성 요청...', markerData)

            const response = await createAuthenticatedRequest(`${API_BASE_URL}/markers`, {
                method: 'POST',
                body: JSON.stringify({
                    latitude: parseFloat(markerData.latitude),
                    longitude: parseFloat(markerData.longitude),
                    title: markerData.title || '',
                    description: markerData.description || '',
                    category: markerData.category || 'etc'
                })
            })

            const newMarker = await handleApiResponse(response)
            console.log('✅ [Marker API] 마커 생성 성공:', newMarker.id)
            return newMarker

        } catch (error) {
            console.error('❌ [Marker API] 마커 생성 실패:', error)
            throw error
        }
    },

    // 📍 특정 마커 조회 (공개)
    async getMarkerById(markerId) {
        try {
            console.log('📡 [Marker API] 마커 상세 조회:', markerId)

            const response = await fetch(`${API_BASE_URL}/markers/${markerId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                mode: 'cors',
                credentials: 'omit'
            })

            const marker = await handleApiResponse(response)
            console.log('✅ [Marker API] 마커 상세 조회 완료')
            return marker

        } catch (error) {
            console.error('❌ [Marker API] 마커 조회 실패:', error)
            throw error
        }
    },

    // 🔒 마커 수정 (권한 확인)
    async updateMarker(markerId, markerData) {
        try {
            console.log('📡 [Marker API] 마커 수정 요청:', markerId)

            const response = await createAuthenticatedRequest(`${API_BASE_URL}/markers/${markerId}`, {
                method: 'PUT',
                body: JSON.stringify({
                    latitude: parseFloat(markerData.latitude),
                    longitude: parseFloat(markerData.longitude),
                    title: markerData.title || '',
                    description: markerData.description || '',
                    category: markerData.category || 'etc'
                })
            })

            const updatedMarker = await handleApiResponse(response)
            console.log('✅ [Marker API] 마커 수정 성공')
            return updatedMarker

        } catch (error) {
            console.error('❌ [Marker API] 마커 수정 실패:', error)
            throw error
        }
    },

    // 🔒 마커 삭제 (권한 확인)
    async deleteMarker(markerId) {
        try {
            console.log('📡 [Marker API] 마커 삭제 요청:', markerId)

            const response = await createAuthenticatedRequest(`${API_BASE_URL}/markers/${markerId}`, {
                method: 'DELETE'
            })

            await handleApiResponse(response)
            console.log('✅ [Marker API] 마커 삭제 성공')
            return true

        } catch (error) {
            console.error('❌ [Marker API] 마커 삭제 실패:', error)
            throw error
        }
    },

    // 🔒 내 마커 조회 (인증 필요)
    async getMyMarkers() {
        try {
            console.log('📡 [Marker API] 내 마커 조회 요청...')

            const response = await createAuthenticatedRequest(`${API_BASE_URL}/markers/my`, {
                method: 'GET'
            })

            const markers = await handleApiResponse(response)
            console.log(`✅ [Marker API] 내 마커 ${markers.length || 0}개 조회 완료`)
            return markers || []

        } catch (error) {
            console.error('❌ [Marker API] 내 마커 조회 실패:', error)
            throw error
        }
    },

    // 🔍 카테고리별 마커 조회 (공개)
    async getMarkersByCategory(category) {
        try {
            console.log('📡 [Marker API] 카테고리별 마커 조회:', category)

            const response = await fetch(`${API_BASE_URL}/markers/category/${encodeURIComponent(category)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                mode: 'cors',
                credentials: 'omit'
            })

            const markers = await handleApiResponse(response)
            console.log(`✅ [Marker API] 카테고리 '${category}' 마커 ${markers.length || 0}개 조회 완료`)
            return markers || []

        } catch (error) {
            console.error('❌ [Marker API] 카테고리별 마커 조회 실패:', error)
            throw error
        }
    },

    // 🔍 키워드 검색 (공개)
    async searchMarkers(keyword) {
        try {
            console.log('📡 [Marker API] 마커 검색:', keyword)

            const response = await fetch(`${API_BASE_URL}/markers/search?keyword=${encodeURIComponent(keyword)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                mode: 'cors',
                credentials: 'omit'
            })

            const markers = await handleApiResponse(response)
            console.log(`✅ [Marker API] 검색 결과 ${markers.length || 0}개`)
            return markers || []

        } catch (error) {
            console.error('❌ [Marker API] 마커 검색 실패:', error)
            throw error
        }
    },

    // 🔍 위치 기반 마커 검색 (공개)
    async getMarkersInArea(minLat, maxLat, minLng, maxLng) {
        try {
            console.log('📡 [Marker API] 영역 내 마커 검색...')

            const params = new URLSearchParams({
                minLat: minLat.toString(),
                maxLat: maxLat.toString(),
                minLng: minLng.toString(),
                maxLng: maxLng.toString()
            })

            const response = await fetch(`${API_BASE_URL}/markers/area?${params}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                mode: 'cors',
                credentials: 'omit'
            })

            const markers = await handleApiResponse(response)
            console.log(`✅ [Marker API] 영역 내 마커 ${markers.length || 0}개 조회 완료`)
            return markers || []

        } catch (error) {
            console.error('❌ [Marker API] 영역 내 마커 검색 실패:', error)
            throw error
        }
    },

    // 🔍 반경 내 마커 검색 (공개)
    async getMarkersNearby(lat, lng, radius = 1.0) {
        try {
            console.log('📡 [Marker API] 주변 마커 검색:', { lat, lng, radius })

            const params = new URLSearchParams({
                lat: lat.toString(),
                lng: lng.toString(),
                radius: radius.toString()
            })

            const response = await fetch(`${API_BASE_URL}/markers/nearby?${params}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                mode: 'cors',
                credentials: 'omit'
            })

            const markers = await handleApiResponse(response)
            console.log(`✅ [Marker API] 반경 ${radius}km 내 마커 ${markers.length || 0}개 조회 완료`)
            return markers || []

        } catch (error) {
            console.error('❌ [Marker API] 주변 마커 검색 실패:', error)
            throw error
        }
    },

    // 📄 페이징된 마커 조회 (공개)
    async getMarkersWithPaging(page = 0, size = 10, sortBy = 'createdAt', sortDir = 'desc') {
        try {
            console.log('📡 [Marker API] 페이징된 마커 조회...')

            const params = new URLSearchParams({
                page: page.toString(),
                size: size.toString(),
                sortBy,
                sortDir
            })

            const response = await fetch(`${API_BASE_URL}/markers/paged?${params}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                mode: 'cors',
                credentials: 'omit'
            })

            const pagedResponse = await handleApiResponse(response)
            console.log('✅ [Marker API] 페이징된 마커 조회 완료')
            return pagedResponse

        } catch (error) {
            console.error('❌ [Marker API] 페이징된 마커 조회 실패:', error)
            throw error
        }
    },

    // 🔒 내 마커 페이징 조회 (인증 필요)
    async getMyMarkersWithPaging(page = 0, size = 10, sortBy = 'createdAt', sortDir = 'desc') {
        try {
            console.log('📡 [Marker API] 내 마커 페이징 조회...')

            const params = new URLSearchParams({
                page: page.toString(),
                size: size.toString(),
                sortBy,
                sortDir
            })

            const response = await createAuthenticatedRequest(`${API_BASE_URL}/markers/my/paged?${params}`, {
                method: 'GET'
            })

            const pagedResponse = await handleApiResponse(response)
            console.log('✅ [Marker API] 내 마커 페이징 조회 완료')
            return pagedResponse

        } catch (error) {
            console.error('❌ [Marker API] 내 마커 페이징 조회 실패:', error)
            throw error
        }
    },

    // 🧪 서버 연결 테스트
    async testConnection() {
        try {
            console.log('🔧 [Marker API] 백엔드 서버 연결 테스트...')

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

            const result = await handleApiResponse(response)
            console.log('✅ [Marker API] 서버 연결 성공:', result)
            return true

        } catch (error) {
            if (error.name === 'AbortError') {
                console.error('⏰ [Marker API] 서버 연결 타임아웃 (5초)')
            } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
                console.error('🌐 [Marker API] 네트워크 연결 오류')
            } else {
                console.error('❌ [Marker API] 서버 연결 실패:', error)
            }
            return false
        }
    }
}

// 🏠 홈페이지 및 기타 API
export const generalAPI = {
    // 🏠 서버 홈페이지 접근 테스트
    async testHomePage() {
        try {
            console.log('🏠 [General API] 홈페이지 연결 테스트...')

            const response = await fetch('http://localhost:8080/', {
                method: 'GET',
                mode: 'cors',
                credentials: 'omit'
            })

            if (response.ok) {
                console.log('✅ [General API] 홈페이지 연결 성공')
                return true
            } else {
                console.error('❌ [General API] 홈페이지 연결 실패:', response.status)
                return false
            }

        } catch (error) {
            console.error('❌ [General API] 홈페이지 연결 실패:', error)
            return false
        }
    }
}

// 🔧 통합 연결 테스트 함수 - 수정된 버전
export const testAllConnections = async () => {
    console.log('🧪 [API Test] 전체 연결 테스트 시작...')

    const results = {
        homepage: await generalAPI.testHomePage(),
        markerAPI: await markerAPI.testConnection(),
        // ✅ authAPI 연결 테스트 추가 (단순 버전)
        authAPI: await testAuthConnection()
    }

    console.log('📊 [API Test] 연결 테스트 결과:', results)

    const allPassed = Object.values(results).every(result => result === true)

    if (allPassed) {
        console.log('✅ [API Test] 모든 연결 테스트 통과!')
    } else {
        console.error('❌ [API Test] 일부 연결 테스트 실패')
        console.error('📌 [API Test] 실패한 서비스들을 확인하세요:')
        Object.entries(results).forEach(([service, passed]) => {
            if (!passed) {
                console.error(`   - ${service}: 실패`)
            }
        })
    }

    return results
}

// ✅ authAPI 연결 테스트 함수 (안전한 버전)
const testAuthConnection = async () => {
    try {
        console.log('🔧 [Auth API] 백엔드 연결 테스트...')

        // authAPI가 정의되어 있으면 사용, 없으면 직접 테스트
        if (typeof authAPI !== 'undefined' && authAPI.testConnection) {
            return await authAPI.testConnection()
        } else {
            // authAPI가 없으면 직접 간단한 연결 테스트
            const response = await fetch(`${API_BASE_URL}/auth/check-email?email=test@test.com`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                mode: 'cors'
            })

            if (response.ok || response.status === 400) {
                // 400도 정상적인 응답 (잘못된 이메일 형식이지만 서버는 동작)
                console.log('✅ [Auth API] 백엔드 연결 성공 (직접 테스트)')
                return true
            } else {
                console.error('❌ [Auth API] 백엔드 연결 실패:', response.status)
                return false
            }
        }
    } catch (error) {
        console.error('❌ [Auth API] 백엔드 연결 실패:', error)
        return false
    }
}

// 🔄 기존 컴포넌트와의 호환성을 위한 export (CollectionSidebar.vue에서 사용)
export const collectionAPI = {
    // 의류수거함 목록 조회 (마커 데이터를 의류수거함 형태로 변환)
    async getCollections() {
        try {
            const markers = await markerAPI.getAllMarkers()

            // 마커 데이터를 의류수거함 형태로 변환
            const collections = markers.map(marker => ({
                id: marker.id,
                address: marker.title || '제목 없음',
                detailAddress: marker.description || '설명 없음',
                distance: '계산 중...', // TODO: 실제 거리 계산 로직 추가
                category: marker.category || 'etc',
                latitude: marker.latitude,
                longitude: marker.longitude,
                isBookmarked: false, // TODO: 북마크 상태 관리
                isFavorite: false,   // TODO: 즐겨찾기 상태 관리
                rating: null,        // TODO: 평점 시스템 추가
                createdAt: marker.createdAt,
                createdBy: marker.createdByEmail
            }))

            return collections
        } catch (error) {
            console.error('❌ [Collection API] 의류수거함 목록 조회 실패:', error)
            return []
        }
    },

    // 의류수거함 북마크 토글
    async toggleBookmark(collectionId) {
        // TODO: 실제 북마크 API 연동
        console.log('📌 [Collection API] 북마크 토글:', collectionId)
        return true
    },

    // 의류수거함 새로고침
    async refreshCollections() {
        return await this.getCollections()
    }
}