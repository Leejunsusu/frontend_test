<template>
  <div class="collection-sidebar" :class="{ 'sidebar-collapsed': uiStore.sidebarCollapsed }">
    <!-- ✅ 상단 검색창 -->
    <div class="search-header">
      <div class="search-box">
        <span class="search-icon">🔍</span>
        <input
            type="text"
            placeholder="의정부시 가능동"
            v-model="searchQuery"
            @keyup.enter="handleSearch"
            class="search-input"
        />
        <button
            v-if="searchQuery"
            class="clear-search-btn"
            @click="clearSearch"
            title="검색어 지우기"
        >
          ✕
        </button>
      </div>
    </div>

    <!-- 현재 위치 헤더 -->
    <div class="location-header">
      <div class="location-info">
        <span class="location-icon">📍</span>
        <div class="location-text">
          <div class="current-location">현재 위치</div>
          <div class="location-address">{{ currentLocation }}</div>
        </div>
      </div>
      <!-- ✅ 사이드바 토글 버튼 (모바일) -->
      <button
          v-if="uiStore.isMobileDevice"
          class="sidebar-toggle-btn"
          @click="uiStore.toggleSidebar"
      >
        {{ uiStore.showSidebar ? '←' : '→' }}
      </button>
    </div>

    <!-- 주변 의류수거함 제목 및 필터 -->
    <div class="section-header">
      <span class="section-title">의정부시 가능동 의류수거함</span>
      <div class="filter-controls">
        <span class="filter-btn" @click="showFilterOptions = !showFilterOptions">
          {{ filterLabel }} ▼
        </span>
      </div>
    </div>

    <!-- 필터 옵션 (드롭다운) -->
    <div v-if="showFilterOptions" class="filter-options">
      <div class="filter-section">
        <div class="filter-section-title">정렬</div>
        <div class="filter-option" @click="setFilter('sortBy', 'distance')">
          <span class="option-icon">📏</span>
          거리순
        </div>
        <div class="filter-option" @click="setFilter('sortBy', 'rating')">
          <span class="option-icon">⭐</span>
          평점순
        </div>
        <div class="filter-option" @click="setFilter('sortBy', 'recent')">
          <span class="option-icon">🕐</span>
          최신순
        </div>
      </div>

      <div class="filter-section">
        <div class="filter-section-title">카테고리</div>
        <div class="filter-option" @click="setFilter('category', 'all')">
          <span class="option-icon">📦</span>
          전체
        </div>
        <div class="filter-option" @click="setFilter('category', 'clothes')">
          <span class="option-icon">👕</span>
          의류
        </div>
        <div class="filter-option" @click="setFilter('category', 'shoes')">
          <span class="option-icon">👟</span>
          신발
        </div>
        <div class="filter-option" @click="setFilter('category', 'bags')">
          <span class="option-icon">👜</span>
          가방
        </div>
      </div>

      <div class="filter-section">
        <div class="filter-section-title">기타</div>
        <div class="filter-option" @click="toggleBookmarkFilter">
          <span class="option-icon">📌</span>
          {{ collectionStore.filters.showBookmarkedOnly ? '전체 보기' : '북마크만 보기' }}
        </div>
        <div class="filter-option" @click="resetFilters">
          <span class="option-icon">🔄</span>
          필터 초기화
        </div>
      </div>
    </div>

    <!-- ✅ 메인 컨텐츠 영역 - 상태별로 다른 내용 표시 -->
    <div class="collection-list">

      <!-- 로딩 상태 -->
      <div v-if="collectionStore.isLoading" class="loading-state">
        <div class="loading-spinner">⏳</div>
        <div class="loading-text">주변 의류수거함을 찾고 있습니다...</div>
      </div>

      <!-- ✅ 에러 상태 (서버 연결 실패) -->
      <div v-else-if="collectionStore.shouldShowErrorState" class="error-state">
        <div class="error-icon">⚠️</div>
        <div class="error-text">
          서버에 연결할 수 없습니다
        </div>
        <div class="error-details">
          {{ collectionStore.error }}
        </div>
        <button class="refresh-btn" @click="refreshCollections">다시 시도</button>
      </div>

      <!-- ✅ 의류수거함 리스트 (데이터가 있을 때) -->
      <template v-else-if="collectionStore.shouldShowCollections">
        <div
            v-for="collection in collectionStore.filteredCollections"
            :key="collection.id"
            class="collection-item"
            :class="{
              active: collectionStore.selectedCollection?.id === collection.id,
              bookmarked: collection.isBookmarked
            }"
            @click="selectCollection(collection)"
        >
          <!-- ✅ 의류수거함 이미지 (왼쪽) -->
          <div class="collection-image">
            <div class="collection-icon">📦</div>
            <div v-if="collection.isFavorite" class="favorite-badge">❤️</div>
          </div>

          <!-- ✅ 의류수거함 정보 (중앙) -->
          <div class="collection-info">
            <div class="collection-distance">
              <span class="distance-text">내 위치서</span>
              <span class="distance-value">{{ collection.distance }}</span>
            </div>
            <div class="collection-address">
              {{ collection.address }}
            </div>
            <div class="collection-details">
              {{ collection.detailAddress }}
            </div>
          </div>

          <!-- ✅ 북마크 버튼 (오른쪽) -->
          <div class="collection-actions">
            <button
                class="bookmark-btn"
                :class="{ bookmarked: collection.isBookmarked }"
                @click.stop="toggleBookmark(collection)"
                :title="collection.isBookmarked ? '북마크 제거' : '북마크 추가'"
            >
              {{ collection.isBookmarked ? '📌' : '🔖' }}
            </button>
          </div>
        </div>

        <!-- ✅ 필터링 결과가 없을 때 -->
        <div v-if="collectionStore.filteredCollections.length === 0" class="no-results-state">
          <div class="empty-icon">🔍</div>
          <div class="empty-text">
            {{ getEmptyStateMessage() }}
          </div>
          <button v-if="hasFilters" class="reset-filter-btn" @click="resetFilters">
            필터 초기화
          </button>
        </div>
      </template>

      <!-- ✅ 완전히 빈 상태 (초기 로드 완료했지만 데이터 없음) -->
      <div v-else-if="collectionStore.shouldShowEmptyState" class="empty-state">
        <div class="empty-icon">📦</div>
        <div class="empty-text">
          주변에 의류수거함이 없습니다
        </div>
        <button class="refresh-btn" @click="refreshCollections">새로고침</button>
      </div>

    </div>
  </div>
