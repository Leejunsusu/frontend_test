package com.example.navermapbackend.controller;

import com.example.navermapbackend.dto.ApiResponse;
import com.example.navermapbackend.dto.MarkerRequest;
import com.example.navermapbackend.dto.MarkerResponse;
import com.example.navermapbackend.dto.PagedResponse;
import com.example.navermapbackend.service.MarkerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/markers")
// ❌ @CrossOrigin 제거 (WebConfig로 통합하여 CORS 충돌 해결)
@RequiredArgsConstructor
public class MarkerController {

    private final MarkerService markerService;

    // 🧪 테스트 엔드포인트 (크롬 디버깅용 강화)
    @GetMapping("/test")
    public ResponseEntity<ApiResponse<String>> test() {
        log.info("🔍 [TEST] 마커 API 테스트 엔드포인트 호출됨");

        // ✅ 크롬 디버깅을 위한 추가 정보
        ApiResponse<String> response = ApiResponse.success(
                "✅ 마커 API 서버가 정상 작동중입니다! (크롬 호환성 확인됨)",
                "서버 연결 성공"
        );

        return ResponseEntity.ok()
                .header("X-Debug-Info", "Chrome-Compatible-Response") // 디버깅용 헤더
                .header("Content-Type", "application/json;charset=UTF-8")
                .body(response);
    }

