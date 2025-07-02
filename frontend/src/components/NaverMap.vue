<template>
  <div class="map-container">
    <!-- 지도 영역 (전체 화면) -->
    <div class="map-wrapper">
      <div id="map" class="map"></div>
    </div>

    <!-- 사이드바 (지도 위 오버레이) -->
    <div class="sidebar">
      <!-- 왼쪽 네비게이션 메뉴 -->
      <div class="left-nav">
        <div class="nav-item" :class="{ active: activeTab === 'home' }" @click="activeTab = 'home'">
          <span class="nav-icon">🗺️</span>
          <span class="nav-text">지도홈</span>
        </div>
        <div class="nav-item" :class="{ active: activeTab === 'recent' }" @click="activeTab = 'recent'">
          <span class="nav-icon">🕒</span>
          <span class="nav-text">최근</span>
        </div>
        <div class="nav-item" :class="{ active: activeTab === 'saved' }" @click="activeTab = 'saved'">
          <span class="nav-icon">📂</span>
          <span class="nav-text">저장됨</span>
        </div>
      </div>

      <!-- 오른쪽 컨텐츠 영역 -->
      <div class="content-area">
        <!-- 검색 영역 -->
        <div class="search-section">
          <div class="search-box">
            <span class="search-icon">🔍</span>
            <input
                type="text"
                placeholder="장소, 버스, 지하철, 도로 검색"
                v-model="searchQuery"
                @keyup.enter="handleSearch"
                class="search-input"
            />
          </div>
        </div>

        <!-- 컨텐츠 영역 -->
        <div class="tab-content">
          <!-- 지도홈 탭 -->
          <div v-if="activeTab === 'home'" class="tab-panel">
            <!-- 카테고리 버튼 섹션 -->
            <div class="category-section">
              <div class="category-grid">
                <button
                    class="category-btn"
                    :class="{ active: activeCategory === 'clothing' }"
                    @click="toggleCategory('clothing')"
                >
                  <div class="category-icon">👕</div>
                  <div class="category-name">의류수거함</div>
                </button>

                <button
                    class="category-btn"
                    :class="{ active: activeCategory === 'battery' }"
                    @click="toggleCategory('battery')"
                >
                  <div class="category-icon">🔋</div>
                  <div class="category-name">폐건전지</div>
                </button>

                <button
                    class="category-btn"
                    :class="{ active: activeCategory === 'fluorescent' }"
                    @click="toggleCategory('fluorescent')"
                >
                  <div class="category-icon">💡</div>
                  <div class="category-name">형광등</div>
                </button>

                <button
                    class="category-btn"
                    :class="{ active: activeCategory === 'trash' }"
                    @click="toggleCategory('trash')"
                >
                  <div class="category-icon">🗑️</div>
                  <div class="category-name">공공쓰레기통</div>
                </button>
              </div>
            </div>
          </div>

          <!-- 최근 탭 -->
          <div v-if="activeTab === 'recent'" class="tab-panel">
            <div class="empty-state">
              <span class="empty-icon">🕒</span>
              <p class="empty-text">최근 검색 기록이 없습니다</p>
            </div>
          </div>

          <!-- 저장됨 탭 -->
          <div v-if="activeTab === 'saved'" class="tab-panel">
            <div class="saved-list">
              <div
                  v-if="markerList.length === 0"
                  class="empty-state"
              >
                <span class="empty-icon">📂</span>
                <p class="empty-text">저장된 장소가 없습니다</p>
              </div>
              <div
                  v-for="marker in markerList"
                  :key="marker.id"
                  class="saved-item"
                  @click="goToMarker(marker)"
              >
                <div class="saved-icon">📍</div>
                <div class="saved-info">
                  <div class="saved-title">{{ marker.title }}</div>
                  <div class="saved-description">{{ marker.description }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 하단 도구 영역 -->
        <div class="tools-section">
          <button class="tool-btn" @click="refreshData">
            <span class="tool-icon">🔄</span>
          </button>
          <button class="tool-btn" @click="resetView">
            <span class="tool-icon">🏠</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { markerAPI } from '../services/apiService'

export default {
  name: 'NaverMap',

  data() {
    return {
      map: null,
      markers: [], // 지도 위의 마커 객체들
      markerList: [], // 사이드바에 표시할 마커 목록
      markerCount: 0,
      isMapReady: false,
      searchQuery: '',
      activeTab: 'home',
      activeCategory: null // 활성화된 카테고리 상태
    }
  },

  async mounted() {
    console.log('🚀 네이버 지도 컴포넌트 시작 (읽기 전용)')

    // 지도 초기화
    this.initMap()

    // 서버에서 기존 마커 로드
    this.loadMarkersFromServer()
  },

  methods: {
    // 🗺️ 지도 초기화
    initMap() {
      this.waitForNaver()
    },

    waitForNaver() {
      if (window.naver && window.naver.maps) {
        console.log('✅ 네이버 지도 API 로드 완료')
        this.createMap()
      } else {
        console.log('⏳ 네이버 지도 API 로딩 중...')
        setTimeout(() => {
          this.waitForNaver()
        }, 100)
      }
    },

    async createMap() {
      try {
        console.log('🗺️ 지도 생성 중...')

        // 지도 옵션 (모든 컨트롤 숨김)
        const mapOptions = {
          center: new naver.maps.LatLng(37.5666805, 126.9784147), // 서울시청
          zoom: 12,
          mapTypeControl: false,    // 지도 타입 컨트롤 숨김
          scaleControl: false,      // 스케일 컨트롤 숨김
          logoControl: false,       // 로고 컨트롤 숨김
          mapDataControl: false,    // 지도 데이터 컨트롤 숨김
          zoomControl: false        // 확대/축소 컨트롤 숨김
        }

        // 지도 생성
        this.map = new naver.maps.Map('map', mapOptions)

        // 지도 로드 완료 이벤트
        naver.maps.Event.addListener(this.map, 'idle', () => {
          if (!this.isMapReady) {
            console.log('✅ 지도 로드 완료!')
            this.isMapReady = true
          }
        })

        console.log('✅ 지도 생성 완료!')

      } catch (error) {
        console.error('❌ 지도 생성 실패:', error)
      }
    },

    // 📍 서버에서 기존 마커들 로드 (읽기 전용)
    async loadMarkersFromServer() {
      try {
        console.log('📡 서버에서 마커들 로드 중...')

        const markerDataList = await markerAPI.getAllMarkers()
        this.markerList = markerDataList
        this.markerCount = markerDataList.length

        // 각 마커를 지도에 표시
        for (const markerData of markerDataList) {
          await this.addMarkerToMap(markerData)
        }

        console.log(`✅ ${markerDataList.length}개의 마커를 로드했습니다.`)

      } catch (error) {
        console.error('❌ 마커 로드 실패:', error)
        // 서버 연결 실패해도 조용히 처리
        this.markerList = []
        this.markerCount = 0
      }
    },

    // 🗺️ 지도에 마커 추가 (읽기 전용 - 정보 표시만)
    async addMarkerToMap(markerData) {
      if (!this.map || !this.isMapReady) {
        // 지도가 준비 안되면 잠시 후 재시도
        setTimeout(() => {
          this.addMarkerToMap(markerData)
        }, 500)
        return
      }

      try {
        console.log('🗺️ 지도에 마커 표시:', markerData.title)

        // 안전한 좌표 검증
        const lat = parseFloat(markerData.latitude)
        const lng = parseFloat(markerData.longitude)

        if (isNaN(lat) || isNaN(lng)) {
          console.error('❌ 잘못된 좌표:', markerData.latitude, markerData.longitude)
          return
        }

        // 네이버 지도 마커 생성
        const marker = new naver.maps.Marker({
          position: new naver.maps.LatLng(lat, lng),
          map: this.map,
          title: markerData.title || '마커'
        })

        // 정보창 생성 (읽기 전용 - 삭제 버튼 없음)
        const infoWindow = new naver.maps.InfoWindow({
          content: this.createInfoWindowContent(markerData),
          maxWidth: 300,
          backgroundColor: "#fff",
          borderColor: "#ccc",
          borderWidth: 1,
          anchorSize: new naver.maps.Size(10, 10)
        })

        // 마커 클릭 이벤트 (정보창만 표시)
        naver.maps.Event.addListener(marker, 'click', () => {
          try {
            // 다른 정보창들 닫기
            this.markers.forEach(m => {
              if (m.infoWindow && typeof m.infoWindow.close === 'function') {
                m.infoWindow.close()
              }
            })

            // 현재 정보창 열기
            if (typeof infoWindow.open === 'function') {
              infoWindow.open(this.map, marker)
            }
          } catch (error) {
            console.error('❌ 정보창 열기 실패:', error)
          }
        })

        // 마커 객체 저장
        const markerObj = {
          id: markerData.id,
          marker: marker,
          infoWindow: infoWindow,
          data: markerData
        }

        this.markers.push(markerObj)

      } catch (error) {
        console.error('❌ 마커 추가 실패:', error)
      }
    },

    // 📝 정보창 컨텐츠 생성 (읽기 전용 - 삭제 버튼 제거)
    createInfoWindowContent(markerData) {
      const createdAt = markerData.createdAt ?
          new Date(markerData.createdAt).toLocaleString() :
          '알 수 없음'

      return `
        <div style="padding: 15px; min-width: 200px;">
          <h4 style="margin: 0 0 10px 0; color: #333;">${markerData.title || '마커'}</h4>
          <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">${markerData.description || '설명 없음'}</p>
          <p style="margin: 0; color: #888; font-size: 12px;">
            📍 위도: ${parseFloat(markerData.latitude).toFixed(6)}<br>
            📍 경도: ${parseFloat(markerData.longitude).toFixed(6)}<br>
            🕐 생성: ${createdAt}
          </p>
        </div>
      `
    },

    // 검색 처리
    handleSearch() {
      if (this.searchQuery.trim()) {
        console.log('🔍 검색 요청:', this.searchQuery)
        // TODO: 검색 기능 구현
      }
    },

    // 카테고리 토글 함수
    toggleCategory(category) {
      if (this.activeCategory === category) {
        this.activeCategory = null;
        console.log(`${category} 카테고리 비활성화`);
        // TODO: 마커 필터링 해제
      } else {
        this.activeCategory = category;
        console.log(`${category} 카테고리 활성화`);
        // TODO: 해당 카테고리 마커만 표시
      }
    },

    // 마커로 이동
    goToMarker(marker) {
      console.log('📍 마커로 이동:', marker.title)
      if (this.map && this.isMapReady) {
        const pos = new naver.maps.LatLng(marker.latitude, marker.longitude)
        this.map.setCenter(pos)
        this.map.setZoom(15)

        // 해당 마커의 정보창 표시
        this.showMarkerInfo(marker.id)
      }
    },

    // 마커 정보창 표시
    showMarkerInfo(markerId) {
      const markerObj = this.markers.find(m => m.id == markerId)
      if (markerObj && markerObj.infoWindow) {
        console.log('📍 마커 정보창 표시:', markerId)

        // 다른 정보창들 닫기
        this.markers.forEach(m => {
          if (m.infoWindow && m.id != markerId) {
            m.infoWindow.close()
          }
        })

        // 해당 마커의 정보창 열기
        markerObj.infoWindow.open(this.map, markerObj.marker)
      }
    },

    // 데이터 새로고침
    async refreshData() {
      console.log('🔄 새로고침 중...')

      try {
        // 기존 마커들 지도에서 제거
        this.markers.forEach(markerObj => {
          if (markerObj.infoWindow && typeof markerObj.infoWindow.close === 'function') {
            markerObj.infoWindow.close()
          }
          if (markerObj.marker && typeof markerObj.marker.setMap === 'function') {
            markerObj.marker.setMap(null)
          }
        })
        this.markers = []
        this.markerList = []
        this.markerCount = 0

        // 서버에서 다시 로드
        await this.loadMarkersFromServer()

        console.log('✅ 새로고침 완료')
      } catch (error) {
        console.error('❌ 새로고침 실패:', error)
      }
    },

    // 홈으로 이동
    resetView() {
      console.log('🏠 홈으로 이동')
      if (this.map && this.isMapReady) {
        // 서울시청으로 이동
        const pos = new naver.maps.LatLng(37.5666805, 126.9784147)
        this.map.setCenter(pos)
        this.map.setZoom(12)
      }
    },

    // 날짜 포맷팅
    formatDate(dateString) {
      if (!dateString) return '날짜 없음'

      const date = new Date(dateString)
      const now = new Date()
      const diffMs = now - date
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffDays = Math.floor(diffHours / 24)

      if (diffHours < 1) return '방금 전'
      if (diffHours < 24) return `${diffHours}시간 전`
      if (diffDays < 7) return `${diffDays}일 전`

      return date.toLocaleDateString('ko-KR')
    }
  }
}
</script>

<style scoped>
.map-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

/* 지도 영역 (전체 화면) */
.map-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 1;
}

