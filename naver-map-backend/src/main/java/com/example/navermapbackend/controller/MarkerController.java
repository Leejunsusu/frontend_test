package com.example.navermapbackend.controller;

import com.example.navermapbackend.model.Marker;
import com.example.navermapbackend.service.MarkerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/markers")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:5173", "http://localhost:5173"})
public class MarkerController {

    private final MarkerService markerService;

    @Autowired
    public MarkerController(MarkerService markerService) {
        this.markerService = markerService;
    }

    // 🧪 테스트 엔드포인트 (연결 테스트용)
    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("✅ 마커 API 서버가 정상 작동중입니다! (H2 Database 연결됨)");
    }

    // 📍 모든 마커 조회
    @GetMapping
    public ResponseEntity<List<Marker>> getAllMarkers() {
        try {
            List<Marker> markers = markerService.getAllMarkers();
            return ResponseEntity.ok(markers);
        } catch (Exception e) {
            System.err.println("❌ 마커 조회 오류: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}