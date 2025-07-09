// stores/uiStore.js - UI 상태 관리 스토어
import { defineStore } from 'pinia'

export const useUIStore = defineStore('ui', {
    state: () => ({
        // 📱 패널 표시 상태
        showCollectionInfoPanel: false,
        showUserProfile: false,
        showSettings: false,

        // 📱 모달 상태
        showLoginModal: false,
        showSignupModal: false,

        // 📱 사이드바 상태 (모바일)
        showSidebar: true,
        sidebarCollapsed: false,

        // 🔧 로딩 상태
        isAppLoading: false,
        loadingMessage: '',

        // 🚨 알림 상태
        notifications: [],

        // 📱 디바이스 정보
        isMobile: false,
        isTablet: false,
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,

        // 🎯 현재 활성 메뉴
        activeMenu: 'collection',

        // 🔍 검색 상태
        isSearching: false,
        searchResults: [],

        // 📍 패널에 표시할 의류수거함 정보
        selectedCollectionForPanel: null
    }),

    getters: {
        // 📱 반응형 상태
        isMobileDevice: (state) => state.screenWidth <= 768,
        isTabletDevice: (state) => state.screenWidth > 768 && state.screenWidth <= 1024,
        isDesktopDevice: (state) => state.screenWidth > 1024,

        // 🔔 알림 관련
        unreadNotificationsCount: (state) => {
            return state.notifications.filter(n => !n.read).length
        },

        // 📱 패널 상태
        hasAnyPanelOpen: (state) => {
            return state.showCollectionInfoPanel ||
                state.showUserProfile ||
                state.showSettings
        },

        // 🔧 로딩 상태
        isAnyLoading: (state) => {
            return state.isAppLoading || state.isSearching
        }
    },

    actions: {
        // 📱 CollectionInfoPanel 관련
        openCollectionInfoPanel(collection) {
            console.log('📱 [UI Store] 의류수거함 정보 패널 열기:', collection?.address)

            this.selectedCollectionForPanel = collection
            this.showCollectionInfoPanel = true

            // 모바일에서는 사이드바 숨기기 (선택사항)
            if (this.isMobileDevice) {
                this.showSidebar = false
            }
        },

        closeCollectionInfoPanel() {
            console.log('📱 [UI Store] 의류수거함 정보 패널 닫기')

            this.showCollectionInfoPanel = false
            this.selectedCollectionForPanel = null

            // 모바일에서 사이드바 다시 표시
            if (this.isMobileDevice) {
                this.showSidebar = true
            }
        },

        // 📱 다른 패널들
        openUserProfile() {
            console.log('📱 [UI Store] 사용자 프로필 열기')
            this.closeAllPanels()
            this.showUserProfile = true
        },

        openSettings() {
            console.log('📱 [UI Store] 설정 패널 열기')
            this.closeAllPanels()
            this.showSettings = true
        },

        closeAllPanels() {
            console.log('📱 [UI Store] 모든 패널 닫기')
            this.showCollectionInfoPanel = false
            this.showUserProfile = false
            this.showSettings = false
            this.selectedCollectionForPanel = null
        },

        // 📱 모달 관리
        openLoginModal() {
            this.showLoginModal = true
            this.showSignupModal = false
        },

        openSignupModal() {
            this.showSignupModal = true
            this.showLoginModal = false
        },

        closeAllModals() {
            this.showLoginModal = false
            this.showSignupModal = false
        },

        // 📱 사이드바 관리
        toggleSidebar() {
            this.showSidebar = !this.showSidebar
            console.log('📱 [UI Store] 사이드바 토글:', this.showSidebar)
        },

        collapseSidebar() {
            this.sidebarCollapsed = true
        },

        expandSidebar() {
            this.sidebarCollapsed = false
        },

        // 🎯 메뉴 관리
        setActiveMenu(menu) {
            console.log('🎯 [UI Store] 활성 메뉴 변경:', menu)
            this.activeMenu = menu
        },

        // 🔧 로딩 상태 관리
        startAppLoading(message = '로딩 중...') {
            this.isAppLoading = true
            this.loadingMessage = message
        },

        stopAppLoading() {
            this.isAppLoading = false
            this.loadingMessage = ''
        },

        startSearching() {
            this.isSearching = true
        },

        stopSearching() {
            this.isSearching = false
        },

        // 🔔 알림 관리
        addNotification(notification) {
            const id = Date.now()
            const newNotification = {
                id,
                message: notification.message || '',
                type: notification.type || 'info', // 'info', 'success', 'warning', 'error'
                duration: notification.duration || 3000,
                read: false,
                timestamp: new Date()
            }

            this.notifications.unshift(newNotification)

            console.log('🔔 [UI Store] 알림 추가:', newNotification.message)

            // 자동 제거 (duration이 0이 아닌 경우)
            if (newNotification.duration > 0) {
                setTimeout(() => {
                    this.removeNotification(id)
                }, newNotification.duration)
            }

            return id
        },

        removeNotification(id) {
            const index = this.notifications.findIndex(n => n.id === id)
            if (index > -1) {
                this.notifications.splice(index, 1)
                console.log('🔔 [UI Store] 알림 제거:', id)
            }
        },

        markNotificationAsRead(id) {
            const notification = this.notifications.find(n => n.id === id)
            if (notification) {
                notification.read = true
            }
        },

        clearAllNotifications() {
            this.notifications = []
            console.log('🔔 [UI Store] 모든 알림 제거')
        },

        // 📱 화면 크기 업데이트
        updateScreenSize() {
            this.screenWidth = window.innerWidth
            this.screenHeight = window.innerHeight

            // 디바이스 타입 업데이트
            this.isMobile = this.screenWidth <= 768
            this.isTablet = this.screenWidth > 768 && this.screenWidth <= 1024

            console.log('📱 [UI Store] 화면 크기 업데이트:', {
                width: this.screenWidth,
                height: this.screenHeight,
                isMobile: this.isMobile,
                isTablet: this.isTablet
            })
        },

        // 🔍 검색 결과 관리
        setSearchResults(results) {
            this.searchResults = results
            console.log('🔍 [UI Store] 검색 결과 설정:', results.length + '개')
        },

        clearSearchResults() {
            this.searchResults = []
        },

        // 📱 반응형 이벤트 리스너 설정
        initializeResponsive() {
            // 초기 화면 크기 설정
            this.updateScreenSize()

            // 윈도우 리사이즈 이벤트 리스너
            window.addEventListener('resize', () => {
                this.updateScreenSize()
            })

            console.log('📱 [UI Store] 반응형 초기화 완료')
        },

        // 🎨 테마 관리 (향후 확장용)
        setTheme(theme) {
            // 'light', 'dark', 'auto'
            localStorage.setItem('theme', theme)
            console.log('🎨 [UI Store] 테마 설정:', theme)
        },

        // 💾 UI 상태 저장/복원
        saveUIState() {
            try {
                const uiState = {
                    sidebarCollapsed: this.sidebarCollapsed,
                    activeMenu: this.activeMenu,
                    showSidebar: this.showSidebar
                }
                localStorage.setItem('uiState', JSON.stringify(uiState))
                console.log('💾 [UI Store] UI 상태 저장')
            } catch (error) {
                console.error('❌ [UI Store] UI 상태 저장 실패:', error)
            }
        },

        restoreUIState() {
            try {
                const savedState = localStorage.getItem('uiState')
                if (savedState) {
                    const uiState = JSON.parse(savedState)

                    this.sidebarCollapsed = uiState.sidebarCollapsed ?? false
                    this.activeMenu = uiState.activeMenu ?? 'collection'
                    this.showSidebar = uiState.showSidebar ?? true

                    console.log('💾 [UI Store] UI 상태 복원')
                }
            } catch (error) {
                console.error('❌ [UI Store] UI 상태 복원 실패:', error)
            }
        },

        // 🧹 초기화
        resetUIState() {
            console.log('🧹 [UI Store] UI 상태 초기화')

            this.closeAllPanels()
            this.closeAllModals()
            this.clearAllNotifications()
            this.clearSearchResults()
            this.stopAppLoading()
            this.stopSearching()

            this.activeMenu = 'collection'
            this.showSidebar = true
            this.sidebarCollapsed = false
        }
    }
})