.map {
  width: 100%;
  height: 100%;
}

/* 사이드바 (지도 위 오버레이) */
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 380px;
  height: 100vh;
  background: white;
  display: flex;
  z-index: 1000;
  border: none;
  border-radius: 0;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* 왼쪽 네비게이션 */
.left-nav {
  width: 80px;
  background: #f8f9fa;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  padding: 20px 0;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 8px;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 0;
  margin: 4px 8px;
  border-radius: 8px;
}

.nav-item:hover {
  background: #e3f2fd;
}

.nav-item.active {
  background: #4285f4;
  color: white;
}

.nav-item.active .nav-text {
  color: white;
}

.nav-icon {
  font-size: 20px;
  margin-bottom: 6px;
}

.nav-text {
  font-size: 10px;
  color: #666;
  font-weight: 500;
  text-align: center;
}

/* 오른쪽 컨텐츠 영역 */
.content-area {
  width: 300px;
  display: flex;
  flex-direction: column;
  background: white;
}

/* 검색 영역 */
.search-section {
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
  background: white;
}

.search-box {
  display: flex;
  align-items: center;
  border: 1px solid #e0e0e0;
  border-radius: 24px;
  padding: 12px 16px;
  background: #f8f9fa;
  transition: all 0.2s;
}

.search-box:focus-within {
  border-color: #4285f4;
  background: white;
  box-shadow: 0 2px 8px rgba(66, 133, 244, 0.1);
}

