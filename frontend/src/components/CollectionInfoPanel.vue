<template>
  <div
      v-if="isVisible"
      class="info-panel-container"
      :class="{ 'panel-visible': isVisible }"
  >
    <div
        v-if="showOverlay"
        class="panel-overlay"
        @click="closePanel"
    ></div>

    <div
        class="info-panel"
        :class="{
          'panel-visible': isVisible,
          'panel-mobile': isMobile,
          'panel-desktop': !isMobile
        }"
        @click.stop
    >
      <!-- ✅ 상단 이미지 갤러리 (실제 이미지 파일 사용) -->
      <div class="image-gallery-section">
        <div class="image-gallery">
          <button class="gallery-nav gallery-prev" @click="prevImage" v-if="images.length > 1">
            <span>‹</span>
          </button>

          <div class="main-image">
            <img
                :src="currentImageSrc"
                :alt="collection?.address || '의류수거함'"
                @error="handleImageError"
                @load="handleImageLoad"
            />
          </div>

          <button class="gallery-nav gallery-next" @click="nextImage" v-if="images.length > 1">
            <span>›</span>
          </button>
        </div>

        <div class="image-indicators" v-if="images.length > 1">
          <span
              v-for="(image, index) in images"
              :key="index"
              class="indicator"
              :class="{ active: currentImageIndex === index }"
              @click="setCurrentImage(index)"
          ></span>
        </div>

        <button class="close-btn" @click="closePanel">
          ✕
        </button>
      </div>

      <div class="panel-content" v-if="collection">
        <!-- ✅ 메인 정보 섹션 -->
        <div class="main-info-section">
          <h2 class="main-address">{{ collection.address }}</h2>
          <p class="sub-address">{{ collection.detailAddress }}</p>

          <!-- ✅ 거리 정보와 북마크 버튼을 같은 줄에 배치 -->
          <div class="distance-bookmark-row">
            <div class="distance-info">
              <span class="distance-label">내 위치에서</span>
              <span class="distance-value">{{ collection.distance }}</span>
            </div>

            <button
                class="bookmark-btn-inline"
                :class="{ bookmarked: collection.isBookmarked }"
                @click="toggleBookmark"
                :title="collection.isBookmarked ? '북마크 제거' : '북마크 추가'"
            >
              {{ collection.isBookmarked ? '📌' : '🔖' }}
            </button>
          </div>
        </div>

        <!-- ✅ 리뷰 섹션 -->
        <div class="review-section">
          <div class="review-header">
            <div class="review-tabs">
              <button
                  class="review-tab"
                  :class="{ active: reviewMode === 'view' }"
                  @click="setReviewMode('view')"
              >
                <span class="tab-text">리뷰 보기({{ submittedReviews.length }})</span>
              </button>
              <button
                  class="review-tab"
                  :class="{ active: reviewMode === 'write' }"
                  @click="setReviewMode('write')"
              >
                <span class="tab-text">리뷰 쓰기</span>
              </button>
            </div>
          </div>

          <!-- ✅ 리뷰 보기 모드 -->
          <div v-if="reviewMode === 'view'" class="review-list">
            <!-- 작성된 리뷰들이 여기에 동적으로 표시됩니다 -->
            <div v-if="submittedReviews.length === 0" class="no-reviews">
              <div class="no-reviews-icon">📝</div>
              <p class="no-reviews-text">아직 작성된 리뷰가 없습니다.</p>
              <p class="no-reviews-subtext">첫 번째 리뷰를 작성해보세요!</p>
            </div>

            <!-- 작성된 리뷰 목록 -->
            <div
                v-for="(review, index) in submittedReviews"
                :key="index"
                class="review-item"
            >
              <div class="review-header-info">
                <div class="user-avatar">
                  <div class="avatar-placeholder">U</div>
                </div>
                <div class="user-info">
                  <span class="username">사용자</span>
                  <span class="review-date">{{ formatDate(review.timestamp) }}</span>
                </div>
              </div>

              <!-- 리뷰 사진들 -->
              <div v-if="review.photos && review.photos.length > 0" class="review-photos">
                <div
                    v-for="(photo, photoIndex) in review.photos"
                    :key="photoIndex"
                    class="review-image"
                >
                  <img :src="photo.url" :alt="`리뷰 사진 ${photoIndex + 1}`" />
                </div>
              </div>

              <div class="review-content">
                <p>{{ review.text }}</p>
              </div>
            </div>
          </div>

          <!-- ✅ 리뷰 쓰기 모드 -->
          <div v-else-if="reviewMode === 'write'" class="review-write-section">
            <div class="write-form">
              <!-- 리뷰 텍스트 입력 -->
              <div class="review-text-area">
                <textarea
                    v-model="newReview.text"
                    placeholder="이 의류수거함에 대한 리뷰를 남겨보세요. (예: 위치, 접근성, 상태 등)"
                    class="review-textarea"
                    rows="6"
                ></textarea>

                <!-- 하단 액션 버튼들 - 텍스트 영역 바로 밑 -->
                <div class="action-buttons-row">
                  <!-- 사진 추가 버튼 -->
                  <button class="photo-add-btn" @click="triggerFileInput">
                    <input
                        type="file"
                        ref="photoInput"
                        accept="image/*"
                        multiple
                        @change="handlePhotoUpload"
                        style="display: none"
                    />
                    <span class="photo-icon">📷</span>
                  </button>

                  <!-- 등록 버튼 -->
                  <button
                      class="submit-btn"
                      :disabled="!newReview.text.trim()"
                      @click="submitReview"
                  >
                    등록
                  </button>
                </div>
              </div>

              <!-- 업로드된 사진 미리보기 -->
              <div v-if="newReview.photos.length > 0" class="photo-preview-section">
                <div class="photo-preview-list">
                  <div
                      v-for="(photo, index) in newReview.photos"
                      :key="index"
                      class="photo-preview-item"
                  >
                    <img :src="photo.url" :alt="`사진 ${index + 1}`" />
                    <button class="remove-photo-btn" @click="removePhoto(index)">✕</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="panel-loading">
        <div class="loading-spinner">⏳</div>
        <p>정보를 불러오는 중...</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CollectionInfoPanel',

  props: {
    collection: {
      type: Object,
      default: null
    },
    isVisible: {
      type: Boolean,
      default: false
    }
  },

  emits: ['close', 'bookmark-toggle', 'navigate', 'review-submit'],

  data() {
    return {
      isMobile: false,
      currentImageIndex: 0,
      reviewMode: 'view', // 'view' or 'write'
      reviewCount: 7,

      // ✅ assets 폴더의 실제 이미지 파일들
      images: [],

      // ✅ 새 리뷰 데이터
      newReview: {
        text: '',
        photos: []
      },

      // ✅ 제출된 리뷰들 저장
      submittedReviews: [],

      // 이미지 로드 상태
      imageLoadError: false
    }
  },

  created() {
    // ✅ 컴포넌트 생성시 이미지 경로 설정
    this.loadImages()
  },

  computed: {
    showOverlay() {
      return this.isMobile && this.isVisible
    },

    currentImageSrc() {
      if (this.images.length === 0) {
        return this.getPlaceholderImage()
      }
      const currentImage = this.images[this.currentImageIndex]
      return currentImage || this.getPlaceholderImage()
    }
  },

  mounted() {
    this.checkScreenSize()
    window.addEventListener('resize', this.checkScreenSize)
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.checkScreenSize)
  },

  methods: {
    checkScreenSize() {
      this.isMobile = window.innerWidth <= 768
    },

    closePanel() {
      this.$emit('close')
    },

    toggleBookmark() {
      if (this.collection) {
        this.$emit('bookmark-toggle', this.collection)
      }
    },

    // ✅ 이미지 로드
    loadImages() {
      try {
        // assets 폴더의 이미지들을 동적으로 import
        this.images = [
          this.getImageUrl('collection-default.jpg'),
          // 추가 이미지들이 있다면 여기에 추가
          // this.getImageUrl('collection-2.jpg'),
          // this.getImageUrl('collection-3.jpg'),
        ].filter(Boolean) // null/undefined 제거
      } catch (error) {
        console.error('이미지 로드 실패:', error)
        this.images = []
      }
    },

    // ✅ 이미지 URL 생성 헬퍼
    getImageUrl(filename) {
      try {
        // Vite의 동적 import 방식 사용
        return new URL(`../assets/images/collections/${filename}`, import.meta.url).href
      } catch (error) {
        console.error(`이미지 로드 실패: ${filename}`, error)
        return null
      }
    },
    prevImage() {
      this.currentImageIndex = this.currentImageIndex > 0
          ? this.currentImageIndex - 1
          : this.images.length - 1
    },

    nextImage() {
      this.currentImageIndex = this.currentImageIndex < this.images.length - 1
          ? this.currentImageIndex + 1
          : 0
    },

    setCurrentImage(index) {
      this.currentImageIndex = index
    },

    // ✅ 이미지 에러 처리
    handleImageError() {
      this.imageLoadError = true
    },

    handleImageLoad() {
      this.imageLoadError = false
    },

    getPlaceholderImage() {
      // ✅ assets 폴더의 기본 이미지 사용
      try {
        return this.getImageUrl('collection-default.jpg') || this.getFallbackSvg()
      } catch (error) {
        console.error('플레이스홀더 이미지 로드 실패:', error)
        return this.getFallbackSvg()
      }
    },

    // ✅ SVG 폴백 이미지
    getFallbackSvg() {
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iIzRDQUY1MCIvPgo8dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE4IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuydmOuliOyImOqxsO2VqDwvdGV4dD4KPC9zdmc+'
    },

    // ✅ 리뷰 모드 전환
    setReviewMode(mode) {
      this.reviewMode = mode
    },

    // ✅ 사진 업로드 관련
    triggerFileInput() {
      this.$refs.photoInput.click()
    },

    handlePhotoUpload(event) {
      const files = Array.from(event.target.files)

      files.forEach(file => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader()
          reader.onload = (e) => {
            this.newReview.photos.push({
              file: file,
              url: e.target.result,
              name: file.name
            })
          }
          reader.readAsDataURL(file)
        }
      })

      // 파일 입력 초기화
      event.target.value = ''
    },

    removePhoto(index) {
      this.newReview.photos.splice(index, 1)
    },

    // ✅ 리뷰 제출
    submitReview() {
      if (!this.newReview.text.trim()) {
        alert('리뷰 내용을 입력해주세요.')
        return
      }

      const reviewData = {
        text: this.newReview.text,
        photos: [...this.newReview.photos], // 사진 배열 복사
        collectionId: this.collection?.id,
        timestamp: new Date().toISOString()
      }

      console.log('📝 리뷰 제출:', reviewData)

      // ✅ 제출된 리뷰를 로컬 배열에 추가 (최신순)
      this.submittedReviews.unshift(reviewData)

      // ✅ 리뷰 카운트 업데이트
      this.reviewCount = this.submittedReviews.length

      // 부모 컴포넌트에 리뷰 데이터 전달
      this.$emit('review-submit', reviewData)

      // 폼 초기화
      this.newReview = {
        text: '',
        photos: []
      }

      // 리뷰 보기 모드로 전환
      this.reviewMode = 'view'

      alert('리뷰가 등록되었습니다!')
    },

    // ✅ 날짜 포맷팅
    formatDate(timestamp) {
      try {
        const date = new Date(timestamp)
        const now = new Date()
        const diffMs = now - date
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMins / 60)
        const diffDays = Math.floor(diffHours / 24)

        if (diffMins < 1) return '방금 전'
        if (diffMins < 60) return `${diffMins}분 전`
        if (diffHours < 24) return `${diffHours}시간 전`
        if (diffDays < 7) return `${diffDays}일 전`

        return date.toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      } catch (error) {
        return '날짜 정보 없음'
      }
    }
  }
}
</script>

