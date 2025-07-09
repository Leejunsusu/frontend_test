package com.example.navermapbackend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // CSRF 비활성화 (API 서버이므로)
                .csrf(csrf -> csrf.disable())

                // CORS 설정
                .cors(cors -> {})

                // 세션 비활성화 (JWT 사용)
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // JWT 필터 추가
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)

                // 🔒 요청 권한 설정 (보안 강화)
                .authorizeHttpRequests(auth -> auth
                        // 🏠 홈페이지 및 헬스 체크
                        .requestMatchers("/", "/health").permitAll()

                        // 🔓 인증 관련 엔드포인트는 허용
                        .requestMatchers("/api/auth/login", "/api/auth/register").permitAll()
                        .requestMatchers("/api/auth/check-email", "/api/auth/password-reset-request").permitAll()
                        .requestMatchers("/api/auth/refresh").permitAll()

                        // 🔒 인증 필요한 엔드포인트
                        .requestMatchers("/api/auth/me", "/api/auth/logout").authenticated()

                        // 📍 마커 관련 엔드포인트 (읽기는 공개, 쓰기는 인증 필요)
                        .requestMatchers(HttpMethod.GET, "/api/markers").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/markers/{id}").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/markers/test").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/markers/category/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/markers/search").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/markers/area").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/markers/nearby").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/markers/paged").permitAll()

                        // 🔒 마커 생성/수정/삭제는 인증 필요
                        .requestMatchers(HttpMethod.POST, "/api/markers").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/markers/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/markers/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/markers/my/**").authenticated()

                        // 🗄️ H2 콘솔 (개발 환경에서만)
                        .requestMatchers("/h2-console/**").permitAll()

                        // 🔒 그 외 모든 요청은 인증 필요
                        .anyRequest().authenticated()
                );

        // H2 콘솔을 위한 프레임 옵션 비활성화 (개발 환경에서만)
        http.headers(headers -> headers.frameOptions().disable());

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}