-- src/main/resources/data.sql

-- 🧪 테스트 사용자 생성 (비밀번호: "password123")
INSERT INTO users (name, email, password, phone, agree_to_marketing, created_at, updated_at) VALUES
    ('관리자', 'admin@test.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', '010-1234-5678', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO users (name, email, password, phone, agree_to_marketing, created_at, updated_at) VALUES
    ('테스트유저', 'user@test.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', '010-9876-5432', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 📍 마커 데이터 (user_id 포함 - 각 사용자가 생성한 마커들)
INSERT INTO markers (latitude, longitude, title, description, category, user_id, created_at, updated_at) VALUES
    (37.5666805, 126.9784147, '서울시청', '대한민국의 수도 서울의 시청입니다.', 'government', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO markers (latitude, longitude, title, description, category, user_id, created_at, updated_at) VALUES
    (37.4979462, 127.0276368, '강남역', '서울의 대표적인 번화가입니다.', 'transport', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO markers (latitude, longitude, title, description, category, user_id, created_at, updated_at) VALUES
    (37.5636003, 126.9834976, '명동', '쇼핑과 관광의 중심지입니다.', 'shopping', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO markers (latitude, longitude, title, description, category, user_id, created_at, updated_at) VALUES
    (37.5663, 126.9779, '경복궁', '조선왕조의 정궁입니다.', 'tourist', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO markers (latitude, longitude, title, description, category, user_id, created_at, updated_at) VALUES
    (37.5512, 126.9882, '남산타워', '서울의 랜드마크입니다.', 'tourist', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO markers (latitude, longitude, title, description, category, user_id, created_at, updated_at) VALUES
    (37.5172, 127.0473, '잠실롯데타워', '대한민국에서 가장 높은 빌딩입니다.', 'tourist', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO markers (latitude, longitude, title, description, category, user_id, created_at, updated_at) VALUES
    (37.5658, 126.9772, '광화문광장', '역사와 문화의 중심지입니다.', 'tourist', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO markers (latitude, longitude, title, description, category, user_id, created_at, updated_at) VALUES
    (37.5400, 126.9921, '용산역', '교통의 요충지입니다.', 'transport', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);