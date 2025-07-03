// src/main/java/com/example/navermapbackend/config/SecurityConfig.java
package com.example.navermapbackend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
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

                // 요청 권한 설정
                .authorizeHttpRequests(auth -> auth
                        // 인증 관련 엔드포인트는 허용
                        .requestMatchers("/api/auth/**").permitAll()
                        // 마커 관련 엔드포인트 허용 (현재는 읽기 전용)
                        .requestMatchers("/api/markers/**").permitAll()
                        // 홈페이지 허용
                        .requestMatchers("/", "/health").permitAll()
                        // /api/auth/me는 인증 필요
                        .requestMatchers("/api/auth/me").authenticated()
                        // 그 외는 허용 (현재는 단순한 구조)
                        .anyRequest().permitAll()
                );

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}