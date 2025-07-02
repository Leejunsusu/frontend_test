<template>
  <div class="map-section">
    <div id="map" class="map"></div>
  </div>
</template>

<script>
import { markerAPI } from '../services/apiService'

export default {
  name: 'MapSection',

  emits: ['map-ready', 'markers-updated'],

  data() {
    return {
      map: null,
      markers: [],
      markerData: [],
      isMapReady: false
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

        this.map = new naver.maps.Map('map', mapOptions)

        // 지도 크기 강제 조정
        setTimeout(() => {
          if (this.map && typeof this.map.refresh === 'function') {
            this.map.refresh()
          }
        }, 100)

        naver.maps.Event.addListener(this.map, 'idle', () => {
          if (!this.isMapReady) {
            console.log('✅ 지도 로드 완료!')
            this.isMapReady = true
            this.$emit('map-ready')
            this.loadMarkersFromServer()
          }
        })

        // 윈도우 리사이즈 이벤트 추가
        window.addEventListener('resize', () => {
          if (this.map && typeof this.map.refresh === 'function') {
            setTimeout(() => {
              this.map.refresh()
            }, 100)
          }
        })

        console.log('✅ 지도 생성 완료!')

      } catch (error) {
        console.error('❌ 지도 생성 실패:', error)
      }
    },

    // 📍 서버에서 마커들 로드
    async loadMarkersFromServer() {
      if (!this.isMapReady) {
        console.log('⏳ 지도 준비 중... 마커 로드 대기')
        return
      }

      try {
        console.log('📡 서버에서 마커들 로드 중...')

        const markerDataList = await markerAPI.getAllMarkers()
        this.markerData = markerDataList

        for (const markerData of markerDataList) {
          await this.addMarkerToMap(markerData)
        }

        console.log(`✅ ${markerDataList.length}개의 마커를 로드했습니다.`)
        this.notifyMarkersUpdated()

      } catch (error) {
        console.error('❌ 마커 로드 실패:', error)
        this.markerData = []
      }
    },

    // 🗺️ 지도에 마커 추가
    async addMarkerToMap(markerData) {
      if (!this.map || !this.isMapReady) {
        console.log('⚠️ 지도 준비 안됨 - 마커 추가 대기')
        return
      }

      try {
        console.log('🗺️ 지도에 마커 표시:', markerData.title)

        const lat = parseFloat(markerData.latitude)
        const lng = parseFloat(markerData.longitude)

        if (isNaN(lat) || isNaN(lng)) {
          console.error('❌ 잘못된 좌표:', markerData.latitude, markerData.longitude)
          return
        }

        const marker = new naver.maps.Marker({
          position: new naver.maps.LatLng(lat, lng),
          map: this.map,
          title: markerData.title || '마커'
        })

        const infoWindow = new naver.maps.InfoWindow({
          content: this.createInfoWindowContent(markerData),
          maxWidth: 300,
          backgroundColor: "#fff",
          borderColor: "#ccc",
          borderWidth: 1,
          anchorSize: new naver.maps.Size(10, 10)
        })

        naver.maps.Event.addListener(marker, 'click', () => {
          try {
            this.markers.forEach(m => {
              if (m.infoWindow && typeof m.infoWindow.close === 'function') {
                m.infoWindow.close()
              }
            })

            if (typeof infoWindow.open === 'function') {
              infoWindow.open(this.map, marker)
            }
          } catch (error) {
            console.error('❌ 정보창 열기 실패:', error)
          }
        })

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

    // 📝 정보창 컨텐츠 생성
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

    // 🔄 마커 새로고침
    async refreshMarkers() {
      console.log('🔄 지도섹션: 마커 새로고침 중...')

      try {
        this.markers.forEach(markerObj => {
          if (markerObj.infoWindow && typeof markerObj.infoWindow.close === 'function') {
            markerObj.infoWindow.close()
          }
          if (markerObj.marker && typeof markerObj.marker.setMap === 'function') {
            markerObj.marker.setMap(null)
          }
        })
        this.markers = []
        this.markerData = []

        await this.loadMarkersFromServer()

        console.log('✅ 새로고침 완료')
        this.notifyMarkersUpdated()

      } catch (error) {
        console.error('❌ 새로고침 실패:', error)
      }
    },

    // 📍 특정 위치로 이동
    moveToLocation(lat, lng, zoom = 15) {
      if (this.map && this.isMapReady) {
        console.log(`📍 지도섹션: 위치 이동 (${lat}, ${lng})`)
        const location = new naver.maps.LatLng(lat, lng)
        this.map.setCenter(location)
        this.map.setZoom(zoom)
      }
    },

    // 🏠 지도 초기 위치로 리셋
    resetView() {
      console.log('🏠 지도섹션: 지도 리셋')
      if (this.map && this.isMapReady) {
        const pos = new naver.maps.LatLng(37.5666805, 126.9784147)
        this.map.setCenter(pos)
        this.map.setZoom(12)
      }
    },

    // 📍 마커 정보창 표시
    showMarkerInfo(markerId) {
      const markerObj = this.markers.find(m => m.id == markerId)
      if (markerObj && markerObj.infoWindow) {
        console.log('📍 지도섹션: 마커 정보창 표시:', markerId)

        this.markers.forEach(m => {
          if (m.infoWindow && m.id != markerId) {
            m.infoWindow.close()
          }
        })

        markerObj.infoWindow.open(this.map, markerObj.marker)
      }
    },

    // 📡 마커 목록 변경시 부모에게 알림
    notifyMarkersUpdated() {
      this.$emit('markers-updated', this.markerData)
    }
  }
}
</script>

<style scoped>
.map-section {
  flex: 1;
  height: 100vh;
  width: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
  background: white;
  position: relative;
}

.map {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  border: none;
  display: block;
  background: white;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
</style>