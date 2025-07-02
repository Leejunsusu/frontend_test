<template>
  <div id="app">
    <!-- 사이드바 컴포넌트 -->
    <Sidebar
        :marker-count="markerCount"
        :marker-list="markerList"
        @go-to-marker="handleGoToMarker"
        @refresh="handleRefresh"
        @reset-view="handleResetView"
    />

    <!-- 지도 컴포넌트 -->
    <MapSection
        ref="mapSection"
        @map-ready="onMapReady"
        @markers-updated="onMarkersUpdated"
    />
  </div>
</template>

<script>
import Sidebar from './components/Sidebar.vue'
import MapSection from './components/MapSection.vue'

export default {
  name: 'App',

  components: {
    Sidebar,
    MapSection
  },

  data() {
    return {
      markerCount: 0,
      markerList: [],
      isMapReady: false
    }
  },

  mounted() {
    console.log('🚀 Vue 애플리케이션 시작')
  },

  methods: {
    // 🗺️ 지도 준비 완료
    onMapReady() {
      console.log('✅ App: 지도 준비 완료')
      this.isMapReady = true
    },

    // 📍 마커 목록 업데이트
    onMarkersUpdated(markers) {
      console.log('📊 App: 마커 목록 업데이트:', markers.length + '개')
      this.markerList = markers
      this.markerCount = markers.length
    },

    // 📍 마커로 이동
    handleGoToMarker(marker) {
      console.log('📍 App: 마커로 이동 요청:', marker.title)
      if (this.isMapReady) {
        this.$refs.mapSection.moveToLocation(marker.latitude, marker.longitude)
        this.$refs.mapSection.showMarkerInfo(marker.id)
      }
    },

    // 🔄 데이터 새로고침
    async handleRefresh() {
      console.log('🔄 App: 새로고침 요청')
      if (this.isMapReady) {
        await this.$refs.mapSection.refreshMarkers()
      }
    },

    // 🏠 지도 초기 위치로 리셋
    handleResetView() {
      console.log('🏠 App: 지도 리셋 요청')
      if (this.isMapReady) {
        this.$refs.mapSection.resetView()
      }
    }
  }
}
</script>

<style>
/* 완전한 전체 화면 강제 설정 */
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
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background: white;
}

#app {
  width: 100vw;
  height: 100vh;
  display: flex;
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
</style>