</template>

<script>
// ✅ 모든 스토어 import
import { useCollectionStore } from '../stores/collectionStore.js'
import { useUIStore } from '../stores/uiStore.js'

export default {
  name: 'CollectionSidebar',

  emits: ['collection-selected', 'refresh', 'bookmark-toggle', 'search'],

  // ✅ 모든 스토어 사용 설정
  setup() {
    const collectionStore = useCollectionStore()
    const uiStore = useUIStore()

    return {
      collectionStore,
      uiStore
    }
  },

  data() {
    return {
      // 위치 관련
      currentLocation: '의정부시 호원동',
      showLocationButton: false,
      locationPermission: 'prompt',
      userCoordinates: null,

      // UI 상태
      showFilterOptions: false,

      // ✅ 검색 관련
      searchQuery: ''
    }
  },

  computed: {
    // 현재 필터 라벨
    filterLabel() {
      const { sortBy, category, showBookmarkedOnly } = this.collectionStore.filters

      let label = ''

      if (sortBy === 'distance') label = '거리순'
      else if (sortBy === 'rating') label = '평점순'
      else if (sortBy === 'recent') label = '최신순'

      if (category !== 'all') {
        label += ` · ${this.getCategoryLabel(category)}`
      }

      if (showBookmarkedOnly) {
        label += ' · 북마크'
      }

      return label || '거리순'
    },

    // 필터가 적용되어 있는지 확인
    hasFilters() {
      const filters = this.collectionStore.filters
      return filters.category !== 'all' ||
          filters.showBookmarkedOnly ||
          this.searchQuery.trim() !== ''
    }
  },

  async mounted() {
    console.log('🗺️ CollectionSidebar 컴포넌트 시작')

    // 위치 권한 상태 확인 후 위치 가져오기
    await this.checkLocationPermission()

    // 외부 클릭시 필터 옵션 닫기
    document.addEventListener('click', this.closeFilterOptions)

    // ✅ UI Store의 알림 시스템 사용
    this.uiStore.addNotification({
      message: '의류수거함 목록을 로드했습니다',
      type: 'info',
      duration: 2000
    })
  },

  beforeUnmount() {
    document.removeEventListener('click', this.closeFilterOptions)
  },

  methods: {
    // ✅ 검색 처리
    handleSearch() {
      if (!this.searchQuery.trim()) {
        this.clearSearch()
        return
      }

      console.log('🔍 사이드바 검색:', this.searchQuery)

      // 부모 컴포넌트에 검색 이벤트 전달
      this.$emit('search', this.searchQuery.trim())

      // collectionStore 검색 필터 적용
      this.collectionStore.searchCollections(this.searchQuery.trim())

      this.uiStore.addNotification({
        message: `'${this.searchQuery}' 검색 결과 ${this.collectionStore.filteredCollections.length}개`,
        type: 'info',
        duration: 2000
      })
    },

    // ✅ 검색어 지우기
    clearSearch() {
      this.searchQuery = ''
      this.collectionStore.setFilter('searchQuery', '')

      this.uiStore.addNotification({
        message: '검색 필터가 제거되었습니다',
        type: 'info',
        duration: 1500
      })
    },

    // ✅ 의류수거함 선택 - collectionStore와 UI Store 연동
    selectCollection(collection) {
      console.log('📦 의류수거함 선택:', collection.address)

      // collectionStore에 선택 상태 저장
      this.collectionStore.selectCollection(collection)

      // ✅ UI Store를 통해 정보 패널 열기
      this.uiStore.openCollectionInfoPanel(collection)

      // 부모 컴포넌트에 알림
      this.$emit('collection-selected', collection)

      // ✅ 모바일에서는 선택 후 사이드바 축소
      if (this.uiStore.isMobileDevice) {
        this.uiStore.collapseSidebar()
      }
    },

    // ✅ 북마크 토글 - collectionStore와 UI Store 연동
    async toggleBookmark(collection) {
      console.log('📌 북마크 토글:', collection.id)

      try {
        await this.collectionStore.toggleBookmark(collection.id)

        // ✅ UI Store를 통한 알림
        const isBookmarked = this.collectionStore.bookmarkedIds.has(collection.id)
        this.uiStore.addNotification({
          message: isBookmarked ?
              `${collection.address} 북마크 추가` :
              `${collection.address} 북마크 제거`,
          type: 'success',
          duration: 2000
        })

        this.$emit('bookmark-toggle', collection)
      } catch (error) {
        console.error('❌ 북마크 토글 실패:', error)

        // ✅ UI Store를 통한 에러 알림
        this.uiStore.addNotification({
          message: '북마크 처리 중 오류가 발생했습니다',
          type: 'error'
        })
      }
    },

    // ✅ 필터 설정 - collectionStore 사용
    setFilter(filterType, value) {
      console.log('🔧 필터 변경:', filterType, '=', value)
      this.collectionStore.setFilter(filterType, value)
      this.showFilterOptions = false

      // ✅ UI Store를 통한 알림
      this.uiStore.addNotification({
        message: `필터 적용: ${this.filterLabel}`,
        type: 'info',
        duration: 1500
      })
    },

    // ✅ 북마크 필터 토글
    toggleBookmarkFilter() {
      const current = this.collectionStore.filters.showBookmarkedOnly
      this.collectionStore.setFilter('showBookmarkedOnly', !current)
      this.showFilterOptions = false

      // ✅ UI Store를 통한 알림
      this.uiStore.addNotification({
        message: current ? '전체 수거함 표시' : '북마크된 수거함만 표시',
        type: 'info',
        duration: 1500
      })
    },

    // ✅ 필터 초기화 - collectionStore 사용
    resetFilters() {
      console.log('🔄 필터 초기화')
      this.collectionStore.resetFilters()
      this.searchQuery = '' // 검색어도 초기화
      this.showFilterOptions = false

      // ✅ UI Store를 통한 알림
      this.uiStore.addNotification({
        message: '필터가 초기화되었습니다',
        type: 'info',
        duration: 1500
      })
    },

    // ✅ 새로고침 - collectionStore와 UI Store 연동
    async refreshCollections() {
      console.log('🔄 의류수거함 목록 새로고침')

      // ✅ UI Store로 로딩 시작
      this.uiStore.startAppLoading('의류수거함 목록 새로고침 중...')

      // 에러 상태 초기화
      this.collectionStore.clearError()

      try {
        await this.collectionStore.refreshCollections()

        // ✅ UI Store를 통한 성공 알림
        this.uiStore.addNotification({
          message: `${this.collectionStore.collectionsCount}개의 의류수거함을 새로고침했습니다`,
          type: 'success'
        })

        this.$emit('refresh')
      } catch (error) {
        console.error('❌ 새로고침 실패:', error)

        // ✅ UI Store를 통한 에러 알림
        this.uiStore.addNotification({
          message: '새로고침 중 오류가 발생했습니다',
          type: 'error'
        })
      } finally {
        // ✅ UI Store로 로딩 종료
        this.uiStore.stopAppLoading()
      }
    },

    // 위치 관련 메서드들 (기존과 동일하지만 UI Store 알림 추가)
    async checkLocationPermission() {
      try {
        if (!navigator.geolocation) {
          console.log('⚠️ 이 브라우저는 위치 서비스를 지원하지 않습니다')
          this.currentLocation = '위치 서비스를 지원하지 않는 브라우저입니다'
          this.showLocationButton = false

          this.uiStore.addNotification({
            message: '위치 서비스를 지원하지 않는 브라우저입니다',
            type: 'warning'
          })

          return
        }

        if ('permissions' in navigator) {
          const permission = await navigator.permissions.query({ name: 'geolocation' })
          this.locationPermission = permission.state

          console.log('📍 위치 권한 상태:', permission.state)

          if (permission.state === 'granted') {
            this.getCurrentLocation()
          } else if (permission.state === 'denied') {
            this.handleLocationDenied()
          } else {
            this.handleLocationPrompt()
          }
        } else {
          this.getCurrentLocation()
        }
      } catch (error) {
        console.error('❌ 위치 권한 확인 실패:', error)
        this.currentLocation = '위치 권한을 확인할 수 없습니다'

        this.uiStore.addNotification({
          message: '위치 권한을 확인할 수 없습니다',
          type: 'error'
        })
      }
    },

    handleLocationDenied() {
      console.log('⚠️ 위치 권한이 거부되었습니다')
      this.currentLocation = '의정부시 호원동'
      this.showLocationButton = true
      this.setDefaultLocation()

      this.uiStore.addNotification({
        message: '위치 권한이 거부되어 기본 위치를 사용합니다',
        type: 'warning'
      })
    },

    handleLocationPrompt() {
      console.log('📍 위치 권한을 요청합니다')
      this.currentLocation = '위치 권한 허용이 필요합니다'
      this.showLocationButton = true

      this.uiStore.addNotification({
        message: '정확한 거리 계산을 위해 위치 권한을 허용해주세요',
        type: 'info'
      })
    },

    async requestLocationPermission() {
      console.log('📍 위치 권한 재요청 시도...')
      this.currentLocation = '위치 권한을 요청 중...'
      this.showLocationButton = false

      try {
        await this.getCurrentLocation()
      } catch (error) {
        console.error('❌ 위치 권한 재요청 실패:', error)
        this.showLocationButton = true
      }
    },

    async getCurrentLocation() {
      try {
        if (!navigator.geolocation) {
          throw new Error('위치 서비스를 지원하지 않는 브라우저입니다')
        }

        console.log('📍 현재 위치 요청 중...')
        this.currentLocation = '현재 위치 확인 중...'

        const position = await this.getPositionPromise()
        const { latitude, longitude } = position.coords

        console.log('✅ 현재 위치 획득 성공:', latitude, longitude)

        // 위치 정보 저장
        this.userCoordinates = { latitude, longitude }
        this.locationPermission = 'granted'
        this.showLocationButton = false

        // ✅ collectionStore에 사용자 위치 설정 (자동으로 거리 계산됨)
        this.collectionStore.setUserLocation(latitude, longitude)

        // 주소 변환
        await this.updateLocationAddress(latitude, longitude)

        // ✅ UI Store 알림
        this.uiStore.addNotification({
          message: '현재 위치를 확인했습니다',
          type: 'success',
          duration: 2000
        })

      } catch (error) {
        console.error('❌ 위치 정보 가져오기 실패:', error)
        this.handleLocationError(error)
      }
    },

    getPositionPromise() {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
            resolve,
            reject,
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 300000
            }
        )
      })
    },

    handleLocationError(error) {
      let message = '위치 정보를 가져올 수 없습니다'

      switch (error.code) {
        case 1:
          console.log('⚠️ 사용자가 위치 권한을 거부했습니다')
          message = '위치 권한이 거부되었습니다'
          this.showLocationButton = true
          break
        case 2:
          console.log('⚠️ 위치 정보를 사용할 수 없습니다')
          message = '위치 정보를 사용할 수 없습니다'
          break
        case 3:
          console.log('⚠️ 위치 요청 시간이 초과되었습니다')
          message = '위치 요청 시간이 초과되었습니다'
          this.showLocationButton = true
          break
        default:
          console.log('⚠️ 알 수 없는 위치 오류:', error.message)
          message = '위치 정보 오류가 발생했습니다'
      }

      this.currentLocation = '의정부시 호원동'
      this.locationPermission = 'denied'
      this.setDefaultLocation()

      this.uiStore.addNotification({
        message: `${message}. 기본 위치를 사용합니다.`,
        type: 'warning'
      })
    },

    setDefaultLocation() {
      console.log('🏠 기본 위치로 설정합니다')
      this.userCoordinates = {
        latitude: 37.5666805,
        longitude: 126.9784147
      }
      this.currentLocation = '의정부시 호원동'

      this.collectionStore.setUserLocation(37.5666805, 126.9784147)
    },

    async updateLocationAddress(lat, lng) {
      try {
        this.currentLocation = `위도: ${lat.toFixed(4)}, 경도: ${lng.toFixed(4)}`

        // TODO: 실제 Geocoding API 연동
      } catch (error) {
        console.error('❌ 주소 변환 실패:', error)
        this.currentLocation = `위도: ${lat.toFixed(4)}, 경도: ${lng.toFixed(4)}`
      }
    },

    // 유틸리티 메서드들
    getCategoryLabel(category) {
      const labels = {
        'all': '전체',
        'clothes': '의류',
        'shoes': '신발',
        'bags': '가방',
        'etc': '기타'
      }
      return labels[category] || '기타'
    },

    getEmptyStateMessage() {
      const filters = this.collectionStore.filters

      if (this.searchQuery.trim()) {
        return `'${this.searchQuery}' 검색 결과가 없습니다`
      } else if (filters.showBookmarkedOnly) {
        return '북마크된 수거함이 없습니다'
      } else if (filters.category !== 'all') {
        return `${this.getCategoryLabel(filters.category)} 수거함이 없습니다`
      } else {
        return '조건에 맞는 의류수거함이 없습니다'
      }
    },

    // 필터 옵션 닫기
    closeFilterOptions(event) {
      if (!event.target.closest('.filter-btn') && !event.target.closest('.filter-options')) {
        this.showFilterOptions = false
      }
    }
  }
}
</script>

