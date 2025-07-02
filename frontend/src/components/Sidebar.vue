<template>
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
              <button class="category-btn">
                <div class="category-icon">👕</div>
                <div class="category-name">의류수거함</div>
              </button>

              <button class="category-btn">
                <div class="category-icon">🔋</div>
                <div class="category-name">폐건전지</div>
              </button>

              <button class="category-btn">
                <div class="category-icon">💡</div>
                <div class="category-name">형광등</div>
              </button>

              <button class="category-btn">
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
        <button class="tool-btn" @click="refreshData" title="새로고침">
          <span class="tool-icon">🔄</span>
        </button>
        <button class="tool-btn" @click="resetView" title="홈으로">
          <span class="tool-icon">🏠</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Sidebar',

  props: {
    markerCount: {
      type: Number,
      default: 0
    },
    markerList: {
      type: Array,
      default: () => []
    }
  },

  emits: ['go-to-marker', 'refresh', 'reset-view'],

  data() {
    return {
      searchQuery: '',
      activeTab: 'home'
    }
  },

  methods: {
    // 📍 마커로 이동
    goToMarker(marker) {
      console.log('📍 사이드바: 마커로 이동:', marker.title)
      this.$emit('go-to-marker', marker)
    },

    // 🔄 데이터 새로고침
    refreshData() {
      console.log('🔄 사이드바: 새로고침 요청')
      this.$emit('refresh')
    },

    // 🏠 홈으로 이동
    resetView() {
      console.log('🏠 사이드바: 홈으로 이동 요청')
      this.$emit('reset-view')
    }
  }
}
</script>

<style scoped>
.sidebar {
  width: 380px;
  height: 100vh;
  background: white;
  display: flex;
  flex-shrink: 0;
  margin: 0;
  padding: 0;
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
}

.category-btn:hover {
  background: #e3f2fd;
  border-color: #4285f4;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(66, 133, 244, 0.15);
}

.category-icon {
  font-size: 28px;
  margin-bottom: 8px;
  transition: transform 0.2s ease;
}

.category-btn:hover .category-icon {
  transform: scale(1.05);
}

.category-name {
  font-size: 12px;
  font-weight: 500;
  text-align: center;
  line-height: 1.2;
  color: #333;
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
</style>