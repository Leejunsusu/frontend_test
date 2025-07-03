// src/main/java/com/example/navermapbackend/controller/AuthController.java
package com.example.navermapbackend.controller;

import com.example.navermapbackend.dto.LoginRequest;
import com.example.navermapbackend.dto.LoginResponse;
import com.example.navermapbackend.dto.RegisterRequest;
import com.example.navermapbackend.dto.UserResponse;
import com.example.navermapbackend.service.AuthService;
import com.example.navermapbackend.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"}, allowCredentials = "true")
public class AuthController {

    private final AuthService authService;
    private final JwtUtil jwtUtil;

    // 🔐 로그인
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request,
                                   HttpServletResponse response) {
        try {
            log.info("로그인 시도: {}", request.getEmail());

            // 사용자 인증
            UserResponse user = authService.authenticateUser(request.getEmail(), request.getPassword());

            // JWT 토큰 생성
            String accessToken = jwtUtil.generateAccessToken(user.getId(), user.getEmail());
            String refreshToken = jwtUtil.generateRefreshToken(user.getId());

            // Refresh Token을 HttpOnly 쿠키로 설정
            Cookie refreshCookie = new Cookie("refreshToken", refreshToken);
            refreshCookie.setHttpOnly(true);
            refreshCookie.setSecure(false); // 개발환경에서는 false
            refreshCookie.setPath("/");
            refreshCookie.setMaxAge(7 * 24 * 60 * 60); // 7일
            response.addCookie(refreshCookie);

            // 응답 데이터
            LoginResponse loginResponse = LoginResponse.builder()
                    .token(accessToken)
                    .user(user)
                    .message("로그인 성공")
                    .build();

            log.info("로그인 성공: {}", user.getEmail());
            return ResponseEntity.ok(loginResponse);

        } catch (Exception e) {
            log.error("로그인 실패: {}", e.getMessage());

            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            errorResponse.put("error", "LOGIN_FAILED");

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
        }
    }

    // 📝 회원가입
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            log.info("회원가입 시도: {}", request.getEmail());

            // 이메일 중복 확인
            if (authService.existsByEmail(request.getEmail())) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("message", "이미 사용 중인 이메일입니다.");
                errorResponse.put("error", "EMAIL_ALREADY_EXISTS");
                return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);
            }

            // 사용자 생성
            UserResponse user = authService.createUser(request);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "회원가입 성공");
            response.put("user", user);

            log.info("회원가입 성공: {}", user.getEmail());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (Exception e) {
            log.error("회원가입 실패: {}", e.getMessage());

            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "회원가입에 실패했습니다.");
            errorResponse.put("error", "REGISTRATION_FAILED");

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // 📧 이메일 중복 확인
    @GetMapping("/check-email")
    public ResponseEntity<?> checkEmail(@RequestParam String email) {
        try {
            boolean exists = authService.existsByEmail(email);

            Map<String, Object> response = new HashMap<>();
            response.put("exists", exists);
            response.put("message", exists ? "이미 사용 중인 이메일입니다." : "사용 가능한 이메일입니다.");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("이메일 중복 확인 실패: {}", e.getMessage());

            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "이메일 중복 확인에 실패했습니다.");
            errorResponse.put("error", "EMAIL_CHECK_FAILED");

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // 🚪 로그아웃
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        try {
            log.info("로그아웃 요청");

            // Refresh Token 쿠키 제거
            Cookie refreshCookie = new Cookie("refreshToken", "");
            refreshCookie.setHttpOnly(true);
            refreshCookie.setSecure(false);
            refreshCookie.setPath("/");
            refreshCookie.setMaxAge(0); // 즉시 삭제
            response.addCookie(refreshCookie);

            Map<String, String> responseBody = new HashMap<>();
            responseBody.put("message", "로그아웃 성공");

            return ResponseEntity.ok(responseBody);

        } catch (Exception e) {
            log.error("로그아웃 실패: {}", e.getMessage());

            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "로그아웃에 실패했습니다.");
            errorResponse.put("error", "LOGOUT_FAILED");

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // 👤 현재 사용자 정보 조회 (JWT에서 이메일 추출)
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(HttpServletRequest request) {
        try {
            // Authorization 헤더에서 토큰 추출
            String token = getTokenFromRequest(request);

            if (token == null || !jwtUtil.validateToken(token)) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("message", "인증되지 않은 사용자입니다.");
                errorResponse.put("error", "UNAUTHORIZED");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
            }

            // 토큰에서 이메일 추출
            String email = jwtUtil.getEmailFromSubject(token);
            UserResponse user = authService.getUserByEmail(email);

            log.info("사용자 정보 조회: {}", email);
            return ResponseEntity.ok(user);

        } catch (Exception e) {
            log.error("사용자 정보 조회 실패: {}", e.getMessage());

            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "사용자 정보를 조회할 수 없습니다.");
            errorResponse.put("error", "USER_NOT_FOUND");

            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
    }

    // 🔄 토큰 갱신
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@CookieValue(value = "refreshToken", required = false) String refreshToken) {
        try {
            if (refreshToken == null || refreshToken.isEmpty()) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("message", "Refresh token이 없습니다.");
                errorResponse.put("error", "NO_REFRESH_TOKEN");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
            }

            // Refresh Token 검증
            if (!jwtUtil.validateToken(refreshToken)) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("message", "유효하지 않은 refresh token입니다.");
                errorResponse.put("error", "INVALID_REFRESH_TOKEN");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
            }

            // 새로운 Access Token 생성
            Long userId = jwtUtil.getUserIdFromToken(refreshToken);

            // 사용자 정보로 이메일 가져오기
            UserResponse user = authService.getUserById(userId);
            String newAccessToken = jwtUtil.generateAccessToken(user.getId(), user.getEmail());

            Map<String, String> response = new HashMap<>();
            response.put("token", newAccessToken);
            response.put("message", "토큰 갱신 성공");

            log.info("토큰 갱신 성공: {}", user.getEmail());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("토큰 갱신 실패: {}", e.getMessage());

            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "토큰 갱신에 실패했습니다.");
            errorResponse.put("error", "TOKEN_REFRESH_FAILED");

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
        }
    }

    // 🔐 비밀번호 재설정 요청
    @PostMapping("/password-reset-request")
    public ResponseEntity<?> requestPasswordReset(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");

            if (email == null || email.isEmpty()) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("message", "이메일을 입력해주세요.");
                errorResponse.put("error", "EMAIL_REQUIRED");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }

            // 비밀번호 재설정 이메일 전송
            authService.sendPasswordResetEmail(email);

            Map<String, String> response = new HashMap<>();
            response.put("message", "비밀번호 재설정 이메일을 전송했습니다.");

            log.info("비밀번호 재설정 요청: {}", email);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("비밀번호 재설정 요청 실패: {}", e.getMessage());

            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "비밀번호 재설정 요청에 실패했습니다.");
            errorResponse.put("error", "PASSWORD_RESET_FAILED");

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // Authorization 헤더에서 토큰 추출 유틸리티 메서드
    private String getTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");

        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }

        return null;
    }
}