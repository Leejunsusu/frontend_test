package com.example.navermapbackend.service;

import com.example.navermapbackend.dto.MarkerRequest;
import com.example.navermapbackend.dto.MarkerResponse;
import com.example.navermapbackend.dto.PagedResponse;
import com.example.navermapbackend.model.Marker;
import com.example.navermapbackend.model.User;
import com.example.navermapbackend.repository.MarkerRepository;
import com.example.navermapbackend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class MarkerService {

    private final MarkerRepository markerRepository;
    private final UserRepository userRepository;

    // 📍 모든 마커 조회 (공개)
    @Transactional(readOnly = true)
    public List<MarkerResponse> getAllMarkers() {
        List<Marker> markers = markerRepository.findAll();
        log.info("모든 마커 조회 - 총 {}개", markers.size());
        return markers.stream()
                .map(this::convertToMarkerResponse)
                .collect(Collectors.toList());
    }

    // 🔒 사용자별 마커 조회 (인증 필요)
    @Transactional(readOnly = true)
    public List<MarkerResponse> getMarkersByUser(String userEmail) {
        User user = getUserByEmail(userEmail);
        List<Marker> markers = markerRepository.findByCreatedBy(user);
        log.info("사용자 {}의 마커 조회 - 총 {}개", userEmail, markers.size());
        return markers.stream()
                .map(this::convertToMarkerResponse)
                .collect(Collectors.toList());
    }

    // 🔒 마커 생성 (인증 필요)
    public MarkerResponse createMarker(MarkerRequest request, String userEmail) {
        User user = getUserByEmail(userEmail);

        Marker marker = Marker.builder()
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .createdBy(user)
                .build();

        Marker savedMarker = markerRepository.save(marker);
        log.info("마커 생성 성공 - ID: {}, 사용자: {}", savedMarker.getId(), userEmail);

        return convertToMarkerResponse(savedMarker);
    }

    // 🔒 마커 수정 (인증 + 권한 확인)
    public MarkerResponse updateMarker(Long markerId, MarkerRequest request, String userEmail) {
        User user = getUserByEmail(userEmail);

        // 🔒 소유권 확인 - 가장 중요한 보안 체크!
        Marker marker = markerRepository.findByIdAndCreatedBy(markerId, user)
                .orElseThrow(() -> new RuntimeException("마커를 찾을 수 없거나 수정 권한이 없습니다."));

        // 마커 정보 업데이트
        marker.setLatitude(request.getLatitude());
        marker.setLongitude(request.getLongitude());
        marker.setTitle(request.getTitle());
        marker.setDescription(request.getDescription());
        marker.setCategory(request.getCategory());

        Marker updatedMarker = markerRepository.save(marker);
        log.info("마커 수정 성공 - ID: {}, 사용자: {}", markerId, userEmail);

        return convertToMarkerResponse(updatedMarker);
    }

    // 🔒 마커 삭제 (인증 + 권한 확인)
    public void deleteMarker(Long markerId, String userEmail) {
        User user = getUserByEmail(userEmail);

        // 🔒 소유권 확인
        Marker marker = markerRepository.findByIdAndCreatedBy(markerId, user)
                .orElseThrow(() -> new RuntimeException("마커를 찾을 수 없거나 삭제 권한이 없습니다."));

        markerRepository.delete(marker);
        log.info("마커 삭제 성공 - ID: {}, 사용자: {}", markerId, userEmail);
    }

    // 📍 특정 마커 조회 (공개)
    @Transactional(readOnly = true)
    public MarkerResponse getMarkerById(Long markerId) {
        Marker marker = markerRepository.findById(markerId)
                .orElseThrow(() -> new RuntimeException("마커를 찾을 수 없습니다."));

        return convertToMarkerResponse(marker);
    }

    // 🔍 위치 기반 마커 검색
    @Transactional(readOnly = true)
    public List<MarkerResponse> getMarkersInArea(Double minLat, Double maxLat,
                                                 Double minLng, Double maxLng) {
        List<Marker> markers = markerRepository.findByLatitudeBetweenAndLongitudeBetween(
                minLat, maxLat, minLng, maxLng);

        log.info("영역 내 마커 검색 - 총 {}개", markers.size());
        return markers.stream()
                .map(this::convertToMarkerResponse)
                .collect(Collectors.toList());
    }

    // 🔍 카테고리별 마커 조회
    @Transactional(readOnly = true)
    public List<MarkerResponse> getMarkersByCategory(String category) {
        List<Marker> markers = markerRepository.findByCategory(category);
        log.info("카테고리 '{}' 마커 조회 - 총 {}개", category, markers.size());
        return markers.stream()
                .map(this::convertToMarkerResponse)
                .collect(Collectors.toList());
    }

    // 🔍 키워드 검색
    @Transactional(readOnly = true)
    public List<MarkerResponse> searchMarkers(String keyword) {
        List<Marker> markers = markerRepository.searchByKeyword(keyword);
        log.info("키워드 '{}' 검색 - 총 {}개", keyword, markers.size());
        return markers.stream()
                .map(this::convertToMarkerResponse)
                .collect(Collectors.toList());
    }

    // 📄 페이징된 마커 조회
    @Transactional(readOnly = true)
    public PagedResponse<MarkerResponse> getMarkersWithPaging(Pageable pageable) {
        Page<Marker> page = markerRepository.findAll(pageable);
        List<MarkerResponse> content = page.getContent().stream()
                .map(this::convertToMarkerResponse)
                .collect(Collectors.toList());

        return PagedResponse.<MarkerResponse>builder()
                .content(content)
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .build();
    }

    // 🔒 사용자별 페이징된 마커 조회
    @Transactional(readOnly = true)
    public PagedResponse<MarkerResponse> getUserMarkersWithPaging(String userEmail, Pageable pageable) {
        User user = getUserByEmail(userEmail);
        Page<Marker> page = markerRepository.findByCreatedBy(user, pageable);
        List<MarkerResponse> content = page.getContent().stream()
                .map(this::convertToMarkerResponse)
                .collect(Collectors.toList());

        return PagedResponse.<MarkerResponse>builder()
                .content(content)
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .build();
    }

    // 🔍 반경 내 마커 검색
    @Transactional(readOnly = true)
    public List<MarkerResponse> getMarkersWithinRadius(Double latitude, Double longitude, Double radiusKm) {
        List<Marker> markers = markerRepository.findMarkersWithinRadius(latitude, longitude, radiusKm);
        log.info("반경 {}km 내 마커 검색 - 총 {}개", radiusKm, markers.size());
        return markers.stream()
                .map(this::convertToMarkerResponse)
                .collect(Collectors.toList());
    }

    // 유틸리티 메서드들
    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
    }

    private MarkerResponse convertToMarkerResponse(Marker marker) {
        return MarkerResponse.builder()
                .id(marker.getId())
                .latitude(marker.getLatitude())
                .longitude(marker.getLongitude())
                .title(marker.getTitle())
                .description(marker.getDescription())
                .category(marker.getCategory())
                .createdByEmail(marker.getCreatedBy().getEmail())
                .createdByName(marker.getCreatedBy().getName())
                .createdAt(marker.getCreatedAt())
                .updatedAt(marker.getUpdatedAt())
                .build();
    }
}