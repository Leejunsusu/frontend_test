// src/main/java/com/example/navermapbackend/service/AuthService.java
package com.example.navermapbackend.service;

import com.example.navermapbackend.dto.RegisterRequest;
import com.example.navermapbackend.dto.UserResponse;
import com.example.navermapbackend.model.User;
import com.example.navermapbackend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // 사용자 인증 (로그인)
    public UserResponse authenticateUser(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 이메일입니다."));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("비밀번호가 일치하지 않습니다.");
        }

        log.info("사용자 인증 성공: {}", email);
        return convertToUserResponse(user);
    }

    // 사용자 생성 (회원가입)
    public UserResponse createUser(RegisterRequest request) {
        // 이메일 중복 체크
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("이미 사용 중인 이메일입니다.");
        }

        // 전화번호 중복 체크 (전화번호가 있는 경우)
        if (request.getPhone() != null && !request.getPhone().isEmpty()) {
            if (userRepository.existsByPhone(request.getPhone())) {
                throw new RuntimeException("이미 사용 중인 전화번호입니다.");
            }
        }

        // 비밀번호 암호화
        String encodedPassword = passwordEncoder.encode(request.getPassword());

        // 사용자 생성
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(encodedPassword)
                .phone(request.getPhone())
                .agreeToMarketing(request.isAgreeToMarketing())
                .build();

        User savedUser = userRepository.save(user);
        log.info("새 사용자 생성: {}", savedUser.getEmail());

        return convertToUserResponse(savedUser);
    }

    // 이메일로 사용자 조회
    @Transactional(readOnly = true)
    public UserResponse getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        return convertToUserResponse(user);
    }

    // 이메일 존재 여부 확인
    @Transactional(readOnly = true)
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    // 전화번호 존재 여부 확인
    @Transactional(readOnly = true)
    public boolean existsByPhone(String phone) {
        return userRepository.existsByPhone(phone);
    }

    // ID로 사용자 조회 (토큰 갱신시 필요)
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        return convertToUserResponse(user);
    }
    public void sendPasswordResetEmail(String email) {
        // 이메일이 존재하는지 확인
        if (!userRepository.existsByEmail(email)) {
            throw new RuntimeException("존재하지 않는 이메일입니다.");
        }

        // TODO: 실제 이메일 전송 로직 구현
        log.info("비밀번호 재설정 이메일 전송: {}", email);

        // 임시로 로그만 출력
        // 실제로는 이메일 서비스를 통해 재설정 링크 전송
    }

    // User 엔티티를 UserResponse DTO로 변환
    private UserResponse convertToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .agreeToMarketing(user.isAgreeToMarketing())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}