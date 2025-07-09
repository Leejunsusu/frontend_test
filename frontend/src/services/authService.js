// src/services/authService.js - 인증 관련 API 서비스 (개선 버전)
const API_BASE_URL = 'http://localhost:8080/api'

export const authAPI = {
    // 🔐 로그인
    async login(credentials) {
        try {
            console.log('📡 [Auth API] 로그인 요청...', credentials.email)

            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: credentials.email,
                    password: credentials.password,
                    rememberMe: credentials.rememberMe || false
                }),
                mode: 'cors',
                credentials: 'include' // 쿠키 포함
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: `HTTP ${response.status}` }))
                throw new Error(errorData.message || `로그인 실패: HTTP ${response.status}`)
            }

            const data = await response.json()
            console.log('✅ [Auth API] 로그인 성공')

            // 토큰과 사용자 정보 로컬 저장
            if (data.token) {
                localStorage.setItem('authToken', data.token)
            }
            if (data.user) {
                localStorage.setItem('user', JSON.stringify(data.user))
            }

            return data

        } catch (error) {
            console.error('❌ [Auth API] 로그인 실패:', error)

            // 네트워크 오류 처리
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.')
            }

            throw error
        }
    },

    // 📝 회원가입
    async register(userData) {
        try {
            console.log('📡 [Auth API] 회원가입 요청...', userData.email)

            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: userData.name,
                    email: userData.email,
                    password: userData.password,
                    phone: userData.phone || null,
                    agreeToMarketing: userData.agreeToMarketing || false
                }),
                mode: 'cors',
                credentials: 'include'
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: `HTTP ${response.status}` }))
                throw new Error(errorData.message || `회원가입 실패: HTTP ${response.status}`)
            }

            const data = await response.json()
            console.log('✅ [Auth API] 회원가입 성공')
            return data

        } catch (error) {
            console.error('❌ [Auth API] 회원가입 실패:', error)

            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.')
            }

            throw error
        }
    },

    // 🚪 로그아웃
    async logout() {
        try {
            console.log('📡 [Auth API] 로그아웃 요청...')

            const token = localStorage.getItem('authToken')

            const response = await fetch(`${API_BASE_URL}/auth/logout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                mode: 'cors',
                credentials: 'include'
            })

            // 로그아웃은 서버 에러가 있어도 클라이언트에서 토큰 제거
            localStorage.removeItem('authToken')
            localStorage.removeItem('user')

            if (response.ok) {
                console.log('✅ [Auth API] 로그아웃 성공')
            } else {
                console.log('⚠️ [Auth API] 서버 로그아웃 실패, 로컬 토큰만 제거')
            }

            return true

        } catch (error) {
            console.error('❌ [Auth API] 로그아웃 실패:', error)
            // 에러가 있어도 로컬 토큰은 제거
            localStorage.removeItem('authToken')
            localStorage.removeItem('user')
            return true
        }
    },

    // 👤 현재 사용자 정보 조회
    async getCurrentUser() {
        try {
            const token = localStorage.getItem('authToken')

            if (!token) {
                throw new Error('토큰이 없습니다')
            }

            console.log('📡 [Auth API] 현재 사용자 정보 요청...')

            const response = await fetch(`${API_BASE_URL}/auth/me`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                mode: 'cors',
                credentials: 'include'
            })

            if (!response.ok) {
                if (response.status === 401) {
                    // 토큰이 만료되었거나 유효하지 않음
                    localStorage.removeItem('authToken')
                    localStorage.removeItem('user')
                    throw new Error('인증이 만료되었습니다')
                }
                throw new Error(`HTTP ${response.status}`)
            }

            const userData = await response.json()
            console.log('✅ [Auth API] 사용자 정보 조회 성공')

            // 로컬 스토리지 업데이트
            localStorage.setItem('user', JSON.stringify(userData))

            return userData

        } catch (error) {
            console.error('❌ [Auth API] 사용자 정보 조회 실패:', error)
            throw error
        }
    },

    // 🔄 토큰 갱신
    async refreshToken() {
        try {
            console.log('📡 [Auth API] 토큰 갱신 요청...')

            const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                mode: 'cors',
                credentials: 'include' // refresh token은 httpOnly 쿠키로 전송
            })

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`)
            }

            const data = await response.json()

            if (data.token) {
                localStorage.setItem('authToken', data.token)
                console.log('✅ [Auth API] 토큰 갱신 성공')
            }

            return data

        } catch (error) {
            console.error('❌ [Auth API] 토큰 갱신 실패:', error)
            // 갱신 실패시 로컬 토큰 제거
            localStorage.removeItem('authToken')
            localStorage.removeItem('user')
            throw error
        }
    },

    // 📧 이메일 중복 확인
    async checkEmail(email) {
        try {
            console.log('📡 [Auth API] 이메일 중복 확인...', email)

            const response = await fetch(`${API_BASE_URL}/auth/check-email?email=${encodeURIComponent(email)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                mode: 'cors'
            })

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`)
            }

            const data = await response.json()
            console.log('✅ [Auth API] 이메일 중복 확인 완료')
            return data

        } catch (error) {
            console.error('❌ [Auth API] 이메일 중복 확인 실패:', error)
            throw error
        }
    },

    // 🔐 비밀번호 재설정 요청
    async requestPasswordReset(email) {
        try {
            console.log('📡 [Auth API] 비밀번호 재설정 요청...', email)

            const response = await fetch(`${API_BASE_URL}/auth/password-reset-request`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
                mode: 'cors'
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: `HTTP ${response.status}` }))
                throw new Error(errorData.message || `HTTP ${response.status}`)
            }

            console.log('✅ [Auth API] 비밀번호 재설정 이메일 전송 완료')
            return { success: true }

        } catch (error) {
            console.error('❌ [Auth API] 비밀번호 재설정 요청 실패:', error)
            throw error
        }
    },

    // ✅ 토큰 유효성 검사
    isTokenValid() {
        const token = localStorage.getItem('authToken')
        if (!token) return false

        try {
            // JWT 토큰의 경우 payload 디코딩해서 만료시간 확인
            const payload = JSON.parse(atob(token.split('.')[1]))
            const currentTime = Date.now() / 1000

            return payload.exp > currentTime
        } catch (error) {
            console.error('토큰 검증 실패:', error)
            return false
        }
    },

    // 👤 로컬 사용자 정보 조회
    getLocalUser() {
        try {
            const userStr = localStorage.getItem('user')
            return userStr ? JSON.parse(userStr) : null
        } catch (error) {
            console.error('로컬 사용자 정보 파싱 실패:', error)
            return null
        }
    },

    // 🔑 로컬 토큰 조회
    getLocalToken() {
        return localStorage.getItem('authToken')
    },

    // 🧪 연결 테스트 (디버깅용)
    async testConnection() {
        try {
            console.log('🔧 [Auth API] 백엔드 연결 테스트...')

            const response = await fetch(`${API_BASE_URL}/auth/check-email?email=test@test.com`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                mode: 'cors'
            })

            console.log('✅ [Auth API] 백엔드 연결 성공')
            return true

        } catch (error) {
            console.error('❌ [Auth API] 백엔드 연결 실패:', error)
            return false
        }
    }
}

// 🔧 HTTP 요청 인터셉터 (다른 API 호출시 자동으로 토큰 첨부)
export const createAuthenticatedRequest = async (url, options = {}) => {
    const token = authAPI.getLocalToken()

    const authenticatedOptions = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
            ...(token && { 'Authorization': `Bearer ${token}` })
        },
        mode: 'cors',
        credentials: 'include'
    }

    try {
        const response = await fetch(url, authenticatedOptions)

        // 401 에러시 토큰 갱신 시도
        if (response.status === 401 && token) {
            try {
                console.log('🔄 토큰 만료 감지, 자동 갱신 시도...')
                await authAPI.refreshToken()

                // 갱신된 토큰으로 재시도
                const newToken = authAPI.getLocalToken()
                authenticatedOptions.headers.Authorization = `Bearer ${newToken}`

                return await fetch(url, authenticatedOptions)
            } catch (refreshError) {
                console.error('토큰 갱신 실패:', refreshError)
                // 로그인 페이지로 리다이렉트 또는 로그인 모달 표시
                throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.')
            }
        }

        return response
    } catch (error) {
        console.error('인증된 요청 실패:', error)
        throw error
    }
}