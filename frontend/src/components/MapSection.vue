<template>
  <div class="map-section">
    <div id="map" class="map"></div>
  </div>
</template>

<script>
// ✅ mapStore import 추가
import { useMapStore } from '../stores/mapStore.js'

export default {
  name: 'MapSection',

  emits: ['map-ready', 'markers-updated'],

  // ✅ mapStore 사용 설정
  setup() {
    const mapStore = useMapStore()
    return {
      mapStore
    }
  },

  mounted() {
    console.log('🗺️ 지도 섹션 컴포넌트 시작')
    this.initMap()
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

        const mapOptions = {
          center: new naver.maps.LatLng(37.5666805, 126.9784147),
          zoom: 12,
          mapTypeControl: false,
          scaleControl: false,
          logoControl: false,
          mapDataControl: false,
          zoomControl: false,
          size: new naver.maps.Size(
              document.getElementById('map').offsetWidth,
              document.getElementById('map').offsetHeight
          )
        }

        const map = new naver.maps.Map('map', mapOptions)

        // ✅ mapStore에 지도 인스턴스 저장
        this.mapStore.setMapInstance(map)

        // 지도 크기 강제 조정
        setTimeout(() => {
          if (map && typeof map.refresh === 'function') {
            map.refresh()
          }
        }, 100)

        naver.maps.Event.addListener(map, 'idle', () => {
          if (!this.mapStore.isMapReady) {
            console.log('✅ 지도 로드 완료!')

            // ✅ mapStore에 준비 상태 설정
            this.mapStore.setMapReady(true)

            // 부모 컴포넌트에 알림
            this.$emit('map-ready')

            // ✅ mapStore를 통해 마커 로드
            this.loadMarkersFromServer()
          }
        })

        console.log('✅ 지도 생성 완료!')

      } catch (error) {
        console.error('❌ 지도 생성 실패:', error)
      }
    },

    // ✅ mapStore를 통한 마커 로드
    async loadMarkersFromServer() {
      try {
        console.log('📡 MapSection: 마커 로드 시작')

        // mapStore를 통해 마커 로드
        await this.mapStore.loadMarkersFromServer()

        // 부모 컴포넌트에 마커 업데이트 알림
        this.$emit('markers-updated', this.mapStore.markerData)

        console.log('✅ MapSection: 마커 로드 완료')

      } catch (error) {
        console.error('❌ MapSection: 마커 로드 실패:', error)
      }
    },

    // ✅ 외부에서 호출 가능한 메서드들 - mapStore 위임
    async refreshMarkers() {
      console.log('🔄 MapSection: 마커 새로고침')

      try {
        await this.mapStore.refreshMarkers()
        this.$emit('markers-updated', this.mapStore.markerData)
        console.log('✅ MapSection: 마커 새로고침 완료')
      } catch (error) {
        console.error('❌ MapSection: 마커 새로고침 실패:', error)
      }
    },

    // ✅ 특정 위치로 이동 - mapStore 위임
    moveToLocation(lat, lng, zoom = 15) {
      console.log(`📍 MapSection: 위치 이동 요청 (${lat}, ${lng})`)
      this.mapStore.moveToLocation(lat, lng, zoom)
    },

    // ✅ 지도 초기 위치로 리셋 - mapStore 위임
    resetView() {
      console.log('🏠 MapSection: 지도 리셋')
      this.mapStore.resetView()
    },

    // ✅ 마커 정보창 표시 - mapStore 위임
    showMarkerInfo(markerId) {
      console.log('📍 MapSection: 마커 정보창 표시 요청:', markerId)
      this.mapStore.showMarkerInfo(markerId)
    },

    // ✅ 여러 마커 추가 (새로운 기능)
    async addMultipleMarkers(markerDataList) {
      console.log('📌 MapSection: 여러 마커 추가:', markerDataList.length + '개')

      for (const markerData of markerDataList) {
        await this.mapStore.addMarkerToMap(markerData)
      }

      this.$emit('markers-updated', this.mapStore.markerData)
    },

    // ✅ 카테고리별 마커 필터링
    filterMarkersByCategory(category) {
      console.log('🔍 MapSection: 마커 필터링:', category)
      this.mapStore.filterMarkersByCategory(category)
    },

    // ✅ 가장 가까운 마커 찾기
    findNearestMarker(lat, lng) {
      console.log('📍 MapSection: 가장 가까운 마커 찾기')
      return this.mapStore.findNearestMarker(lat, lng)
    }
  }
}
</script>

<style scoped>
.map-section {
  position: fixed;
  top: 60px; /* 상단 네비바 높이 */
  left: 380px; /* 왼쪽 사이드바 너비 */
  right: 0;
  bottom: 0;
  background: white;
  overflow: hidden;
}

.map {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  border: none;
  display: block;
  background: white;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .map-section {
    top: 50px; /* 모바일용 상단 네비바 높이 */
    left: 280px; /* 모바일용 사이드바 너비 */
  }
}

@media (max-width: 480px) {
  .map-section {
    top: 50px;
    left: 0;
    bottom: 40vh; /* 모바일에서는 하단에 사이드바가 올라옴 */
  }
}
</style>