<template>
  <div class="top-navbar">
    <!-- 왼쪽 로고/타이틀 영역 -->
    <div class="navbar-left">
      <div class="logo-section">
        <span class="logo-text">DropIt 로고 넘기</span>
      </div>
    </div>

    <!-- 중앙 메뉴 영역 -->
    <div class="navbar-center">
      <div class="nav-menu">
        <div
            class="nav-menu-item"
            :class="{ active: activeMenu === 'collection' }"
            @click="setActiveMenu('collection')"
        >
          <span class="menu-text">의류수거함</span>
        </div>

        <div
            class="nav-menu-item"
            :class="{ active: activeMenu === 'delivery' }"
            @click="setActiveMenu('delivery')"
        >
          <span class="menu-text">나눔</span>
        </div>

        <div
            class="nav-menu-item"
            :class="{ active: activeMenu === 'history' }"
            @click="setActiveMenu('history')"
        >
          <span class="menu-text">즐겨찾기</span>
        </div>

        <div
            class="nav-menu-item guide-item"
            :class="{ active: activeMenu === 'guide' }"
            @click="setActiveMenu('guide')"
        >
          <span class="menu-text">이용가이드</span>
        </div>
      </div>
    </div>

    <!-- 오른쪽 영역 -->
    <div class="navbar-right">
      <!-- 마이페이지 -->
      <div
          class="nav-menu-item mypage-item"
          :class="{ active: activeMenu === 'mypage' }"
          @click="setActiveMenu('mypage')"
      >
        <span class="menu-text">마이페이지</span>
      </div>

      <!-- 로그인 -->
      <div
          class="nav-menu-item login-item"
          :class="{ active: activeMenu === 'login' }"
          @click="handleLoginClick"
      >
        <span class="menu-text">{{ isLoggedIn ? user?.name || '사용자' : '로그인' }}</span>
      </div>

      <!-- 로그인된 경우 로그아웃 버튼 표시 -->
      <button
          v-if="isLoggedIn"
          class="utility-btn logout-btn"
          @click="handleLogout"
          title="로그아웃"
      >
        <span class="utility-icon">🚪</span>
      </button>
    </div>

    <!-- 로그인 모달 -->
    <LoginModal
        :is-visible="showLoginModal"
        @close="showLoginModal = false"
        @login-success="handleLoginSuccess"
        @open-signup="handleOpenSignup"
    />

    <!-- 회원가입 모달 -->
    <SignupModal
        :is-visible="showSignupModal"
        @close="showSignupModal = false"
        @signup-success="handleSignupSuccess"
        @open-login="handleOpenLogin"
    />

    <!-- 사용자 메뉴 드롭다운 (로그인된 경우) -->
    <div v-if="isLoggedIn && showUserMenu" class="user-menu" @click.stop>
      <div class="user-info">
        <div class="user-avatar">{{ user?.name?.charAt(0) || 'U' }}</div>
        <div class="user-details">
          <div class="user-name">{{ user?.name || '사용자' }}</div>
          <div class="user-email">{{ user?.email || '' }}</div>
        </div>
      </div>
      <div class="menu-divider"></div>
      <div class="menu-items">
        <button class="menu-item" @click="handleProfile">
          <span class="menu-icon">👤</span>
          내 프로필
        </button>
        <button class="menu-item" @click="handleSettings">
          <span class="menu-icon">⚙️</span>
          설정
        </button>
        <button class="menu-item" @click="handleLogout">
          <span class="menu-icon">🚪</span>
          로그아웃
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import LoginModal from './LoginModal.vue'
import SignupModal from './SignupModal.vue'
import { authAPI } from '../services/authService.js'

