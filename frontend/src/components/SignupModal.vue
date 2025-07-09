<!-- SignupModal.vue - 비밀번호 검증 개선 버전 -->
<template>
  <div v-if="isVisible" class="signup-modal-overlay" @click="closeModal">
    <div class="signup-modal" @click.stop>
      <div class="modal-header">
        <h2 class="modal-title">회원가입</h2>
        <button class="close-btn" @click="closeModal">✕</button>
      </div>

      <div class="modal-body">
        <form @submit.prevent="handleSignup" class="signup-form">
          <div class="form-group">
            <label for="name">이름</label>
            <input
                id="name"
                type="text"
                v-model="signupForm.name"
                placeholder="이름을 입력하세요"
                required
                class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="email">이메일</label>
            <input
                id="email"
                type="email"
                v-model="signupForm.email"
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
                v-model="signupForm.password"
                placeholder="대문자, 소문자, 숫자 포함 8자 이상"
                required
                minlength="8"
                class="form-input"
                :class="{ 'error': passwordValidationError }"
                @input="validatePassword"
            />
            <!-- ✅ 비밀번호 규칙 안내 -->
            <div class="password-requirements">
              <div class="requirement" :class="{ valid: hasLowercase }">
                ✓ 소문자 포함
              </div>
              <div class="requirement" :class="{ valid: hasUppercase }">
                ✓ 대문자 포함
              </div>
              <div class="requirement" :class="{ valid: hasNumber }">
                ✓ 숫자 포함
              </div>
              <div class="requirement" :class="{ valid: hasMinLength }">
                ✓ 8자 이상
              </div>
            </div>
            <span v-if="passwordValidationError" class="error-message">
              {{ passwordValidationError }}
            </span>
          </div>

          <div class="form-group">
            <label for="confirmPassword">비밀번호 확인</label>
            <input
                id="confirmPassword"
                type="password"
                v-model="signupForm.confirmPassword"
                placeholder="비밀번호를 다시 입력하세요"
                required
                class="form-input"
                :class="{ 'error': passwordMismatch }"
            />
            <span v-if="passwordMismatch" class="error-message">
              비밀번호가 일치하지 않습니다
            </span>
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="signupForm.agreeTerms" required>
              <span class="checkmark"></span>
              <span class="terms-text">
                <a href="#" @click.prevent="showTerms">이용약관</a> 및
                <a href="#" @click.prevent="showPrivacy">개인정보처리방침</a>에 동의합니다
              </span>
            </label>
          </div>

          <button
              type="submit"
              class="signup-btn"
              :disabled="isLoading || !isFormValid"
              :class="{ loading: isLoading }"
          >
            <span v-if="!isLoading">회원가입</span>
            <span v-else>가입 중...</span>
          </button>

          <div class="login-link">
            이미 계정이 있으시나요?
            <a href="#" @click.prevent="handleLogin">로그인</a>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { authAPI } from '../services/authService.js'