<style scoped>
.collection-sidebar {
  width: 380px;
  height: calc(100vh - 60px);
  background: white;
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 60px;
  border-right: 1px solid #e0e0e0;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  z-index: 1000;
  transition: all 0.3s ease;
}

/* ✅ 사이드바 축소 상태 */
.collection-sidebar.sidebar-collapsed {
  width: 60px;
}

.collection-sidebar.sidebar-collapsed .search-header,
.collection-sidebar.sidebar-collapsed .location-text,
.collection-sidebar.sidebar-collapsed .section-title,
.collection-sidebar.sidebar-collapsed .filter-controls,
.collection-sidebar.sidebar-collapsed .collection-info,
.collection-sidebar.sidebar-collapsed .collection-actions {
  display: none;
}

/* ✅ 상단 검색창 */
.search-header {
  padding: 20px;
  background: white;
  border-bottom: 1px solid #f0f0f0;
}

.search-box {
  display: flex;
  align-items: center;
  border: 2px solid #e0e0e0;
  border-radius: 24px;
  padding: 12px 16px;
  background: #f8f9fa;
  transition: all 0.2s;
  position: relative;
}

.search-box:focus-within {
  border-color: #6366f1;
  background: white;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.15);
}

.search-icon {
  font-size: 16px;
  color: #666;
  margin-right: 10px;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 14px;
  outline: none;
  color: #333;
  font-weight: 400;
}