export default {
  name: 'TopNavbar',

  components: {
    LoginModal,
    SignupModal
  },

  emits: ['menu-changed', 'login-success', 'logout'],

  data() {
    return {
      activeMenu: 'collection',
      showLoginModal: false,
      showSignupModal: false,
      showUserMenu: false,
      isLoggedIn: false,
      user: null
    }
  },

  mounted() {
    // 페이지 로드시 로그인 상태 확인
    this.checkLoginStatus()

    // 전역 클릭 이벤트로 사용자 메뉴 닫기
    document.addEventListener('click', this.closeUserMenu)
  },

  beforeUnmount() {
    document.removeEventListener('click', this.closeUserMenu)
  },

  methods: {
    setActiveMenu(menu) {
      this.activeMenu = menu
      console.log('📱 상단 네비: 메뉴 변경:', menu)
      this.$emit('menu-changed', menu)
    },

    // 로그인 버튼 클릭 처리
    handleLoginClick() {
      if (this.isLoggedIn) {
        // 로그인된 상태라면 사용자 메뉴 토글
        this.showUserMenu = !this.showUserMenu
      } else {
        // 로그인 안된 상태라면 로그인 모달 표시
        this.showLoginModal = true
      }
      this.setActiveMenu('login')
    },

    // 로그인 성공 처리
    handleLoginSuccess(userData) {
      console.log('✅ 네비바: 로그인 성공', userData)
      this.isLoggedIn = true
      this.user = userData
      this.showLoginModal = false
      this.showUserMenu = false
      this.$emit('login-success', userData)
    },

    // 로그아웃 처리
    async handleLogout() {
      try {
        console.log('🚪 로그아웃 시도...')

        await authAPI.logout()

        this.isLoggedIn = false
        this.user = null
        this.showUserMenu = false
        this.activeMenu = 'collection'

        console.log('✅ 로그아웃 완료')
        this.$emit('logout')

        alert('로그아웃되었습니다.')

      } catch (error) {
        console.error('❌ 로그아웃 실패:', error)
        alert('로그아웃 중 오류가 발생했습니다.')
      }
    },

    // 회원가입 처리 (새 창으로)
    handleOpenSignup() {
      console.log('📝 회원가입 모달 열기')
      this.showLoginModal = false
      this.showSignupModal = true
    },

    // 로그인 모달 열기
    handleOpenLogin() {
      console.log('🔐 로그인 모달 열기')
      this.showSignupModal = false
      this.showLoginModal = true
    },

    // 회원가입 성공 처리
    handleSignupSuccess(userData) {
      console.log('✅ 네비바: 회원가입 성공', userData)
      this.isLoggedIn = true
      this.user = userData
      this.showSignupModal = false
      this.showUserMenu = false
      this.$emit('login-success', userData)
    },

    // 프로필 페이지로 이동 (새 창)
    handleProfile() {
      console.log('👤 프로필 페이지 열기')
      this.showUserMenu = false

      window.open(
          '/profile',
          'profile',
          'width=800,height=600,scrollbars=yes,resizable=yes'
      )
    },

    // 설정 페이지로 이동 (새 창)
    handleSettings() {
      console.log('⚙️ 설정 페이지 열기')
      this.showUserMenu = false

      window.open(
          '/settings',
          'settings',
          'width=600,height=500,scrollbars=yes,resizable=yes'
      )
    },

    // 사용자 메뉴 닫기
    closeUserMenu() {
      this.showUserMenu = false
    },

    // 로그인 상태 확인
    async checkLoginStatus() {
      try {
        // 로컬 스토리지에서 사용자 정보 확인
        const localUser = authAPI.getLocalUser()
        const isTokenValid = authAPI.isTokenValid()

        if (localUser && isTokenValid) {
          // 서버에서 최신 사용자 정보 가져오기
          try {
            const currentUser = await authAPI.getCurrentUser()
            this.isLoggedIn = true
            this.user = currentUser
            console.log('✅ 로그인 상태 복원:', currentUser.email)
          } catch (error) {
            // 서버 검증 실패시 로컬 정보 제거
            console.log('⚠️ 토큰 만료 또는 유효하지 않음')
            this.isLoggedIn = false
            this.user = null
          }
        } else {
          this.isLoggedIn = false
          this.user = null
        }
      } catch (error) {
        console.error('❌ 로그인 상태 확인 실패:', error)
        this.isLoggedIn = false
        this.user = null
      }
    }
  }
}
</script>

<style scoped>
.top-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30px; /* ✅ 좌우 패딩 증가 */
  z-index: 1001;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 왼쪽 로고 영역 */
.navbar-left {
  min-width: 200px;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-text {
  font-size: 18px;
  font-weight: 700;
  color: #6366f1;
}

/* 중앙 메뉴 영역 */
.navbar-center {
  display: flex;
  justify-content: center;
  flex: 1;
}

.nav-menu {
  display: flex;
  align-items: center;
  gap: 40px; /* ✅ 버튼 간격 증가 (20px → 40px) */
  background: white;
  border-radius: 0;
  padding: 0;
  border: none;
}

.nav-menu-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 18px 24px; /* ✅ 좌우 패딩 증가 (20px → 24px) */
  border-radius: 0;
  cursor: pointer;
  transition: all 0.2s ease;
  background: transparent;
  color: #666;
  font-size: 15px;
  font-weight: 500;
  min-width: auto;
  justify-content: center;
  position: relative;
  border: none;
  border-bottom: 3px solid transparent;
}