export default {
  name: 'SignupModal',

  props: {
    isVisible: {
      type: Boolean,
      default: false
    }
  },

  emits: ['close', 'signup-success', 'open-login'],

  data() {
    return {
      signupForm: {
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        agreeTerms: false
      },
      isLoading: false,
      // ✅ 비밀번호 검증 상태 추가
      passwordValidationError: '',
      hasLowercase: false,
      hasUppercase: false,
      hasNumber: false,
      hasMinLength: false
    }
  },

  computed: {
    passwordMismatch() {
      return this.signupForm.password &&
          this.signupForm.confirmPassword &&
          this.signupForm.password !== this.signupForm.confirmPassword
    },

    // ✅ 비밀번호가 백엔드 규칙을 만족하는지 확인
    isPasswordValid() {
      return this.hasLowercase &&
          this.hasUppercase &&
          this.hasNumber &&
          this.hasMinLength &&
          !this.passwordValidationError
    },

    isFormValid() {
      return this.signupForm.name &&
          this.signupForm.email &&
          this.signupForm.password &&
          this.signupForm.confirmPassword &&
          this.isPasswordValid && // ✅ 비밀번호 검증 추가
          !this.passwordMismatch &&
          this.signupForm.agreeTerms
    }
  },

  methods: {
    closeModal() {
      this.$emit('close')
      this.resetForm()
    },

    resetForm() {
      this.signupForm = {
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        agreeTerms: false
      }
      this.isLoading = false
      // ✅ 비밀번호 검증 상태 초기화
      this.passwordValidationError = ''
      this.hasLowercase = false
      this.hasUppercase = false
      this.hasNumber = false
      this.hasMinLength = false
    },

    // ✅ 실시간 비밀번호 검증
    validatePassword() {
      const password = this.signupForm.password

      // 백엔드 패턴과 동일한 검증: ^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$
      this.hasLowercase = /[a-z]/.test(password)
      this.hasUppercase = /[A-Z]/.test(password)
      this.hasNumber = /\d/.test(password)
      this.hasMinLength = password.length >= 8

      // 전체 패턴 검증
      const fullPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/

      if (!password) {
        this.passwordValidationError = ''
      } else if (!this.hasMinLength) {
        this.passwordValidationError = '비밀번호는 8자 이상이어야 합니다'
      } else if (!this.hasLowercase) {
        this.passwordValidationError = '소문자를 포함해야 합니다'
      } else if (!this.hasUppercase) {
        this.passwordValidationError = '대문자를 포함해야 합니다'
      } else if (!this.hasNumber) {
        this.passwordValidationError = '숫자를 포함해야 합니다'
      } else if (!fullPattern.test(password)) {
        this.passwordValidationError = '비밀번호 형식이 올바르지 않습니다'
      } else {
        this.passwordValidationError = ''
      }
    },

    async handleSignup() {
      if (!this.isFormValid) {
        alert('모든 필드를 올바르게 입력해주세요.')
        return
      }

      if (this.passwordMismatch) {
        alert('비밀번호가 일치하지 않습니다.')
        return
      }

      if (!this.isPasswordValid) {
        alert('비밀번호가 요구사항을 만족하지 않습니다.')
        return
      }

      this.isLoading = true

      try {
        console.log('📝 회원가입 시도:', this.signupForm.email)

        const signupResponse = await authAPI.register({
          name: this.signupForm.name,
          email: this.signupForm.email,
          password: this.signupForm.password
        })

        console.log('✅ 회원가입 성공:', signupResponse)

        // 회원가입 성공 후 자동 로그인
        try {
          const loginResponse = await authAPI.login({
            email: this.signupForm.email,
            password: this.signupForm.password,
            rememberMe: true
          })

          console.log('✅ 자동 로그인 성공:', loginResponse)

          if (loginResponse.token) {
            localStorage.setItem('authToken', loginResponse.token)
            localStorage.setItem('user', JSON.stringify(loginResponse.user))
          }

          this.$emit('signup-success', loginResponse.user)
          this.closeModal()

          alert(`환영합니다, ${loginResponse.user.name}님! 회원가입이 완료되었습니다.`)

        } catch (loginError) {
          console.log('⚠️ 자동 로그인 실패, 수동 로그인 필요')
          this.closeModal()
          this.$emit('open-login')
          alert('회원가입이 완료되었습니다. 로그인해주세요.')
        }

      } catch (error) {
        console.error('❌ 회원가입 실패:', error)

        let errorMessage = '회원가입에 실패했습니다.'

        if (error.message?.includes('400') || error.message?.includes('Validation')) {
          errorMessage = '입력 정보가 올바르지 않습니다. 비밀번호 규칙을 확인해주세요.'
        } else if (error.message?.includes('email')) {
          errorMessage = '이미 사용 중인 이메일입니다.'
        } else if (error.message?.includes('서버에 연결할 수 없습니다')) {
          errorMessage = '서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.'
        }

        alert(errorMessage)

      } finally {
        this.isLoading = false
      }
    },

    handleLogin() {
      this.closeModal()
      this.$emit('open-login')
    },

    showTerms() {
      alert('이용약관 내용을 표시합니다. (실제 구현 시 모달 또는 새 창으로 표시)')
    },

    showPrivacy() {
      alert('개인정보처리방침 내용을 표시합니다. (실제 구현 시 모달 또는 새 창으로 표시)')
    }
  }
}
</script>

<style scoped>
.signup-modal-overlay {
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

.signup-modal {
  background: white;
  border-radius: 12px;
  width: 450px;
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

.signup-form {
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

.form-input.error {
  border-color: #e74c3c;
  box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1);
}

/* ✅ 비밀번호 요구사항 스타일 */
.password-requirements {
  margin-top: 8px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.requirement {
  font-size: 12px;
  color: #6c757d;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  transition: color 0.3s ease;
}

.requirement:last-child {
  margin-bottom: 0;
}

.requirement.valid {
  color: #28a745;
  font-weight: 500;
}

.requirement::before {
  content: '';
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #6c757d;
  margin-right: 8px;
  transition: background 0.3s ease;
}

.requirement.valid::before {
  background: #28a745;
  content: '✓';
  width: auto;
  height: auto;
  font-weight: bold;
  border-radius: 0;
}

.error-message {
  display: block;
  color: #e74c3c;
  font-size: 12px;
  margin-top: 4px;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  line-height: 1.4;
}

.checkbox-label input[type="checkbox"] {
  margin-right: 8px;
  margin-top: 2px;
  flex-shrink: 0;
}

.terms-text {
  flex: 1;
}

.terms-text a {
  color: #4285f4;
  text-decoration: none;
}

.terms-text a:hover {
  text-decoration: underline;
}

.signup-btn {
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

.signup-btn:hover:not(:disabled) {
  background: #3367d6;
  transform: translateY(-1px);
}

.signup-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.signup-btn.loading {
  background: #ccc;
}

.login-link {
  text-align: center;
  font-size: 14px;
  color: #666;
}

.login-link a {
  color: #4285f4;
  text-decoration: none;
}

.login-link a:hover {
  text-decoration: underline;
}

@media (max-width: 480px) {
  .signup-modal {
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