.search-icon {
  font-size: 16px;
  color: #666;
  margin-right: 12px;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 14px;
  outline: none;
  color: #333;
}

.search-input::placeholder {
  color: #999;
}

/* 탭 컨텐츠 */
.tab-content {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: calc(100vh - 160px);
}

.tab-panel {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 카테고리 섹션 */
.category-section {
  width: 100%;
  max-width: 280px;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  width: 100%;
}

.category-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px 12px;
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  height: 100px;
  position: relative;
}

.category-btn:hover {
  background: #e3f2fd;
  border-color: #4285f4;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(66, 133, 244, 0.15);
}

.category-btn.active {
  background: #4285f4;
  border-color: #4285f4;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(66, 133, 244, 0.25);
}

.category-icon {
  font-size: 28px;
  margin-bottom: 8px;
  transition: transform 0.2s ease;
}

.category-btn:hover .category-icon {
  transform: scale(1.05);
}

.category-btn.active .category-icon {
  transform: scale(1.05);
}

.category-name {
  font-size: 12px;
  font-weight: 500;
  text-align: center;
  line-height: 1.2;
  color: #333;
  transition: color 0.2s ease;
}

.category-btn.active .category-name {
  color: white;
  font-weight: 600;
}

/* 저장된 장소 리스트 */
.saved-list {
  height: 100%;
  overflow-y: auto;
}