.nav-menu-item:hover {
  background: transparent;
  color: #333;
  transform: none;
}

.nav-menu-item.active {
  background: transparent;
  color: #6366f1;
  box-shadow: none;
  border-bottom: 3px solid #6366f1;
}

.nav-menu-item.guide-item.active {
  border-bottom: none;
  border-radius: 20px 20px 0 0;
  background: #6366f1;
  color: white;
}

.menu-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 오른쪽 영역 */
.navbar-right {
  display: flex;
  align-items: center;
  gap: 30px; /* ✅ 오른쪽 영역 간격 증가 (20px → 30px) */
  position: relative;
}

/* 마이페이지 및 로그인 버튼 */
.mypage-item, .login-item {
  background: transparent;
  border: none;
  border-radius: 0;
  padding: 18px 24px; /* ✅ 좌우 패딩 증가 */
  font-size: 15px;
  font-weight: 500;
  color: #666;
  border-bottom: 3px solid transparent;
}

.mypage-item:hover, .login-item:hover {
  background: transparent;
  color: #333;
}

.mypage-item.active, .login-item.active {
  background: transparent;
  color: #6366f1;
  border-bottom: 3px solid #6366f1;
}

.utility-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: #f5f5f5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.utility-btn:hover {
  background: #e0e0e0;
  transform: translateY(-1px);
}

.logout-btn {
  background: #fee;
  color: #d32f2f;
}

.logout-btn:hover {
  background: #ffcdd2;
}

.utility-icon {
  font-size: 14px;
}

/* 사용자 메뉴 드롭다운 */
.user-menu {
  position: absolute;
  top: 50px;
  right: 0;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  min-width: 250px;
  z-index: 2000;
}

.user-info {
  display: flex;
  align-items: center;
  padding: 16px;
  gap: 12px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #6366f1;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 16px;
}

.user-details {
  flex: 1;
}

.user-name {
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.user-email {
  color: #666;
  font-size: 12px;
  margin-top: 2px;
}

.menu-divider {
  height: 1px;
  background: #f0f0f0;
  margin: 0 16px;
}

.menu-items {
  padding: 8px 0;
}

.menu-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: none;
  background: none;
  cursor: pointer;
  transition: background 0.2s;
  font-size: 14px;
  color: #333;
  text-align: left;
}

.menu-item:hover {
  background: #f8f9fa;
}

.menu-item .menu-icon {
  font-size: 16px;
  width: 20px;
}

/* ✅ 반응형 디자인 - 간격 조정 */
@media (max-width: 1200px) {
  .nav-menu {
    gap: 30px; /* 큰 화면에서 간격 줄임 */
  }

  .navbar-right {
    gap: 25px;
  }
}

@media (max-width: 968px) {
  .nav-menu {
    gap: 25px;
  }

  .nav-menu-item {
    padding: 16px 20px;
    font-size: 14px;
  }

  .mypage-item, .login-item {
    padding: 16px 20px;
    font-size: 14px;
  }

  .navbar-right {
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .top-navbar {
    padding: 0 20px;
  }

  .navbar-left {
    min-width: 150px;
  }

  .logo-text {
    font-size: 16px;
  }

  .nav-menu {
    gap: 20px;
  }

  .user-menu {
    right: 10px;
    min-width: 220px;
  }

  .navbar-right {
    gap: 15px;
  }
}

@media (max-width: 640px) {
  .nav-menu {
    gap: 15px;
  }

  .nav-menu-item {
    padding: 14px 16px;
    font-size: 13px;
  }

  .mypage-item, .login-item {
    padding: 14px 16px;
    font-size: 13px;
  }

  .navbar-right {
    gap: 12px;
  }
}

/* ✅ 더 큰 화면에서의 최적화 */
@media (min-width: 1400px) {
  .nav-menu {
    gap: 50px; /* 매우 큰 화면에서는 더 넓은 간격 */
  }

  .navbar-right {
    gap: 35px;
  }

  .top-navbar {
    padding: 0 40px;
  }
}
</style>