<style scoped>
.info-panel-container {
  position: fixed;
  top: 80px;
  left: 388px;
  bottom: 20px;
  z-index: 2000;
  pointer-events: none;
  transition: all 0.3s ease;
}

.info-panel-container.panel-visible {
  pointer-events: all;
}

.panel-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 1999;
  opacity: 0;
  transition: opacity 0.3s ease;
  display: none;
}

.info-panel-container.panel-visible .panel-overlay {
  opacity: 1;
}

.info-panel {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  background: white;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transform: translateX(-100%);
  transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  z-index: 2001;
  border: 1px solid #e5e5e5;
  border-radius: 12px;
}

.info-panel.panel-visible {
  transform: translateX(0);
}

.info-panel.panel-desktop {
  width: 400px;
}

.info-panel.panel-mobile {
  width: calc(100vw - 40px);
  max-width: 400px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  border-radius: 16px;
}

/* ✅ 이미지 갤러리 섹션 (실제 이미지 사용) */
.image-gallery-section {
  position: relative;
  height: 200px;
  background: #f5f5f5;
  overflow: hidden;
  border-radius: 12px 12px 0 0;
}

.image-gallery {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.main-image {
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.main-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.gallery-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.9);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 18px;
  font-weight: bold;
  color: #333;
  transition: all 0.2s;
  z-index: 10;
}

