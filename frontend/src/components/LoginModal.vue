<!-- LoginModal.vue - 모달 형태 로그인 -->
<template>
  <div v-if="isVisible" class="login-modal-overlay" @click="closeModal">
    <div class="login-modal" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title">로그인</h2>
        <button class="close-btn" @click="closeModal">✕</button>
      </div>

      <div class="modal-body">
        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label for="email">이메일</label>
            <input
                id="email"
                type="email"
                v-model="loginForm.email"
                placeholder="이메일을 입력하세요"
                required
                class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="password">비밀번호</label>
            <input
                id="password"
                type="password"
                v-model="loginForm.password"
                placeholder="비밀번호를 입력하세요"
                required
                class="form-input"
            />
          </div>

          <div class="form-options">
            <label class="checkbox-label">
              <input type="checkbox" v-model="loginForm.rememberMe">
              <span class="checkmark"></span>
              로그인 상태 유지
            </label>
            <a href="#" class="forgot-password" @click.prevent="handleForgotPassword">
              비밀번호를 잊으셨나요?
            </a>
          </div>

          <button
              type="submit"
              class="login-btn"
              :disabled="isLoading"
              :class="{ loading: isLoading }"
          >
            <span v-if="!isLoading">로그인</span>
            <span v-else>로그인 중...</span>
          </button>

          <div class="signup-link">
            계정이 없으시나요?
            <a href="#" @click.prevent="handleSignup">회원가입</a>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { authAPI } from '../services/authService.js'

export default {
  name: 'LoginModal',

  props: {
    isVisible: {
      type: Boolean,
      default: false
    }
  },

  emits: ['close', 'login-success', 'open-signup'],

  data() {
    return {
      loginForm: {
        email: '',
        password: '',
        rememberMe: false
      },
      isLoading: false
    }
  },

  methods: {
    closeModal() {
      this.$emit('close')
      this.resetForm()
    },

    resetForm() {
      this.loginForm = {
        email: '',
        password: '',
        rememberMe: false
      }
      this.isLoading = false
    },

    async handleLogin() {
      if (!this.loginForm.email || !this.loginForm.password) {
        alert('이메일과 비밀번호를 입력해주세요.')
        return
      }

      this.isLoading = true

      try {
        console.log('🔐 로그인 시도:', this.loginForm.email)

        const response = await authAPI.login({
          email: this.loginForm.email,
          password: this.loginForm.password,
          rememberMe: this.loginForm.rememberMe
        })

        console.log('✅ 로그인 성공:', response)

        // 토큰 저장 (실제로는 httpOnly 쿠키 권장)
        if (response.token) {
          localStorage.setItem('authToken', response.token)
          localStorage.setItem('user', JSON.stringify(response.user))
        }

        this.$emit('login-success', response.user)
        this.closeModal()

        alert(`환영합니다, ${response.user.name}님!`)

      } catch (error) {
        console.error('❌ 로그인 실패:', error)
        alert('로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.')
      } finally {
        this.isLoading = false
      }
    },

    handleForgotPassword() {
      alert('비밀번호 재설정 기능은 준비 중입니다.')
    },

    handleSignup() {
      this.closeModal()
      this.$emit('open-signup')
    }
  }
}
</script>

<style scoped>
.login-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.login-modal {
  background: white;
  border-radius: 12px;
  width: 400px;
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 0 24px;
}

.modal-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f5f5f5;
  color: #333;
}

.modal-body {
  padding: 24px;
}

.login-form {
  display: flex;
  flex-direction: column;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.2s;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #4285f4;
  box-shadow: 0 0 0 3px rgba(66, 133, 244, 0.1);
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #666;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  margin-right: 8px;
}

.forgot-password {
  color: #4285f4;
  text-decoration: none;
  font-size: 14px;
}

.forgot-password:hover {
  text-decoration: underline;
}

.login-btn {
  width: 100%;
  padding: 14px;
  background: #4285f4;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 20px;
}

.login-btn:hover:not(:disabled) {
  background: #3367d6;
  transform: translateY(-1px);
}

.login-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.login-btn.loading {
  background: #ccc;
}

.signup-link {
  text-align: center;
  font-size: 14px;
  color: #666;
}

.signup-link a {
  color: #4285f4;
  text-decoration: none;
}

.signup-link a:hover {
  text-decoration: underline;
}

@media (max-width: 480px) {
  .login-modal {
    width: 95vw;
    margin: 20px;
  }

  .modal-header {
    padding: 20px 20px 0 20px;
  }

  .modal-body {
    padding: 20px;
  }

  .modal-title {
    font-size: 20px;
  }
}
</style>