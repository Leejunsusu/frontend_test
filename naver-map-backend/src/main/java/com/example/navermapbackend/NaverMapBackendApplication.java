package com.example.navermapbackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class NaverMapBackendApplication {

	public static void main(String[] args) {
		System.out.println("🚀 네이버 지도 백엔드 서버 시작!");
		SpringApplication.run(NaverMapBackendApplication.class, args);
		System.out.println("✅ 서버 실행 완료: http://localhost:8080");
	}

}
