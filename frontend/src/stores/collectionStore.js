// stores/collectionStore.js - 의류수거함 관련 상태 관리 (완전한 수정 버전)
import { defineStore } from 'pinia'
import { collectionAPI } from '../services/apiService.js'

export const useCollectionStore = defineStore('collection', {
    state: () => ({
        // 📦 의류수거함 기본 데이터
        collections: [],
        selectedCollection: null,

        // 🔄 로딩 상태
        isLoading: false,
        isRefreshing: false,

        // ✅ 에러 상태 추가
        error: null,

        // 🔍 필터 및 정렬
        filters: {
            sortBy: 'distance',      // 'distance', 'rating', 'recent'
            category: 'all',         // 'all', 'clothes', 'shoes', 'bags'
            showBookmarkedOnly: false,
            maxDistance: 10,         // km
            searchQuery: ''
        },

        // 📌 북마크 관리
        bookmarkedIds: new Set(),

        // 📍 위치 기반 데이터
        userLocation: null,
        nearbyRadius: 5.0,       // km

        // 🔄 새로고침 관련
        lastRefreshTime: null,
        autoRefreshInterval: null
    }),

    getters: {
        // 📊 기본 통계
        collectionsCount: (state) => state.collections.length,

        bookmarkedCollections: (state) => {
            return state.collections.filter(c => state.bookmarkedIds.has(c.id))
        },

        bookmarkedCount: (state) => state.bookmarkedIds.size,

        // ✅ UI 상태 getter 추가 (CollectionSidebar.vue에서 사용)
        shouldShowErrorState: (state) => {
            return !state.isLoading && state.error && state.collections.length === 0
        },

        shouldShowCollections: (state) => {
            return !state.isLoading && !state.error && state.collections.length > 0
        },

        shouldShowEmptyState: (state) => {
            return !state.isLoading && !state.error && state.collections.length === 0
        },

        // 🔍 필터링된 의류수거함 목록
        filteredCollections: (state) => {
            let result = [...state.collections]

            // 검색어 필터
            if (state.filters.searchQuery) {
                const query = state.filters.searchQuery.toLowerCase()
                result = result.filter(c =>
                    c.address?.toLowerCase().includes(query) ||
                    c.detailAddress?.toLowerCase().includes(query)
                )
            }

            // 북마크 필터
            if (state.filters.showBookmarkedOnly) {
                result = result.filter(c => state.bookmarkedIds.has(c.id))
            }

            // 카테고리 필터
            if (state.filters.category !== 'all') {
                result = result.filter(c => c.category === state.filters.category)
            }

            // 거리 필터
            if (state.filters.maxDistance > 0) {
                result = result.filter(c => {
                    const distance = parseFloat(c.distance)
                    return distance <= state.filters.maxDistance
                })
            }

            // 정렬
            switch (state.filters.sortBy) {
                case 'distance':
                    result.sort((a, b) => parseFloat(a.distance || 999) - parseFloat(b.distance || 999))
                    break
                case 'rating':
                    result.sort((a, b) => (b.rating || 0) - (a.rating || 0))
                    break
                case 'recent':
                    result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
                    break
            }

            return result
        },

        // 📍 주변 의류수거함 (반경 내)
        nearbyCollections: (state) => {
            return state.collections.filter(c => {
                const distance = parseFloat(c.distance || 999)
                return distance <= state.nearbyRadius
            })
        },

        // 📊 카테고리별 통계
        categoryStats: (state) => {
            const stats = {
                all: state.collections.length,
                clothes: 0,
                shoes: 0,
                bags: 0,
                etc: 0
            }

            state.collections.forEach(c => {
                const category = c.category || 'etc'
                if (stats[category] !== undefined) {
                    stats[category]++
                } else {
                    stats.etc++
                }
            })

            return stats
        },

        // 🎯 추천 의류수거함 (거리, 평점 종합)
        recommendedCollections: (state) => {
            return state.collections
                .filter(c => parseFloat(c.distance || 999) <= 3) // 3km 이내
                .sort((a, b) => {
                    const scoreA = (b.rating || 3) / parseFloat(a.distance || 1)
                    const scoreB = (a.rating || 3) / parseFloat(b.distance || 1)
                    return scoreB - scoreA
                })
                .slice(0, 5) // 상위 5개
        }
    },

    actions: {
        // ✅ 에러 관리 메서드 추가
        setError(error) {
            this.error = error?.message || error
            console.error('❌ [Collection Store] 에러 설정:', this.error)
        },

        clearError() {
            this.error = null
        },

        // 📡 의류수거함 목록 로드
        async loadCollections() {
            console.log('📡 [Collection Store] 의류수거함 목록 로드 시작')

            this.isLoading = true
            this.clearError()

            try {
                const data = await collectionAPI.getCollections()
                this.collections = data
                this.lastRefreshTime = new Date()

                console.log(`✅ [Collection Store] ${data.length}개 의류수거함 로드 완료`)

                // 사용자 위치가 있으면 거리 계산
                if (this.userLocation) {
                    this.calculateDistances()
                }

            } catch (error) {
                console.error('❌ [Collection Store] 의류수거함 로드 실패:', error)
                this.setError(error)
                throw error
            } finally {
                this.isLoading = false
            }
        },

        // 🔄 의류수거함 목록 새로고침
        async refreshCollections() {
            console.log('🔄 [Collection Store] 의류수거함 새로고침')

            this.isRefreshing = true
            this.clearError()

            try {
                await this.loadCollections()
                console.log('✅ [Collection Store] 새로고침 완료')
            } catch (error) {
                console.error('❌ [Collection Store] 새로고침 실패:', error)
                this.setError(error)
                throw error
            } finally {
                this.isRefreshing = false
            }
        },

        // 📦 의류수거함 선택
        selectCollection(collection) {
            console.log('📦 [Collection Store] 의류수거함 선택:', collection.id)
            this.selectedCollection = collection
        },

        // 📦 의류수거함 선택 해제
        clearSelection() {
            console.log('📦 [Collection Store] 선택 해제')
            this.selectedCollection = null
        },

        // 📌 북마크 토글
        async toggleBookmark(collectionId) {
            console.log('📌 [Collection Store] 북마크 토글:', collectionId)

            try {
                // API 호출
                await collectionAPI.toggleBookmark(collectionId)

                // 로컬 상태 업데이트
                if (this.bookmarkedIds.has(collectionId)) {
                    this.bookmarkedIds.delete(collectionId)
                    console.log('📌 북마크 제거됨')
                } else {
                    this.bookmarkedIds.add(collectionId)
                    console.log('📌 북마크 추가됨')
                }

                // 컬렉션 목록의 북마크 상태 업데이트
                const collection = this.collections.find(c => c.id === collectionId)
                if (collection) {
                    collection.isBookmarked = this.bookmarkedIds.has(collectionId)
                }

                // 북마크 상태 저장
                this.saveBookmarks()

            } catch (error) {
                console.error('❌ [Collection Store] 북마크 토글 실패:', error)
                throw error
            }
        },

        // 📌 북마크 상태 로드 (로그인 후)
        async loadBookmarks() {
            try {
                console.log('📌 [Collection Store] 북마크 상태 로드')

                // TODO: 실제 북마크 API 구현 후 사용
                // const bookmarks = await collectionAPI.getBookmarks()
                // this.bookmarkedIds = new Set(bookmarks.map(b => b.collectionId))

                // 임시로 로컬 스토리지에서 로드
                const savedBookmarks = localStorage.getItem('bookmarkedCollections')
                if (savedBookmarks) {
                    this.bookmarkedIds = new Set(JSON.parse(savedBookmarks))
                }

                // 컬렉션 목록의 북마크 상태 업데이트
                this.collections.forEach(collection => {
                    collection.isBookmarked = this.bookmarkedIds.has(collection.id)
                })

            } catch (error) {
                console.error('❌ [Collection Store] 북마크 로드 실패:', error)
            }
        },

        // 📌 북마크 상태 저장
        saveBookmarks() {
            try {
                const bookmarkArray = Array.from(this.bookmarkedIds)
                localStorage.setItem('bookmarkedCollections', JSON.stringify(bookmarkArray))
                console.log('💾 [Collection Store] 북마크 상태 저장됨')
            } catch (error) {
                console.error('❌ [Collection Store] 북마크 저장 실패:', error)
            }
        },

        // 🔍 필터 설정
        setFilter(filterType, value) {
            console.log(`🔍 [Collection Store] 필터 설정: ${filterType} = ${value}`)

            switch (filterType) {
                case 'sortBy':
                    this.filters.sortBy = value
                    break
                case 'category':
                    this.filters.category = value
                    break
                case 'showBookmarkedOnly':
                    this.filters.showBookmarkedOnly = value
                    break
                case 'maxDistance':
                    this.filters.maxDistance = value
                    break
                case 'searchQuery':
                    this.filters.searchQuery = value
                    break
            }
        },

        // 🔍 검색
        searchCollections(query) {
            console.log('🔍 [Collection Store] 검색:', query)
            this.setFilter('searchQuery', query)
        },

        // 🔍 필터 초기화
        resetFilters() {
            console.log('🔄 [Collection Store] 필터 초기화')
            this.filters = {
                sortBy: 'distance',
                category: 'all',
                showBookmarkedOnly: false,
                maxDistance: 10,
                searchQuery: ''
            }
        },

        // 📍 사용자 위치 설정 및 거리 계산
        setUserLocation(latitude, longitude) {
            console.log(`📍 [Collection Store] 사용자 위치 설정: (${latitude}, ${longitude})`)

            this.userLocation = { latitude, longitude }
            this.calculateDistances()
        },

        // 📏 거리 계산
        calculateDistances() {
            if (!this.userLocation) {
                console.log('⚠️ [Collection Store] 사용자 위치 없음 - 거리 계산 생략')
                return
            }

            console.log('📏 [Collection Store] 거리 계산 중...')

            this.collections.forEach(collection => {
                if (collection.latitude && collection.longitude) {
                    const distance = this.calculateDistance(
                        this.userLocation.latitude,
                        this.userLocation.longitude,
                        collection.latitude,
                        collection.longitude
                    )

                    collection.distance = distance < 1
                        ? `${Math.round(distance * 1000)}M`
                        : `${distance.toFixed(1)}KM`
                } else {
                    collection.distance = '거리 미상'
                }
            })

            console.log('✅ [Collection Store] 거리 계산 완료')
        },

        // 📏 두 지점 간 거리 계산 (Haversine 공식)
        calculateDistance(lat1, lon1, lat2, lon2) {
            const R = 6371 // 지구 반지름 (km)
            const dLat = this.deg2rad(lat2 - lat1)
            const dLon = this.deg2rad(lon2 - lon1)
            const a =
                Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
                Math.sin(dLon/2) * Math.sin(dLon/2)
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
            const d = R * c
            return d
        },

        deg2rad(deg) {
            return deg * (Math.PI/180)
        },

        // 🎯 ID로 의류수거함 찾기
        findCollectionById(id) {
            return this.collections.find(c => c.id === id)
        },

        // 📍 가장 가까운 의류수거함 찾기
        findNearestCollection() {
            if (!this.userLocation || this.collections.length === 0) return null

            let nearest = null
            let minDistance = Infinity

            this.collections.forEach(collection => {
                if (collection.latitude && collection.longitude) {
                    const distance = this.calculateDistance(
                        this.userLocation.latitude,
                        this.userLocation.longitude,
                        collection.latitude,
                        collection.longitude
                    )

                    if (distance < minDistance) {
                        minDistance = distance
                        nearest = collection
                    }
                }
            })

            return nearest
        },

        // 🔄 자동 새로고침 설정
        startAutoRefresh(intervalMinutes = 5) {
            console.log(`🔄 [Collection Store] 자동 새로고침 시작: ${intervalMinutes}분 간격`)

            this.stopAutoRefresh() // 기존 인터벌 중지

            this.autoRefreshInterval = setInterval(() => {
                console.log('🔄 [Collection Store] 자동 새로고침 실행')
                this.refreshCollections()
            }, intervalMinutes * 60 * 1000)
        },

        // 🛑 자동 새로고침 중지
        stopAutoRefresh() {
            if (this.autoRefreshInterval) {
                console.log('🛑 [Collection Store] 자동 새로고침 중지')
                clearInterval(this.autoRefreshInterval)
                this.autoRefreshInterval = null
            }
        },

        // 📊 통계 정보 가져오기
        getStatistics() {
            return {
                total: this.collectionsCount,
                bookmarked: this.bookmarkedCount,
                nearby: this.nearbyCollections.length,
                categories: this.categoryStats,
                lastRefresh: this.lastRefreshTime
            }
        },

        // 🧹 데이터 초기화
        clearData() {
            console.log('🧹 [Collection Store] 데이터 초기화')

            this.collections = []
            this.selectedCollection = null
            this.isLoading = false
            this.isRefreshing = false
            this.clearError()
            this.resetFilters()
            this.stopAutoRefresh()
        },

        // 💾 상태 저장 (로컬 스토리지)
        saveState() {
            try {
                const state = {
                    bookmarkedIds: Array.from(this.bookmarkedIds),
                    filters: this.filters,
                    userLocation: this.userLocation
                }
                localStorage.setItem('collectionStoreState', JSON.stringify(state))
                console.log('💾 [Collection Store] 상태 저장됨')
            } catch (error) {
                console.error('❌ [Collection Store] 상태 저장 실패:', error)
            }
        },

        // 📂 상태 복원 (로컬 스토리지)
        restoreState() {
            try {
                const savedState = localStorage.getItem('collectionStoreState')
                if (savedState) {
                    const state = JSON.parse(savedState)

                    if (state.bookmarkedIds) {
                        this.bookmarkedIds = new Set(state.bookmarkedIds)
                    }

                    if (state.filters) {
                        this.filters = { ...this.filters, ...state.filters }
                    }

                    if (state.userLocation) {
                        this.userLocation = state.userLocation
                    }

                    console.log('📂 [Collection Store] 상태 복원됨')
                }
            } catch (error) {
                console.error('❌ [Collection Store] 상태 복원 실패:', error)
            }
        }
    }
})