.search-input::placeholder {
  color: #999;
  font-style: normal;
}

.clear-search-btn {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  margin-left: 8px;
  transition: all 0.2s;
}

.clear-search-btn:hover {
  background: #e0e0e0;
  color: #333;
}

/* 현재 위치 헤더 */
.location-header {
  padding: 16px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.location-info {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex: 1;
}

.location-icon {
  font-size: 16px;
  color: #6366f1;
  margin-top: 2px;
}

.location-text {
  flex: 1;
}

.current-location {
  font-size: 11px;
  color: #666;
  margin-bottom: 4px;
  font-weight: 500;
}

.location-address {
  font-size: 14px;
  color: #333;
  font-weight: 600;
  line-height: 1.3;
}

/* ✅ 사이드바 토글 버튼 */
.sidebar-toggle-btn {
  background: #6366f1;
  color: white;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.sidebar-toggle-btn:hover {
  background: #5b21b6;
  transform: scale(1.1);
}

/* 섹션 헤더 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: white;
  border-bottom: 1px solid #f0f0f0;
  position: relative;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  line-height: 1.3;
}

.filter-controls {
  display: flex;
  gap: 8px;
}

.filter-btn {
  font-size: 11px;
  color: #666;
  cursor: pointer;
  padding: 6px 10px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  background: #f8f9fa;
  transition: all 0.2s;
  white-space: nowrap;
}

.filter-btn:hover {
  background: #e3f2fd;
  color: #1976d2;
  border-color: #bbdefb;
}

/* 필터 옵션 드롭다운 */
.filter-options {
  position: absolute;
  top: 100%;
  right: 20px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1001;
  min-width: 200px;
  max-height: 300px;
  overflow-y: auto;
}

.filter-section {
  padding: 8px 0;
}

.filter-section:not(:last-child) {
  border-bottom: 1px solid #f0f0f0;
}

.filter-section-title {
  padding: 8px 16px;
  font-size: 12px;
  font-weight: 600;
  color: #666;
  background: #f8f9fa;
}

.filter-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  transition: background 0.2s;
}

.filter-option:hover {
  background: #f8f9fa;
}

.option-icon {
  font-size: 14px;
  width: 16px;
}

/* 의류수거함 리스트 */
.collection-list {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

.collection-item {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  background: white;
  gap: 12px;
}

.collection-item:hover {
  background: #f8f9fa;
}

.collection-item.active {
  background: #e3f2fd;
  border-left: 4px solid #6366f1;
}

.collection-item.bookmarked {
  background: #fff8e7;
}

.collection-item.bookmarked.active {
  background: #e3f2fd;
}

/* ✅ 의류수거함 이미지 (오른쪽 참고 이미지와 유사하게) */
.collection-image {
  position: relative;
  width: 50px;
  height: 50px;
  border-radius: 8px;
  overflow: hidden;
  background: #f0f0f0;
  flex-shrink: 0;
}

.collection-icon {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  background: linear-gradient(135deg, #4CAF50, #66BB6A);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: white;
}

.favorite-badge {
  position: absolute;
  top: 2px;
  right: 2px;
  font-size: 10px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ✅ 의류수거함 정보 (오른쪽 참고 이미지 스타일) */
.collection-info {
  flex: 1;
  min-width: 0;
}

.collection-distance {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 4px;
}

.distance-text {
  font-size: 10px;
  color: #999;
}

.distance-value {
  font-size: 12px;
  font-weight: 600;
  color: #6366f1;
}

.collection-address {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 2px;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.collection-details {
  font-size: 12px;
  color: #666;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ✅ 의류수거함 액션 (북마크 버튼) */
.collection-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.bookmark-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  transition: all 0.2s;
  color: #ccc;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bookmark-btn:hover {
  background: #f0f0f0;
  transform: scale(1.1);
}

.bookmark-btn.bookmarked {
  color: #6366f1;
  background: #e3f2fd;
}

/* ✅ 로딩 상태 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.loading-spinner {
  font-size: 32px;
  margin-bottom: 16px;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 14px;
  color: #666;
}

/* ✅ 에러 상태 */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
  color: #f44336;
}

.error-text {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.error-details {
  font-size: 12px;
  color: #666;
  margin-bottom: 20px;
  line-height: 1.4;
}

/* ✅ 빈 상태 (검색 결과 없음) */
.no-results-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

/* ✅ 완전 빈 상태 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-text {
  font-size: 14px;
  color: #999;
  margin-bottom: 20px;
  line-height: 1.4;
}

.refresh-btn, .reset-filter-btn {
  background: #6366f1;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  margin: 4px;
}

.refresh-btn:hover, .reset-filter-btn:hover {
  background: #5b21b6;
  transform: translateY(-1px);
}

.reset-filter-btn {
  background: #64748b;
}

.reset-filter-btn:hover {
  background: #475569;
}

/* 스크롤바 스타일링 */
.collection-list::-webkit-scrollbar {
  width: 4px;
}

.collection-list::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.collection-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.collection-list::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* ✅ 반응형 디자인 - UI Store 연동 */
@media (max-width: 768px) {
  .collection-sidebar {
    width: 100vw;
    height: 40vh;
    position: fixed;
    top: auto;
    bottom: 0;
    left: 0;
    border-right: none;
    border-top: 1px solid #e0e0e0;
    transform: translateY(100%);
    transition: transform 0.3s ease;
  }

  .collection-sidebar:not(.sidebar-collapsed) {
    transform: translateY(0);
  }

  .search-header {
    padding: 12px 16px;
  }

  .search-box {
    padding: 10px 14px;
  }

  .location-header, .section-header {
    padding: 12px 16px;
  }

  .collection-item {
    padding: 12px 16px;
  }

  .sidebar-toggle-btn {
    display: flex;
  }

  .section-title {
    font-size: 14px;
  }

  .filter-btn {
    font-size: 10px;
    padding: 5px 8px;
  }
}

@media (min-width: 769px) {
  .sidebar-toggle-btn {
    display: none;
  }
}

/* ✅ 추가 반응형 개선 */
@media (max-width: 480px) {
  .search-input {
    font-size: 13px;
  }

  .search-input::placeholder {
    font-size: 13px;
  }

  .collection-address {
    font-size: 13px;
  }

  .collection-details {
    font-size: 11px;
  }
}
</style>