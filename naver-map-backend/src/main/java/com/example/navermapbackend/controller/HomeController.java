package com.example.navermapbackend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {

    // 🏠 루트 경로 처리 (서버 상태 확인용)
    @GetMapping("/")
    public String home() {
        return """
            <html>
            <head>
                <title>네이버 지도 백엔드 서버</title>
                <style>
                    body { 
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white; 
                        margin: 0; 
                        padding: 40px;
                        min-height: 100vh;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    .container { 
                        text-align: center; 
                        background: rgba(255,255,255,0.1);
                        padding: 40px;
                        border-radius: 20px;
                        backdrop-filter: blur(10px);
                        box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                    }
                    h1 { color: #fff; margin-bottom: 20px; }
                    .api-list { 
                        background: rgba(255,255,255,0.1); 
                        padding: 20px; 
                        border-radius: 10px; 
                        margin: 20px 0;
                    }
                    .api-item { 
                        margin: 10px 0; 
                        padding: 10px;
                        background: rgba(255,255,255,0.1);
                        border-radius: 5px;
                    }
                    a { 
                        color: #ffd700; 
                        text-decoration: none; 
                        font-weight: bold;
                    }
                    a:hover { 
                        color: #fff; 
                        text-decoration: underline;
                    }
                    .status { 
                        color: #00ff88; 
                        font-size: 1.2em; 
                        margin: 20px 0;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>🚀 네이버 지도 백엔드 서버</h1>
                    <div class="status">✅ 서버가 정상적으로 실행중입니다!</div>
                    
                    <div class="api-list">
                        <h3>📡 사용 가능한 API 엔드포인트</h3>
                        
                        <div class="api-item">
                            <strong>🏠 서버 테스트:</strong>
                            <a href="/api/markers/test">/api/markers/test</a>
                        </div>
                        
                        <div class="api-item">
                            <strong>📍 모든 마커 조회:</strong>
                            <a href="/api/markers">/api/markers</a>
                        </div>
                    </div>
                    
                    <p>🔗 Vue.js 프론트엔드와 연결 준비 완료!</p>
                    <p>⚡ 포트: 8080 | 🌐 CORS: 활성화됨</p>
                    <p>📖 읽기 전용 API - 간소화된 버전</p>
                </div>
            </body>
            </html>
            """;
    }
}