.gallery-nav:hover {
  background: white;
  transform: translateY(-50%) scale(1.1);
}

.gallery-prev {
  left: 10px;
}

.gallery-next {
  right: 10px;
}

.image-indicators {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 6px;
  z-index: 10;
}

.indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.2s;
}

.indicator.active {
  background: white;
  transform: scale(1.2);
}

.close-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 16px;
  color: #666;
  transition: all 0.2s;
  z-index: 10;
}

.close-btn:hover {
  background: white;
  color: #333;
  transform: scale(1.1);
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

/* ✅ 메인 정보 섹션 */
.main-info-section {
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.main-address {
  font-size: 18px;
  font-weight: 700;
  color: #333;
  margin: 0 0 6px 0;
  line-height: 1.3;
}

.sub-address {
  font-size: 14px;
  color: #666;
  margin: 0 0 12px 0;
  line-height: 1.4;
}

/* ✅ 거리 정보와 북마크 버튼을 같은 줄에 배치 */
.distance-bookmark-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.distance-info {
  display: flex;
  align-items: center;
  gap: 6px;
}

.distance-label {
  font-size: 12px;
  color: #999;
}

.distance-value {
  font-size: 14px;
  font-weight: 600;
  color: #6366f1;
}

.bookmark-btn-inline {
  background: none;
  border: 1px solid #e0e0e0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 16px;
  color: #ccc;
  transition: all 0.2s;
}

.bookmark-btn-inline:hover {
  background: #f0f0f0;
  transform: scale(1.1);
}

.bookmark-btn-inline.bookmarked {
  color: #6366f1;
  background: #e3f2fd;
  border-color: #6366f1;
}

/* ✅ 리뷰 섹션 */
.review-section {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.review-header {
  border-bottom: 1px solid #f0f0f0;
}

.review-tabs {
  display: flex;
}

.review-tab {
  flex: 1;
  padding: 12px 16px;
  border: none;
  background: white;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.review-tab:hover {
  background: #f8f9fa;
}

.review-tab.active {
  color: #333;
  font-weight: 600;
  border-bottom-color: #6366f1;
}

/* ✅ 리뷰 목록 */
.review-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.review-item {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f5f5f5;
}

.review-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.review-header-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-placeholder {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #6366f1;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
}

.username {
  font-size: 13px;
  font-weight: 600;
  color: #333;
}

.review-image {
  margin: 8px 0;
  border-radius: 8px;
  overflow: hidden;
  width: 120px;
  height: 80px;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.review-image-placeholder {
  width: 100%;
  height: 100%;
  background: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
}

/* ✅ 빈 리뷰 상태 */
.no-reviews {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  color: #666;
}

.no-reviews-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.no-reviews-text {
  font-size: 16px;
  font-weight: 500;
  margin: 0 0 8px 0;
  color: #333;
}

.no-reviews-subtext {
  font-size: 14px;
  margin: 0;
  color: #666;
}

/* ✅ 작성된 리뷰 스타일 */
.review-date {
  font-size: 11px;
  color: #999;
  margin-left: 8px;
}

.review-photos {
  display: flex;
  gap: 8px;
  margin: 8px 0;
  flex-wrap: wrap;
}

.review-photos .review-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e0e0e0;
}

.review-photos .review-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.review-content {
  line-height: 1.5;
}

.review-content p {
  margin: 0 0 4px 0;
  font-size: 13px;
  color: #333;
}

.review-content p:last-child {
  margin-bottom: 0;
}

/* ✅ 리뷰 쓰기 섹션 - 새로운 디자인 */
.review-write-section {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.write-form {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.review-text-area {
  flex: 1;
  position: relative;
}

.review-textarea {
  width: 100%;
  min-height: 200px;
  padding: 16px;
  padding-bottom: 60px; /* ✅ 하단 버튼 공간 확보 */
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.5;
  resize: vertical;
  font-family: inherit;
  box-sizing: border-box;
  background: #f8f9fa;
}

.review-textarea:focus {
  outline: none;
  border-color: #6366f1;
  background: white;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
}

.review-textarea::placeholder {
  color: #999;
}

/* ✅ 버튼들을 텍스트 영역 우하단에 위치 */
.action-buttons-row {
  position: absolute;
  bottom: 12px;
  right: 12px;
  display: flex;
  gap: 8px;
  align-items: center;
}

/* ✅ 사진 추가 버튼 (원형, 작은 크기) */
.photo-add-btn {
  width: 40px;
  height: 40px;
  border: 1px solid #e0e0e0;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.photo-add-btn:hover {
  background: #f5f5f5;
  border-color: #6366f1;
  transform: scale(1.05);
}

.photo-icon {
  font-size: 16px;
}

/* ✅ 등록 버튼 (보라색, 작은 크기) */
.submit-btn {
  background: #6366f1;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 60px;
  height: 40px;
}

.submit-btn:hover:not(:disabled) {
  background: #5b21b6;
  transform: translateY(-1px);
}

.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
}

/* ✅ 사진 미리보기 섹션 */
.photo-preview-section {
  margin-top: 12px;
}

.photo-preview-list {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.photo-preview-item {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e0e0e0;
}

.photo-preview-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-photo-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.remove-photo-btn:hover {
  background: rgba(0, 0, 0, 0.9);
  transform: scale(1.1);
}

/* ✅ 로딩 상태 */
.panel-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.loading-spinner {
  font-size: 24px;
  margin-bottom: 12px;
  animation: spin 2s linear infinite;
}

.panel-loading p {
  font-size: 14px;
  color: #666;
  margin: 0;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* ✅ 스크롤바 스타일링 */
.panel-content::-webkit-scrollbar,
.review-list::-webkit-scrollbar {
  width: 3px;
}

.panel-content::-webkit-scrollbar-track,
.review-list::-webkit-scrollbar-track {
  background: #f8f9fa;
}

.panel-content::-webkit-scrollbar-thumb,
.review-list::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 2px;
}

.panel-content::-webkit-scrollbar-thumb:hover,
.review-list::-webkit-scrollbar-thumb:hover {
  background: #bbb;
}

/* ✅ 반응형 디자인 */
@media (max-width: 768px) {
  .info-panel-container {
    top: 60px;
    left: 20px;
    right: 20px;
    bottom: 20px;
  }

  .panel-overlay {
    display: block;
  }

  .info-panel.panel-mobile {
    width: 100%;
    max-width: none;
    border-radius: 12px;
    transform: translateY(100%);
  }

  .info-panel.panel-mobile.panel-visible {
    transform: translateY(0);
  }

  .image-gallery-section {
    height: 180px;
    border-radius: 12px 12px 0 0;
  }

  .main-info-section {
    padding: 16px;
  }

  .main-address {
    font-size: 16px;
  }

  .review-list {
    padding: 12px;
  }

  .review-write-section {
    padding: 12px;
  }

  .review-textarea {
    min-height: 100px;
  }
}

@media (min-width: 1200px) {
  .info-panel-container {
    left: 398px;
  }
}
</style>