.saved-item {
  display: flex;
  align-items: flex-start;
  padding: 16px;
  cursor: pointer;
  border-bottom: 1px solid #f5f5f5;
  transition: background 0.2s;
  margin-bottom: 8px;
  border-radius: 8px;
}

.saved-item:hover {
  background: #f8f9fa;
}

.saved-icon {
  font-size: 16px;
  margin-right: 12px;
  margin-top: 2px;
  color: #4285f4;
}

.saved-info {
  flex: 1;
  min-width: 0;
}

.saved-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.saved-description {
  font-size: 12px;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 빈 상태 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
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
  margin: 0;
}

/* 도구 영역 */
.tools-section {
  padding: 16px 20px;
  background: #f8f9fa;
  display: flex;
  justify-content: center;
  gap: 12px;
  border-top: 1px solid #f0f0f0;
}

.tool-btn {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.tool-btn:hover {
  background: #f0f0f0;
  border-color: #ccc;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.tool-icon {
  font-size: 18px;
}

/* 스크롤바 제거 */
.tab-content::-webkit-scrollbar,
.saved-list::-webkit-scrollbar {
  display: none;
}

.tab-content,
.saved-list {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* 반응형 디자인 */
@media (max-width: 1024px) {
  .sidebar {
    width: 340px;
  }

  .content-area {
    width: 260px;
  }

  .map-wrapper {
    margin-left: 340px;
    width: calc(100vw - 340px);
  }
}

@media (max-width: 768px) {
  .sidebar {
    width: 300px;
  }

  .left-nav {
    width: 70px;
  }

  .content-area {
    width: 230px;
  }

  .map-wrapper {
    margin-left: 300px;
    width: calc(100vw - 300px);
  }

  .nav-text {
    font-size: 9px;
  }

  .search-section {
    padding: 15px;
  }

  .tab-content {
    padding: 15px;
  }
}

@media (max-width: 480px) {
  .sidebar {
    width: 100vw;
    height: 60vh;
    position: fixed;
    top: 40vh;
    left: 0;
    transform: translateY(0);
    transition: transform 0.3s;
  }

  .map-wrapper {
    margin-left: 0;
    width: 100vw;
    height: 40vh;
  }

  .left-nav {
    width: 60px;
    padding: 15px 0;
  }

  .content-area {
    width: calc(100vw - 60px);
  }

  .nav-item {
    padding: 12px 4px;
    margin: 2px 4px;
  }

  .nav-icon {
    font-size: 18px;
    margin-bottom: 4px;
  }

  .nav-text {
    font-size: 8px;
  }

  .search-section {
    padding: 12px;
  }

  .tab-content {
    padding: 12px;
    max-height: calc(60vh - 120px);
  }
}
</style>