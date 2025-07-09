package com.example.navermapbackend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        System.out.println("🌐 CORS 설정 적용 중 (크롬 호환성 개선)...");

        registry.addMapping("/**")
                .allowedOrigins(
                        "http://localhost:3000",              // Vue.js 기본
                        "http://localhost:5173",              // Vite 기본
                        "http://127.0.0.1:3000",              // 로컬 IP
                        "http://127.0.0.1:5173",              // 로컬 IP
                        "http://localhost:8080",              // 백엔드 자체 테스트용
                        "http://localhost:4173",              // Vite 프리뷰
                        "http://localhost:8081"               // 다른 개발 포트
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD") // HEAD 추가
                .allowedHeaders("*")
                .allowCredentials(false)                  // ✅ 일관성 유지
                .maxAge(86400);                          // ✅ 24시간으로 연장 (크롬 최적화)

        System.out.println("✅ CORS 설정 완료 (크롬 호환성 개선)!");
        System.out.println("🔗 허용된 모든 Origin 목록:");
        System.out.println("   - http://localhost:3000");
        System.out.println("   - http://localhost:5173");
        System.out.println("   - http://127.0.0.1:3000");
        System.out.println("   - http://127.0.0.1:5173");
        System.out.println("🔧 허용된 메서드: GET, POST, PUT, DELETE, OPTIONS, HEAD");
        System.out.println("⏰ Preflight 캐시: 24시간");
    }
}