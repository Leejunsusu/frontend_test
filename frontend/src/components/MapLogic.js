// src/components/MapLogic.js - 확장 가능한 비즈니스 로직
import { markerAPI } from '../services/apiService'

export class MapLogic {
    constructor() {
        this.serverConnected = false
        this.markerData = []
        this.categories = ['clothing', 'battery', 'fluorescent', 'trash']

        // 🏠 즐겨찾기 위치 정보 (향후 확장용)
        this.favoriteLocations = {
            home: { lat: 37.5666805, lng: 126.9784147, name: '집' },
            work: { lat: 37.5663174, lng: 126.9779451, name: '회사' },
            school: { lat: 37.5658049, lng: 126.9754228, name: '학교' },
            bookmark: { lat: 37.5651056, lng: 126.9746067, name: '즐겨찾기' }
        }

        console.log('🔧 MapLogic 인스턴스 생성됨')
    }

    // 🔧 서버 연결 테스트
    async testServerConnection() {
        try {
            console.log('🔧 MapLogic: 서버 연결 테스트 시작...')

            // 타임아웃으로 빠른 실패 처리
            const connectionResult = await Promise.race([
                markerAPI.testConnection(),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('연결 타임아웃')), 3000)
                )
            ])

            this.serverConnected = connectionResult

            if (this.serverConnected) {
                console.log('✅ MapLogic: 서버 연결 성공!')
                await this.loadMarkerData()
            } else {
                console.log('❌ MapLogic: 서버 연결 실패')
            }

            return this.serverConnected
        } catch (error) {
            console.error('❌ MapLogic: 서버 연결 테스트 실패:', error.message)
            this.serverConnected = false
            return false
        }
    }

    // 📍 마커 데이터 로드
    async loadMarkerData() {
        try {
            console.log('📡 MapLogic: 마커 데이터 로드 중...')
            const markers = await markerAPI.getAllMarkers()
            this.markerData = markers
            console.log(`✅ MapLogic: ${markers.length}개 마커 로드 완료`)
            return markers
        } catch (error) {
            console.error('❌ MapLogic: 마커 데이터 로드 실패:', error)
            this.markerData = []
            return []
        }
    }

    // 🔄 전체 마커 새로고침
    async refreshAllMarkers() {
        try {
            console.log('🔄 MapLogic: 전체 마커 새로고침 시작')

            // 서버 연결 재테스트
            await this.testServerConnection()

            console.log('✅ MapLogic: 전체 마커 새로고침 완료')
            return this.markerData
        } catch (error) {
            console.error('❌ MapLogic: 전체 마커 새로고침 실패:', error)
            return []
        }
    }

    // 📊 마커 개수 조회
    getMarkerCount() {
        return this.markerData.length
    }

    // 📂 모든 마커 데이터 가져오기
    getAllMarkers() {
        return this.markerData
    }

    // 🏷️ 카테고리별 마커 필터링 (향후 구현)
    getMarkersByCategory(category) {
        console.log(`🏷️ MapLogic: ${category} 카테고리 마커 필터링`)
        // TODO: 마커 데이터에 category 필드 추가 후 구현
        return this.markerData.filter(marker =>
            marker.category === category || !marker.category
        )
    }

    // 🔍 마커 검색 (향후 구현)
    searchMarkers(query) {
        console.log(`🔍 MapLogic: 마커 검색 - "${query}"`)
        const lowercaseQuery = query.toLowerCase()

        return this.markerData.filter(marker =>
            marker.title.toLowerCase().includes(lowercaseQuery) ||
            marker.description.toLowerCase().includes(lowercaseQuery)
        )
    }

    // 📍 특정 마커 조회
    getMarkerById(markerId) {
        return this.markerData.find(marker => marker.id == markerId)
    }

    // 📍 즐겨찾기 위치 가져오기
    getFavoriteLocation(type) {
        return this.favoriteLocations[type] || null
    }

    // 📊 통계 정보 (향후 구현)
    getStatistics() {
        const stats = {
            total: this.markerData.length,
            byCategory: {}
        }

        // 카테고리별 통계
        this.categories.forEach(category => {
            stats.byCategory[category] = this.markerData.filter(
                marker => marker.category === category
            ).length
        })

        return stats
    }

    // 📋 현재 상태 정보
    getStatus() {
        return {
            serverConnected: this.serverConnected,
            markerCount: this.markerData.length,
            categories: this.categories,
            markers: this.markerData
        }
    }

    // 🎯 서버 연결 상태만 확인
    isServerConnected() {
        return this.serverConnected
    }

    // 🌍 지역별 마커 그룹핑 (향후 구현)
    groupMarkersByRegion() {
        console.log('🌍 MapLogic: 지역별 마커 그룹핑')
        // TODO: 좌표 기반 지역 분류 구현
        return {}
    }

    // 📈 데이터 분석 (향후 구현)
    analyzeMarkerData() {
        console.log('📈 MapLogic: 마커 데이터 분석')
        // TODO: 마커 밀도, 분포도 등 분석 기능
        return {
            density: 0,
            distribution: {},
            hotspots: []
        }
    }

    // 💾 로컬 스토리지 관리 (향후 구현)
    saveToLocalStorage() {
        try {
            const data = {
                markers: this.markerData,
                timestamp: new Date().toISOString()
            }
            localStorage.setItem('mapData', JSON.stringify(data))
            console.log('💾 MapLogic: 로컬 스토리지에 저장 완료')
        } catch (error) {
            console.error('❌ MapLogic: 로컬 스토리지 저장 실패:', error)
        }
    }

    // 📖 로컬 스토리지에서 복원 (향후 구현)
    loadFromLocalStorage() {
        try {
            const data = JSON.parse(localStorage.getItem('mapData') || '{}')
            if (data.markers && Array.isArray(data.markers)) {
                this.markerData = data.markers
                console.log('📖 MapLogic: 로컬 스토리지에서 복원 완료')
                return true
            }
        } catch (error) {
            console.error('❌ MapLogic: 로컬 스토리지 복원 실패:', error)
        }
        return false
    }

    // 🔄 데이터 동기화 (향후 구현)
    async syncWithServer() {
        console.log('🔄 MapLogic: 서버와 데이터 동기화')
        // TODO: 로컬 데이터와 서버 데이터 비교 및 동기화
        try {
            const serverMarkers = await this.loadMarkerData()
            const localMarkers = this.markerData

            // 동기화 로직 구현
            console.log(`🔄 서버: ${serverMarkers.length}개, 로컬: ${localMarkers.length}개`)

            return true
        } catch (error) {
            console.error('❌ MapLogic: 동기화 실패:', error)
            return false
        }
    }
}