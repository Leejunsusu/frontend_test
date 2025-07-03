package com.example.navermapbackend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        System.out.println("🌐 CORS 설정 적용 중...");

        registry.addMapping("/**")  // 모든 경로에 대해 CORS 허용
                .allowedOrigins(
                        "http://localhost:3000",              // Vue.js 개발 서버 (Vite 기본)
                        "http://localhost:5173",              // Vue.js 개발 서버 (Vite 대안)
                        "http://127.0.0.1:3000",              // 로컬 주소 변형
                        "http://127.0.0.1:5173"               // 로컬 주소 변형
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // 허용할 HTTP 메서드
                .allowedHeaders("*")                      // 모든 헤더 허용
                .allowCredentials(false)                   // 쿠키/인증 정보 허용 안함
                .maxAge(3600);                           // preflight 캐시 시간 (1시간)

        System.out.println("✅ CORS 설정 완료!");
        System.out.println("🔗 허용된 Origin: http://localhost:3000, http://localhost:5173");
        System.out.println("🔧 허용된 메서드: GET, POST, PUT, DELETE, OPTIONS");
    }
}