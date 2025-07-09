// stores/mapStore.js - 지도 관련 상태 관리 (UI 연동 추가)
import { defineStore } from 'pinia'
import { markerAPI } from '../services/apiService.js'
import { useUIStore } from './uiStore.js'
import { useCollectionStore } from './collectionStore.js'

export const useMapStore = defineStore('map', {
    state: () => ({
        // 🗺️ 지도 기본 상태
        isMapReady: false,
        mapInstance: null,

        // 📍 위치 관련
        currentLocation: {
            lat: 37.5666805,
            lng: 126.9784147
        },

        // 📌 마커 관련
        markers: [],
        markerData: [],
        selectedMarkerId: null,

        // 🎯 지도 설정
        mapCenter: {
            lat: 37.5666805,
            lng: 126.9784147
        },
        zoomLevel: 12,

        // 🔄 로딩 상태
        isLoadingMarkers: false
    }),

    getters: {
        // 📊 계산된 값들
        markersCount: (state) => state.markers.length,

        hasSelectedMarker: (state) => !!state.selectedMarkerId,

        selectedMarker: (state) => {
            if (!state.selectedMarkerId) return null
            return state.markerData.find(m => m.id === state.selectedMarkerId)
        },

        visibleMarkers: (state) => {
            // 현재 지도 영역에 보이는 마커들만 반환
            return state.markers.filter(marker => marker.isVisible !== false)
        }
    },

    actions: {
        // 🗺️ 지도 초기화 관련
        setMapReady(ready) {
            console.log('🗺️ [Map Store] 지도 준비 상태:', ready)
            this.isMapReady = ready
        },

        setMapInstance(mapInstance) {
            console.log('🗺️ [Map Store] 지도 인스턴스 설정')
            this.mapInstance = mapInstance
        },

        // 📍 위치 관련 액션
        setCurrentLocation(lat, lng) {
            console.log(`📍 [Map Store] 현재 위치 설정: (${lat}, ${lng})`)
            this.currentLocation = { lat, lng }
        },

        moveToLocation(lat, lng, zoom = 15) {
            console.log(`🎯 [Map Store] 지도 이동: (${lat}, ${lng}), 줌: ${zoom}`)

            this.mapCenter = { lat, lng }
            this.zoomLevel = zoom

            // 실제 지도 인스턴스가 있으면 이동
            if (this.mapInstance && this.isMapReady) {
                try {
                    const location = new naver.maps.LatLng(lat, lng)
                    this.mapInstance.setCenter(location)
                    this.mapInstance.setZoom(zoom)
                } catch (error) {
                    console.error('❌ [Map Store] 지도 이동 실패:', error)
                }
            }
        },

        resetView() {
            console.log('🏠 [Map Store] 지도 뷰 리셋')
            this.moveToLocation(37.5666805, 126.9784147, 12)
        },

        setZoomLevel(zoom) {
            console.log('🔍 [Map Store] 줌 레벨 설정:', zoom)
            this.zoomLevel = zoom

            if (this.mapInstance && this.isMapReady) {
                this.mapInstance.setZoom(zoom)
            }
        },

        // 📌 마커 관련 액션
        async loadMarkersFromServer() {
            if (!this.isMapReady) {
                console.log('⏳ [Map Store] 지도 준비 중... 마커 로드 대기')
                return
            }

            this.isLoadingMarkers = true

            try {
                console.log('📡 [Map Store] 서버에서 마커들 로드 중...')

                const markerDataList = await markerAPI.getAllMarkers()
                this.markerData = markerDataList

                console.log(`✅ [Map Store] ${markerDataList.length}개의 마커 데이터 로드 완료`)

                // 기존 마커들 제거
                this.clearMarkers()

                // 새 마커들 추가
                for (const markerData of markerDataList) {
                    await this.addMarkerToMap(markerData)
                }

                console.log(`✅ [Map Store] ${this.markers.length}개의 마커를 지도에 표시 완료`)

            } catch (error) {
                console.error('❌ [Map Store] 마커 로드 실패:', error)
                this.markerData = []

                if (error.message.includes('서버에 연결할 수 없습니다')) {
                    console.error('🌐 [Map Store] 백엔드 서버 연결 문제')
                }
            } finally {
                this.isLoadingMarkers = false
            }
        },

        async addMarkerToMap(markerData) {
            if (!this.mapInstance || !this.isMapReady) {
                console.log('⚠️ [Map Store] 지도 준비 안됨 - 마커 추가 대기')
                return
            }

            try {
                console.log('📌 [Map Store] 마커 추가:', markerData.title)

                const lat = parseFloat(markerData.latitude)
                const lng = parseFloat(markerData.longitude)

                if (isNaN(lat) || isNaN(lng)) {
                    console.error('❌ [Map Store] 잘못된 좌표:', markerData.latitude, markerData.longitude)
                    return
                }

                // 네이버 지도 마커 생성
                const marker = new naver.maps.Marker({
                    position: new naver.maps.LatLng(lat, lng),
                    map: this.mapInstance,
                    title: markerData.title || '마커'
                })

                // ✅ 정보창 제거 - 마커 클릭시 바로 정보 패널만 열림
                // ✅ 마커 클릭 이벤트 - UI Store와 연동 (정보창 없이)
                naver.maps.Event.addListener(marker, 'click', () => {
                    this.handleMarkerClick(markerData.id, null, marker, markerData)
                })

                // 마커 객체 저장 (정보창 없이)
                const markerObj = {
                    id: markerData.id,
                    marker: marker,
                    infoWindow: null, // ✅ 정보창 제거
                    data: markerData,
                    isVisible: true
                }

                this.markers.push(markerObj)

            } catch (error) {
                console.error('❌ [Map Store] 마커 추가 실패:', error)
            }
        },

        // ✅ 마커 클릭 처리 - 정보창 없이 바로 패널 열기
        handleMarkerClick(markerId, infoWindow, marker, markerData) {
            try {
                console.log('📌 [Map Store] 마커 클릭:', markerId)

                // ✅ 정보창 관련 코드 제거
                // 선택된 마커 설정
                this.selectedMarkerId = markerId

                // ✅ UI Store와 Collection Store 연동
                const uiStore = useUIStore()
                const collectionStore = useCollectionStore()

                // 마커 데이터를 의류수거함 형태로 변환
                const collection = this.convertMarkerToCollection(markerData)

                // CollectionStore에 선택된 수거함 설정
                collectionStore.selectCollection(collection)

                // ✅ CollectionInfoPanel 열기 (정보창 없이)
                uiStore.openCollectionInfoPanel(collection)

                console.log('✅ [Map Store] 마커 클릭 처리 완료 - 정보 패널만 열림')

            } catch (error) {
                console.error('❌ [Map Store] 마커 클릭 처리 실패:', error)
            }
        },

        // ✅ 마커 데이터를 의류수거함 데이터로 변환
        convertMarkerToCollection(markerData) {
            const collectionStore = useCollectionStore()

            // 거리 계산
            let distance = '계산 중...'
            if (collectionStore.userLocation && markerData.latitude && markerData.longitude) {
                const calculatedDistance = collectionStore.calculateDistance(
                    collectionStore.userLocation.latitude,
                    collectionStore.userLocation.longitude,
                    markerData.latitude,
                    markerData.longitude
                )

                distance = calculatedDistance < 1
                    ? `${Math.round(calculatedDistance * 1000)}M`
                    : `${calculatedDistance.toFixed(1)}KM`
            }

            return {
                id: markerData.id,
                address: markerData.title || '제목 없음',
                detailAddress: markerData.description || '설명 없음',
                distance: distance,
                category: markerData.category || 'all',
                latitude: markerData.latitude,
                longitude: markerData.longitude,
                isBookmarked: collectionStore.bookmarkedIds.has(markerData.id),
                isFavorite: false,
                rating: null,
                createdAt: markerData.createdAt,
                createdBy: markerData.createdByEmail || '정보 없음'
            }
        },

        showMarkerInfo(markerId) {
            const markerObj = this.markers.find(m => m.id == markerId)
            if (markerObj) {
                console.log('📍 [Map Store] 마커 정보 표시:', markerId)

                // 선택된 마커 설정
                this.selectedMarkerId = markerId

                // ✅ 정보창 없이 바로 UI Store 연동
                const uiStore = useUIStore()
                const collection = this.convertMarkerToCollection(markerObj.data)
                uiStore.openCollectionInfoPanel(collection)
            }
        },

        clearMarkers() {
            console.log('🧹 [Map Store] 기존 마커들 제거')

            this.markers.forEach(markerObj => {
                // ✅ 정보창 관련 코드 제거
                if (markerObj.marker && typeof markerObj.marker.setMap === 'function') {
                    markerObj.marker.setMap(null)
                }
            })

            this.markers = []
            this.selectedMarkerId = null
        },

        async refreshMarkers() {
            console.log('🔄 [Map Store] 마커 새로고침')

            try {
                this.clearMarkers()
                await this.loadMarkersFromServer()
                console.log('✅ [Map Store] 마커 새로고침 완료')
            } catch (error) {
                console.error('❌ [Map Store] 마커 새로고침 실패:', error)
            }
        },

        // ✅ 정보창 생성 함수 제거됨 (더 이상 사용하지 않음)
        // createInfoWindowContent() 함수는 제거되었습니다

        // 📊 통계 및 분석
        getMarkersInBounds(bounds) {
            // 특정 영역 내의 마커들 반환
            return this.markers.filter(marker => {
                const lat = marker.data.latitude
                const lng = marker.data.longitude
                return lat >= bounds.minLat && lat <= bounds.maxLat &&
                    lng >= bounds.minLng && lng <= bounds.maxLng
            })
        },

        // 🎯 마커 필터링
        filterMarkersByCategory(category) {
            console.log('🔍 [Map Store] 카테고리별 마커 필터링:', category)

            this.markers.forEach(markerObj => {
                const shouldShow = category === 'all' || markerObj.data.category === category
                markerObj.isVisible = shouldShow

                if (markerObj.marker) {
                    markerObj.marker.setVisible(shouldShow)
                }
            })
        },

        // 📍 가장 가까운 마커 찾기
        findNearestMarker(lat, lng) {
            if (this.markers.length === 0) return null

            let nearestMarker = null
            let minDistance = Infinity

            this.markers.forEach(markerObj => {
                const distance = this.calculateDistance(
                    lat, lng,
                    markerObj.data.latitude,
                    markerObj.data.longitude
                )

                if (distance < minDistance) {
                    minDistance = distance
                    nearestMarker = markerObj
                }
            })

            return nearestMarker
        },

        // 📏 거리 계산 (Haversine 공식)
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
        }
    }
})