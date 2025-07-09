<template>
  <div id="app">
    <!-- 상단 네비게이션 바 -->
    <TopNavbar
        @menu-changed="handleMenuChange"
        @search="handleSearch"
        @login-success="handleLoginSuccess"
        @logout="handleLogout"
    />

    <!-- 왼쪽 의류수거함 사이드바 -->
    <CollectionSidebar
        @collection-selected="handleCollectionSelected"
        @refresh="handleRefresh"
        @bookmark-toggle="handleBookmarkToggle"
    />

    <!-- 지도 컴포넌트 -->
    <MapSection
        ref="mapSection"
        @map-ready="onMapReady"
        @markers-updated="onMarkersUpdated"
    />

    <!-- ✅ 의류수거함 상세 정보 패널 -->
    <CollectionInfoPanel
        :collection="uiStore.selectedCollectionForPanel"
        :is-visible="uiStore.showCollectionInfoPanel"
        @close="handleCloseInfoPanel"
        @bookmark-toggle="handleBookmarkToggle"
        @navigate="handleNavigation"
    />

    <!-- ✅ 알림 시스템 -->
    <div class="notifications-container">
      <div
          v-for="notification in uiStore.notifications"
          :key="notification.id"
          class="notification"
          :class="[notification.type]"
          @click="uiStore.markNotificationAsRead(notification.id)"
      >
        <span class="notification-message">{{ notification.message }}</span>
        <button
            class="notification-close"
            @click.stop="uiStore.removeNotification(notification.id)"
        >
          ✕
        </button>
      </div>
    </div>

    <!-- ✅ 로딩 오버레이 -->
    <div v-if="uiStore.isAppLoading" class="loading-overlay">
      <div class="loading-content">
        <div class="loading-spinner">⏳</div>
        <div class="loading-text">{{ uiStore.loadingMessage }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import TopNavbar from './components/TopNavbar.vue'
import CollectionSidebar from './components/CollectionSidebar.vue'
import MapSection from './components/MapSection.vue'
import CollectionInfoPanel from './components/CollectionInfoPanel.vue'
import { testAllConnections } from './services/apiService.js'
import { authAPI } from './services/authService.js'
// ✅ 스토어들 import
import { useMapStore } from './stores/mapStore.js'
import { useCollectionStore } from './stores/collectionStore.js'
import { useUIStore } from './stores/uiStore.js'

export default {
  name: 'App',

  components: {
    TopNavbar,
    CollectionSidebar,
    MapSection,
    CollectionInfoPanel // ✅ 컴포넌트 추가
  },

  data() {
    return {
      // 사용자 관련
      isLoggedIn: false,

      // 연결 상태 관련
      backendConnected: false
    }
  },

  // ✅ 스토어들 사용 설정
  setup() {
    const mapStore = useMapStore()
    const collectionStore = useCollectionStore()
    const uiStore = useUIStore()

    return {
      mapStore,
      collectionStore,
      uiStore
    }
  },

  async mounted() {
    console.log('🚀 DropIt 애플리케이션 시작')

    // ✅ UI Store 초기화
    this.uiStore.initializeResponsive()
    this.uiStore.restoreUIState()

    // 🔄 저장된 상태 복원
    this.collectionStore.restoreState()

    // 🧪 백엔드 연결 테스트 먼저 실행
    await this.testBackendConnection()

    // 🔐 로그인 상태 복원
    await this.restoreLoginState()

    // 📡 초기 데이터 로드
    await this.loadInitialData()
  },

  // ✅ 컴포넌트 언마운트 시 정리
  beforeUnmount() {
    // 자동 새로고침 중지
    this.collectionStore.stopAutoRefresh()

    // 상태 저장
    this.collectionStore.saveState()
    this.uiStore.saveUIState()
  },

  methods: {
    // 🧪 백엔드 연결 테스트
    async testBackendConnection() {
      try {
        console.log('🔧 백엔드 서버 연결 테스트 중...')
        this.uiStore.startAppLoading('서버 연결 확인 중...')

        const connectionResults = await testAllConnections()

        if (connectionResults.homepage && connectionResults.markerAPI) {
          console.log('✅ 백엔드 연결 성공! 정상 동작 가능합니다.')
          this.backendConnected = true
          this.uiStore.addNotification({
            message: '서버 연결 성공',
            type: 'success',
            duration: 2000
          })
        } else {
          console.error('❌ 백엔드 연결 실패! 다음을 확인해주세요:')
          console.error('   1. IntelliJ에서 Spring Boot 앱 실행')
          console.error('   2. http://localhost:8080 접속 확인')
          console.error('   3. CORS 설정 확인')
          this.backendConnected = false

          this.uiStore.addNotification({
            message: '서버 연결 실패 - 백엔드 서버를 확인해주세요',
            type: 'error',
            duration: 5000
          })

          setTimeout(() => {
            alert('백엔드 서버에 연결할 수 없습니다.\n\n확인사항:\n1. IntelliJ에서 Spring Boot 앱이 실행 중인지 확인\n2. http://localhost:8080 접속 가능한지 확인\n3. 콘솔에서 자세한 오류 확인')
          }, 1000)
        }
      } catch (error) {
        console.error('❌ 연결 테스트 중 오류:', error)
        this.backendConnected = false
        this.uiStore.addNotification({
          message: '연결 테스트 중 오류 발생',
          type: 'error'
        })
      } finally {
        this.uiStore.stopAppLoading()
      }
    },

    // 🔐 로그인 상태 복원
    async restoreLoginState() {
      try {
        const localUser = authAPI.getLocalUser()
        const isTokenValid = authAPI.isTokenValid()

        if (localUser && isTokenValid) {
          console.log('🔄 로그인 상태 복원 시도...')
          const currentUser = await authAPI.getCurrentUser()
          console.log('✅ 로그인 상태 복원 성공:', currentUser.email)

          this.isLoggedIn = true

          // ✅ 로그인 후 북마크 상태 로드
          await this.collectionStore.loadBookmarks()

          this.uiStore.addNotification({
            message: `환영합니다, ${currentUser.name}님!`,
            type: 'success'
          })
        }
      } catch (error) {
        console.log('⚠️ 로그인 상태 복원 실패:', error.message)
        localStorage.removeItem('authToken')
        localStorage.removeItem('user')
        this.isLoggedIn = false
      }
    },

    // ✅ 초기 데이터 로드 - collectionStore 사용
    async loadInitialData() {
      if (!this.backendConnected) {
        console.log('⚠️ 백엔드 연결 안됨 - 기본 데이터로 동작')
        return
      }

      try {
        this.uiStore.startAppLoading('의류수거함 정보 로드 중...')

        // collectionStore를 통해 의류수거함 데이터 로드
        await this.collectionStore.loadCollections()

        // 자동 새로고침 시작 (5분 간격)
        this.collectionStore.startAutoRefresh(5)

        this.uiStore.addNotification({
          message: `${this.collectionStore.collectionsCount}개의 의류수거함을 로드했습니다`,
          type: 'info'
        })

      } catch (error) {
        console.error('❌ 초기 데이터 로드 실패:', error)
        this.uiStore.addNotification({
          message: '데이터 로드 실패',
          type: 'error'
        })
      } finally {
        this.uiStore.stopAppLoading()
      }
    },

    // ✅ 지도 준비 완료 - mapStore 사용
    onMapReady() {
      console.log('✅ App: 지도 준비 완료')

      this.mapStore.setMapReady(true)
      this.displayCollectionsOnMap()

      this.uiStore.addNotification({
        message: '지도 로드 완료',
        type: 'success',
        duration: 2000
      })
    },

    // ✅ 마커 목록 업데이트 - collectionStore와 동기화
    onMarkersUpdated(markers) {
      console.log('📊 App: 마커 목록 업데이트:', markers.length + '개')

      // 마커 데이터를 의류수거함 형태로 변환하여 collectionStore 업데이트
      const collections = markers.map(marker => ({
        id: marker.id,
        address: marker.title || '제목 없음',
        detailAddress: marker.description || '설명 없음',
        distance: '계산 중...',
        category: marker.category || 'etc',
        latitude: marker.latitude,
        longitude: marker.longitude,
        isBookmarked: this.collectionStore.bookmarkedIds.has(marker.id),
        isFavorite: false,
        rating: null,
        createdAt: marker.createdAt,
        createdBy: marker.createdByEmail
      }))

      // collectionStore에 직접 설정 (로딩 없이)
      this.collectionStore.collections = collections

      // 거리 계산
      if (this.collectionStore.userLocation) {
        this.collectionStore.calculateDistances()
      }
    },

    // ✅ CollectionInfoPanel 닫기 처리
    handleCloseInfoPanel() {
      console.log('📱 App: 정보 패널 닫기')
      this.uiStore.closeCollectionInfoPanel()
      this.collectionStore.clearSelection()
    },

    // ✅ 길찾기 처리
    handleNavigation(collection) {
      console.log('🗺️ App: 길찾기 요청:', collection.address)

      if (collection.latitude && collection.longitude) {
        // 네이버 지도 길찾기 URL 생성
        const naverMapUrl = `https://map.naver.com/v5/directions?c=${collection.longitude},${collection.latitude},15,0,0,0,dh`

        // 새 창에서 네이버 지도 열기
        window.open(naverMapUrl, '_blank')

        this.uiStore.addNotification({
          message: '네이버 지도에서 길찾기가 열렸습니다',
          type: 'info'
        })
      } else {
        this.uiStore.addNotification({
          message: '위치 정보가 없어 길찾기를 사용할 수 없습니다',
          type: 'warning'
        })
      }
    },

    // 📱 상단 메뉴 변경
    handleMenuChange(menu) {
      console.log('📱 App: 메뉴 변경:', menu)
      this.uiStore.setActiveMenu(menu)

      switch(menu) {
        case 'collection':
          this.handleCollectionMenu()
          break
        case 'delivery':
          this.handleDeliveryMenu()
          break
        case 'finder':
          this.handleFinderMenu()
          break
        case 'history':
          this.handleHistoryMenu()
          break
        case 'guide':
          this.handleGuideMenu()
          break
        case 'mypage':
          this.handleMypageMenu()
          break
        default:
          console.log('🤷 알 수 없는 메뉴:', menu)
      }
    },

    // ✅ 검색 처리 - collectionStore 사용
    handleSearch(query) {
      console.log('🔍 App: 검색 요청:', query)

      if (!query.trim()) {
        this.collectionStore.setFilter('searchQuery', '')
        return
      }

      if (!this.backendConnected) {
        this.uiStore.addNotification({
          message: '백엔드 서버에 연결되지 않아 검색 기능을 사용할 수 없습니다',
          type: 'warning'
        })
        return
      }

      this.uiStore.startSearching()

      // collectionStore를 통해 검색
      this.collectionStore.searchCollections(query)

      const results = this.collectionStore.filteredCollections
      console.log(`🔍 App: 검색 결과 ${results.length}개`)

      this.uiStore.stopSearching()

      if (results.length > 0) {
        const firstResult = results[0]
        this.handleCollectionSelected(firstResult)

        this.uiStore.addNotification({
          message: `'${query}' 검색 결과 ${results.length}개`,
          type: 'info'
        })
      } else {
        this.uiStore.addNotification({
          message: `'${query}' 검색 결과가 없습니다`,
          type: 'warning'
        })
      }
    },

    // ✅ 의류수거함 선택 처리 - collectionStore와 mapStore 연동
    handleCollectionSelected(collection) {
      console.log('📦 App: 의류수거함 선택:', collection.address)

      // collectionStore에 선택 상태 저장
      this.collectionStore.selectCollection(collection)

      if (this.mapStore.isMapReady && collection.latitude && collection.longitude) {
        // 지도 스토어를 통해 위치 이동
        this.mapStore.moveToLocation(
            collection.latitude,
            collection.longitude,
            16
        )

        // 마커 정보창 표시
        if (collection.id) {
          this.mapStore.showMarkerInfo(collection.id)
        }
      }

      // ✅ UI Store를 통해 정보 패널 열기
      this.uiStore.openCollectionInfoPanel(collection)
    },

    // ✅ 새로고침 처리 - collectionStore와 mapStore 연동
    async handleRefresh() {
      console.log('🔄 App: 데이터 새로고침')

      this.uiStore.startAppLoading('데이터 새로고침 중...')

      await this.testBackendConnection()

      if (!this.backendConnected) {
        this.uiStore.addNotification({
          message: '백엔드 서버에 연결할 수 없습니다',
          type: 'error'
        })
        this.uiStore.stopAppLoading()
        return
      }

      try {
        // collectionStore 새로고침
        await this.collectionStore.refreshCollections()

        // mapStore 새로고침
        if (this.mapStore.isMapReady) {
          await this.mapStore.refreshMarkers()
        }

        this.uiStore.addNotification({
          message: '데이터 새로고침 완료',
          type: 'success'
        })

        console.log('✅ 새로고침 완료')
      } catch (error) {
        console.error('❌ 새로고침 실패:', error)
        this.uiStore.addNotification({
          message: '새로고침 중 오류가 발생했습니다',
          type: 'error'
        })
      } finally {
        this.uiStore.stopAppLoading()
      }
    },

    // ✅ 북마크 토글 - collectionStore 사용
    async handleBookmarkToggle(collection) {
      console.log('📌 App: 북마크 토글 요청:', collection.id)

      if (!this.backendConnected) {
        console.log('⚠️ 백엔드 연결 안됨 - 로컬에서만 북마크 처리')
      }

      try {
        await this.collectionStore.toggleBookmark(collection.id)

        // 북마크 상태 저장
        this.collectionStore.saveBookmarks()

        const isBookmarked = this.collectionStore.bookmarkedIds.has(collection.id)
        this.uiStore.addNotification({
          message: isBookmarked ? '북마크에 추가되었습니다' : '북마크에서 제거되었습니다',
          type: 'success',
          duration: 2000
        })

        console.log('✅ 북마크 토글 완료')

      } catch (error) {
        console.error('❌ 북마크 토글 실패:', error)
        this.uiStore.addNotification({
          message: '북마크 처리 중 오류가 발생했습니다',
          type: 'error'
        })
      }
    },

    // 👤 로그인 성공 처리
    handleLoginSuccess(userData) {
      console.log('👤 App: 로그인 성공:', userData)
      this.isLoggedIn = true

      // 로그인 후 북마크 상태 로드
      this.collectionStore.loadBookmarks()

      this.uiStore.addNotification({
        message: `환영합니다, ${userData.name}님!`,
        type: 'success'
      })

      this.loadUserData()
    },

    // 🚪 로그아웃 처리
    handleLogout() {
      console.log('🚪 App: 로그아웃')
      this.isLoggedIn = false

      // 북마크 상태 저장 후 초기화
      this.collectionStore.saveBookmarks()
      this.collectionStore.bookmarkedIds.clear()

      this.uiStore.addNotification({
        message: '로그아웃되었습니다',
        type: 'info'
      })

      this.loadInitialData()
    },

    // 메뉴 핸들러들
    handleCollectionMenu() {
      console.log('📦 App: 의류수거함 메뉴 선택')

      // 필터 초기화 후 의류수거함 표시
      this.collectionStore.resetFilters()
      this.uiStore.closeAllPanels()

      if (this.backendConnected && this.collectionStore.collections.length === 0) {
        this.collectionStore.loadCollections()
      }
    },

    handleDeliveryMenu() {
      console.log('📦 App: 나눔 메뉴 선택')
      this.uiStore.addNotification({
        message: '나눔 기능은 준비 중입니다',
        type: 'info'
      })
    },

    handleFinderMenu() {
      console.log('🔍 App: 수거함 찾기 메뉴 선택')

      // 가장 가까운 수거함 찾기
      const nearest = this.collectionStore.findNearestCollection()
      if (nearest) {
        this.handleCollectionSelected(nearest)
        this.uiStore.addNotification({
          message: `가장 가까운 수거함: ${nearest.address} (${nearest.distance})`,
          type: 'success'
        })
      } else {
        this.uiStore.addNotification({
          message: '주변에 수거함이 없습니다',
          type: 'warning'
        })
      }
    },

    handleHistoryMenu() {
      console.log('⭐ App: 즐겨찾기 메뉴 선택')

      // 북마크된 수거함만 표시
      this.collectionStore.setFilter('showBookmarkedOnly', true)

      const bookmarkedCount = this.collectionStore.bookmarkedCount
      if (bookmarkedCount === 0) {
        this.uiStore.addNotification({
          message: '북마크된 수거함이 없습니다',
          type: 'info'
        })
      } else {
        this.uiStore.addNotification({
          message: `북마크된 수거함 ${bookmarkedCount}개를 표시합니다`,
          type: 'success'
        })
      }
    },

    handleGuideMenu() {
      console.log('📖 App: 이용가이드 메뉴 선택')
      window.open('/guide', '_blank')
    },

    handleMypageMenu() {
      console.log('👤 App: 마이페이지 메뉴 선택')
      if (this.isLoggedIn) {
        // 사용자 통계 표시
        const stats = this.collectionStore.getStatistics()
        this.uiStore.addNotification({
          message: `나의 통계 - 북마크: ${stats.bookmarked}개, 주변: ${stats.nearby}개`,
          type: 'info',
          duration: 5000
        })
      } else {
        this.uiStore.addNotification({
          message: '로그인이 필요합니다',
          type: 'warning'
        })
      }
    },

    // ✅ 지도에 의류수거함 마커 표시 - collectionStore 사용
    displayCollectionsOnMap() {
      if (!this.mapStore.isMapReady || this.collectionStore.collections.length === 0) return

      console.log('🗺️ 지도에 의류수거함 마커 표시')

      const markerData = this.collectionStore.collections.map(collection => ({
        id: collection.id,
        title: `의류수거함 (${collection.distance})`,
        description: collection.address,
        latitude: collection.latitude,
        longitude: collection.longitude,
        createdAt: new Date().toISOString()
      }))

      console.log('📌 마커 데이터 준비 완료:', markerData.length + '개')
    },

    // 사용자 개인화 데이터 로드
    async loadUserData() {
      if (!this.backendConnected) {
        console.log('⚠️ 백엔드 연결 안됨 - 사용자 데이터 로드 생략')
        return
      }

      try {
        console.log('👤 사용자 개인화 데이터 로드 중...')

        // 북마크 상태 로드
        await this.collectionStore.loadBookmarks()

        console.log('✅ 사용자 데이터 로드 완료')
      } catch (error) {
        console.error('❌ 사용자 데이터 로드 실패:', error)
      }
    },

    // 🌍 사용자 위치 업데이트 (외부에서 호출 가능)
    updateUserLocation(latitude, longitude) {
      console.log(`🌍 App: 사용자 위치 업데이트: (${latitude}, ${longitude})`)

      // collectionStore에 위치 설정 (자동으로 거리 계산됨)
      this.collectionStore.setUserLocation(latitude, longitude)

      // mapStore에도 현재 위치 설정
      this.mapStore.setCurrentLocation(latitude, longitude)

      this.uiStore.addNotification({
        message: '현재 위치가 업데이트되었습니다',
        type: 'success',
        duration: 2000
      })
    }
  }
}
</script>

<style>
/* 기존 스타일 유지 */
* {
  margin: 0 !important;
  padding: 0 !important;
  box-sizing: border-box;
}

html {
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

body {
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans KR", sans-serif;
  background: white;
}

#app {
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: 0;
  padding: 0;
  overflow: hidden;
  background: white;
  min-width: 100vw;
  min-height: 100vh;
}

/* ✅ 알림 시스템 스타일 */
.notifications-container {
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 3000;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 400px;
}

.notification {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  transition: all 0.3s ease;
  animation: slideInRight 0.3s ease-out;
}

.notification:hover {
  transform: translateX(-4px);
}

.notification.info {
  background: #e3f2fd;
  color: #1976d2;
  border-left: 4px solid #2196f3;
}

.notification.success {
  background: #e8f5e8;
  color: #2e7d32;
  border-left: 4px solid #4caf50;
}

.notification.warning {
  background: #fff8e1;
  color: #f57f17;
  border-left: 4px solid #ff9800;
}

.notification.error {
  background: #ffebee;
  color: #c62828;
  border-left: 4px solid #f44336;
}

.notification-message {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
}

.notification-close {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  margin-left: 8px;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.notification-close:hover {
  opacity: 1;
  background: rgba(0, 0, 0, 0.1);
}

/* ✅ 로딩 오버레이 스타일 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3500;
  backdrop-filter: blur(2px);
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 40px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.loading-spinner {
  font-size: 32px;
  animation: spin 2s linear infinite;
}

.loading-text {
  font-size: 16px;
  color: #666;
  font-weight: 500;
}

/* 기존 전역 스타일 유지 */
.btn {
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  outline: none;
}

.btn:hover {
  transform: translateY(-1px);
}

.btn:active {
  transform: translateY(0);
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 애니메이션 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.fade-in {
  animation: fadeIn 0.3s ease-out;
}

.loading-spinner {
  animation: spin 1s linear infinite;
}

/* 반응형 */
.mobile-only {
  display: none;
}

.desktop-only {
  display: block;
}

@media (max-width: 768px) {
  .mobile-only {
    display: block;
  }

  .desktop-only {
    display: none;
  }

  .notifications-container {
    right: 10px;
    left: 10px;
    max-width: none;
  }

  .notification {
    padding: 10px 12px;
  }

  .notification-message {
    font-size: 13px;
  }
}

/* 텍스트 유틸리티 */
.text-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.text-center {
  text-align: center;
}

.text-left {
  text-align: left;
}

.text-right {
  text-align: right;
}
</style>