    // 📍 모든 마커 조회 (크롬 호환성 개선)
    @GetMapping
    public ResponseEntity<ApiResponse<List<MarkerResponse>>> getAllMarkers() {
        try {
            log.info("🔍 [GET] 모든 마커 조회 요청 시작");

            List<MarkerResponse> markers = markerService.getAllMarkers();

            log.info("✅ [GET] 마커 조회 성공 - 총 {}개", markers.size());

            // ✅ 크롬 호환성을 위한 명시적 헤더 설정
            return ResponseEntity.ok()
                    .header("Content-Type", "application/json;charset=UTF-8")
                    .header("X-Total-Count", String.valueOf(markers.size()))
                    .header("Access-Control-Expose-Headers", "X-Total-Count,X-Debug-Info")
                    .body(ApiResponse.success(markers, "마커 조회 성공"));

        } catch (Exception e) {
            log.error("❌ [GET] 마커 조회 오류: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .header("Content-Type", "application/json;charset=UTF-8")
                    .body(ApiResponse.error("마커 조회에 실패했습니다.", "MARKER_FETCH_FAILED"));
        }
    }

    // ✅ 크롬 전용 디버깅 엔드포인트 추가
    @GetMapping("/debug/chrome")
    public ResponseEntity<ApiResponse<Object>> chromeDebug() {
        try {
            log.info("🔍 [DEBUG] 크롬 디버깅 엔드포인트 호출");

            // 간단한 테스트 데이터
            List<MarkerResponse> testMarkers = markerService.getAllMarkers();

            // 익명 클래스로 디버깅 정보 생성
            Object debugInfo = new Object() {
                public final String browser = "Chrome Debug Mode";
                public final String timestamp = java.time.LocalDateTime.now().toString();
                public final int markerCount = testMarkers.size();
                public final String status = "SUCCESS";
                public final List<MarkerResponse> sampleData = testMarkers.stream().limit(3).toList();
                public final String corsStatus = "ENABLED";
                public final String encoding = "UTF-8";
            };

            return ResponseEntity.ok()
                    .header("Content-Type", "application/json;charset=UTF-8")
                    .header("X-Debug-Chrome", "true")
                    .header("X-CORS-Status", "enabled")
                    .header("Access-Control-Expose-Headers", "X-Debug-Chrome,X-Total-Count,X-CORS-Status")
                    .body(ApiResponse.success(debugInfo, "크롬 디버깅 성공"));

        } catch (Exception e) {
            log.error("❌ [DEBUG] 크롬 디버깅 실패: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .header("Content-Type", "application/json;charset=UTF-8")
                    .body(ApiResponse.error("디버깅 실패", "DEBUG_FAILED"));
        }
    }

    // 🔧 CORS Preflight 처리를 위한 OPTIONS 메서드 명시적 추가
    @RequestMapping(value = {"", "/**"}, method = RequestMethod.OPTIONS)
    public ResponseEntity<?> handlePreflight() {
        log.info("🔍 [OPTIONS] CORS Preflight 요청 처리");
        return ResponseEntity.ok()
                .header("Access-Control-Allow-Origin", "*")
                .header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, HEAD")
                .header("Access-Control-Allow-Headers", "*")
                .header("Access-Control-Max-Age", "86400")
                .build();
    }

    // 🔒 마커 생성 (인증 필요)
    @PostMapping
    public ResponseEntity<ApiResponse<MarkerResponse>> createMarker(
            @Valid @RequestBody MarkerRequest request,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .header("Content-Type", "application/json;charset=UTF-8")
                        .body(ApiResponse.error("인증이 필요합니다.", "AUTHENTICATION_REQUIRED"));
            }

            String userEmail = authentication.getName();
            MarkerResponse marker = markerService.createMarker(request, userEmail);

            log.info("마커 생성 성공 - 사용자: {}, 마커 ID: {}", userEmail, marker.getId());
            return ResponseEntity.status(HttpStatus.CREATED)
                    .header("Content-Type", "application/json;charset=UTF-8")
                    .body(ApiResponse.success(marker, "마커 생성 성공"));

        } catch (Exception e) {
            log.error("마커 생성 실패: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .header("Content-Type", "application/json;charset=UTF-8")
                    .body(ApiResponse.error("마커 생성에 실패했습니다.", "MARKER_CREATE_FAILED"));
        }
    }

    // 📍 특정 마커 조회 (공개)
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MarkerResponse>> getMarkerById(@PathVariable Long id) {
        try {
            MarkerResponse marker = markerService.getMarkerById(id);
            return ResponseEntity.ok()
                    .header("Content-Type", "application/json;charset=UTF-8")
                    .body(ApiResponse.success(marker, "마커 조회 성공"));
        } catch (RuntimeException e) {
            log.error("마커 조회 실패 - ID: {}, 오류: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .header("Content-Type", "application/json;charset=UTF-8")
                    .body(ApiResponse.error("마커를 찾을 수 없습니다.", "MARKER_NOT_FOUND"));
        } catch (Exception e) {
            log.error("마커 조회 오류 - ID: {}, 오류: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .header("Content-Type", "application/json;charset=UTF-8")
                    .body(ApiResponse.error("마커 조회에 실패했습니다.", "MARKER_FETCH_FAILED"));
        }
    }

    // 🔒 마커 수정 (인증 + 권한 확인)
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<MarkerResponse>> updateMarker(
            @PathVariable Long id,
            @Valid @RequestBody MarkerRequest request,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .header("Content-Type", "application/json;charset=UTF-8")
                        .body(ApiResponse.error("인증이 필요합니다.", "AUTHENTICATION_REQUIRED"));
            }

            String userEmail = authentication.getName();
            MarkerResponse marker = markerService.updateMarker(id, request, userEmail);

            log.info("마커 수정 성공 - 사용자: {}, 마커 ID: {}", userEmail, id);
            return ResponseEntity.ok()
                    .header("Content-Type", "application/json;charset=UTF-8")
                    .body(ApiResponse.success(marker, "마커 수정 성공"));

        } catch (RuntimeException e) {
            log.error("마커 수정 실패 - ID: {}, 오류: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .header("Content-Type", "application/json;charset=UTF-8")
                    .body(ApiResponse.error(e.getMessage(), "MARKER_UPDATE_FORBIDDEN"));
        } catch (Exception e) {
            log.error("마커 수정 오류 - ID: {}, 오류: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .header("Content-Type", "application/json;charset=UTF-8")
                    .body(ApiResponse.error("마커 수정에 실패했습니다.", "MARKER_UPDATE_FAILED"));
        }
    }

    // 🔒 마커 삭제 (인증 + 권한 확인)
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteMarker(
            @PathVariable Long id,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .header("Content-Type", "application/json;charset=UTF-8")
                        .body(ApiResponse.error("인증이 필요합니다.", "AUTHENTICATION_REQUIRED"));
            }

            String userEmail = authentication.getName();
            markerService.deleteMarker(id, userEmail);

            log.info("마커 삭제 성공 - 사용자: {}, 마커 ID: {}", userEmail, id);
            return ResponseEntity.ok()
                    .header("Content-Type", "application/json;charset=UTF-8")
                    .body(ApiResponse.success("마커가 삭제되었습니다.", "마커 삭제 성공"));

        } catch (RuntimeException e) {
            log.error("마커 삭제 실패 - ID: {}, 오류: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .header("Content-Type", "application/json;charset=UTF-8")
                    .body(ApiResponse.error(e.getMessage(), "MARKER_DELETE_FORBIDDEN"));
        } catch (Exception e) {
            log.error("마커 삭제 오류 - ID: {}, 오류: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .header("Content-Type", "application/json;charset=UTF-8")
                    .body(ApiResponse.error("마커 삭제에 실패했습니다.", "MARKER_DELETE_FAILED"));
        }
    }

    // 🔒 사용자별 마커 조회 (인증 필요)
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<MarkerResponse>>> getMyMarkers(Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .header("Content-Type", "application/json;charset=UTF-8")
                        .body(ApiResponse.error("인증이 필요합니다.", "AUTHENTICATION_REQUIRED"));
            }

            String userEmail = authentication.getName();
            List<MarkerResponse> markers = markerService.getMarkersByUser(userEmail);

            return ResponseEntity.ok()
                    .header("Content-Type", "application/json;charset=UTF-8")
                    .header("X-User-Marker-Count", String.valueOf(markers.size()))
                    .body(ApiResponse.success(markers, "내 마커 조회 성공"));

        } catch (Exception e) {
            log.error("사용자 마커 조회 오류: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .header("Content-Type", "application/json;charset=UTF-8")
                    .body(ApiResponse.error("마커 조회에 실패했습니다.", "USER_MARKER_FETCH_FAILED"));
        }
    }

    // 🔍 카테고리별 마커 조회 (공개)
    @GetMapping("/category/{category}")
    public ResponseEntity<ApiResponse<List<MarkerResponse>>> getMarkersByCategory(@PathVariable String category) {
        try {
            List<MarkerResponse> markers = markerService.getMarkersByCategory(category);
            return ResponseEntity.ok()
                    .header("Content-Type", "application/json;charset=UTF-8")
                    .header("X-Category", category)
                    .header("X-Category-Count", String.valueOf(markers.size()))
                    .body(ApiResponse.success(markers, "카테고리별 마커 조회 성공"));
        } catch (Exception e) {
            log.error("카테고리별 마커 조회 오류: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .header("Content-Type", "application/json;charset=UTF-8")
                    .body(ApiResponse.error("카테고리별 마커 조회에 실패했습니다.", "CATEGORY_FETCH_FAILED"));
        }
    }

    // 🔍 키워드 검색 (공개)
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<MarkerResponse>>> searchMarkers(@RequestParam String keyword) {
        try {
            if (keyword == null || keyword.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .header("Content-Type", "application/json;charset=UTF-8")
                        .body(ApiResponse.error("검색 키워드를 입력해주세요.", "KEYWORD_REQUIRED"));
            }

            List<MarkerResponse> markers = markerService.searchMarkers(keyword.trim());
            return ResponseEntity.ok()
                    .header("Content-Type", "application/json;charset=UTF-8")
                    .header("X-Search-Keyword", keyword)
                    .header("X-Search-Results", String.valueOf(markers.size()))
                    .body(ApiResponse.success(markers, "키워드 검색 성공"));

        } catch (Exception e) {
            log.error("키워드 검색 오류: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .header("Content-Type", "application/json;charset=UTF-8")
                    .body(ApiResponse.error("키워드 검색에 실패했습니다.", "SEARCH_FAILED"));
        }
    }

    // 🔍 위치 기반 마커 검색 (공개)
    @GetMapping("/area")
    public ResponseEntity<ApiResponse<List<MarkerResponse>>> getMarkersInArea(
            @RequestParam Double minLat,
            @RequestParam Double maxLat,
            @RequestParam Double minLng,
            @RequestParam Double maxLng) {
        try {
            // 파라미터 유효성 검사
            if (minLat > maxLat || minLng > maxLng) {
                return ResponseEntity.badRequest()
                        .header("Content-Type", "application/json;charset=UTF-8")
                        .body(ApiResponse.error("유효하지 않은 영역 좌표입니다.", "INVALID_COORDINATES"));
            }

            List<MarkerResponse> markers = markerService.getMarkersInArea(minLat, maxLat, minLng, maxLng);
            return ResponseEntity.ok()
                    .header("Content-Type", "application/json;charset=UTF-8")
                    .header("X-Area-Results", String.valueOf(markers.size()))
                    .body(ApiResponse.success(markers, "영역 내 마커 검색 성공"));

        } catch (Exception e) {
            log.error("영역 검색 오류: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .header("Content-Type", "application/json;charset=UTF-8")
                    .body(ApiResponse.error("영역 검색에 실패했습니다.", "AREA_SEARCH_FAILED"));
        }
    }

    // 🔍 반경 내 마커 검색 (공개)
    @GetMapping("/nearby")
    public ResponseEntity<ApiResponse<List<MarkerResponse>>> getMarkersNearby(
            @RequestParam Double lat,
            @RequestParam Double lng,
            @RequestParam(defaultValue = "1.0") Double radius) {
        try {
            // 파라미터 유효성 검사
            if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
                return ResponseEntity.badRequest()
                        .header("Content-Type", "application/json;charset=UTF-8")
                        .body(ApiResponse.error("유효하지 않은 좌표입니다.", "INVALID_COORDINATES"));
            }

            if (radius <= 0 || radius > 100) {
                return ResponseEntity.badRequest()
                        .header("Content-Type", "application/json;charset=UTF-8")
                        .body(ApiResponse.error("반경은 0보다 크고 100km 이하여야 합니다.", "INVALID_RADIUS"));
            }

            List<MarkerResponse> markers = markerService.getMarkersWithinRadius(lat, lng, radius);
            return ResponseEntity.ok()
                    .header("Content-Type", "application/json;charset=UTF-8")
                    .header("X-Nearby-Results", String.valueOf(markers.size()))
                    .header("X-Search-Radius", String.valueOf(radius))
                    .body(ApiResponse.success(markers, "주변 마커 검색 성공"));

        } catch (Exception e) {
            log.error("주변 마커 검색 오류: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .header("Content-Type", "application/json;charset=UTF-8")
                    .body(ApiResponse.error("주변 마커 검색에 실패했습니다.", "NEARBY_SEARCH_FAILED"));
        }
    }

    // 📄 페이징된 마커 조회 (공개)
    @GetMapping("/paged")
    public ResponseEntity<ApiResponse<PagedResponse<MarkerResponse>>> getMarkersWithPaging(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        try {
            // 페이지 파라미터 유효성 검사
            if (page < 0 || size <= 0 || size > 100) {
                return ResponseEntity.badRequest()
                        .header("Content-Type", "application/json;charset=UTF-8")
                        .body(ApiResponse.error("유효하지 않은 페이지 파라미터입니다.", "INVALID_PAGE_PARAMS"));
            }

            Sort sort = sortDir.equalsIgnoreCase("desc")
                    ? Sort.by(sortBy).descending()
                    : Sort.by(sortBy).ascending();

            Pageable pageable = PageRequest.of(page, size, sort);
            PagedResponse<MarkerResponse> response = markerService.getMarkersWithPaging(pageable);

            return ResponseEntity.ok()
                    .header("Content-Type", "application/json;charset=UTF-8")
                    .header("X-Page-Number", String.valueOf(page))
                    .header("X-Page-Size", String.valueOf(size))
                    .header("X-Total-Pages", String.valueOf(response.getTotalPages()))
                    .header("X-Total-Elements", String.valueOf(response.getTotalElements()))
                    .body(ApiResponse.success(response, "페이징된 마커 조회 성공"));

        } catch (Exception e) {
            log.error("페이징된 마커 조회 오류: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .header("Content-Type", "application/json;charset=UTF-8")
                    .body(ApiResponse.error("페이징된 마커 조회에 실패했습니다.", "PAGED_FETCH_FAILED"));
        }
    }

    // 🔒 사용자별 페이징된 마커 조회 (인증 필요)
    @GetMapping("/my/paged")
    public ResponseEntity<ApiResponse<PagedResponse<MarkerResponse>>> getMyMarkersWithPaging(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            Authentication authentication) {
        try {
            if (authentication == null || authentication.getName() == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .header("Content-Type", "application/json;charset=UTF-8")
                        .body(ApiResponse.error("인증이 필요합니다.", "AUTHENTICATION_REQUIRED"));
            }

            // 페이지 파라미터 유효성 검사
            if (page < 0 || size <= 0 || size > 100) {
                return ResponseEntity.badRequest()
                        .header("Content-Type", "application/json;charset=UTF-8")
                        .body(ApiResponse.error("유효하지 않은 페이지 파라미터입니다.", "INVALID_PAGE_PARAMS"));
            }

            Sort sort = sortDir.equalsIgnoreCase("desc")
                    ? Sort.by(sortBy).descending()
                    : Sort.by(sortBy).ascending();

            Pageable pageable = PageRequest.of(page, size, sort);
            String userEmail = authentication.getName();
            PagedResponse<MarkerResponse> response = markerService.getUserMarkersWithPaging(userEmail, pageable);

            return ResponseEntity.ok()
                    .header("Content-Type", "application/json;charset=UTF-8")
                    .header("X-User-Email", userEmail)
                    .header("X-Page-Number", String.valueOf(page))
                    .header("X-Total-Elements", String.valueOf(response.getTotalElements()))
                    .body(ApiResponse.success(response, "내 마커 페이징 조회 성공"));

        } catch (Exception e) {
            log.error("사용자 마커 페이징 조회 오류: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .header("Content-Type", "application/json;charset=UTF-8")
                    .body(ApiResponse.error("마커 조회에 실패했습니다.", "USER_PAGED_FETCH_FAILED"));
        }
    }
}