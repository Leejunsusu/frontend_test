package com.example.navermapbackend.repository;

import com.example.navermapbackend.model.Marker;
import com.example.navermapbackend.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface MarkerRepository extends JpaRepository<Marker, Long> {

    // 🔒 사용자별 마커 조회 (보안상 가장 중요)
    List<Marker> findByCreatedBy(User user);

    // 🔒 마커 소유권 확인 (수정/삭제 시 필수)
    Optional<Marker> findByIdAndCreatedBy(Long id, User user);

    // 🔒 사용자 ID로 마커 조회
    List<Marker> findByCreatedById(Long userId);

    // 🔒 소유권 존재 여부 확인
    boolean existsByIdAndCreatedById(Long markerId, Long userId);

    // 🔒 사용자별 마커 개수
    long countByCreatedBy(User user);

    // 📍 위치 기반 검색
    List<Marker> findByLatitudeBetweenAndLongitudeBetween(
            Double minLat, Double maxLat,
            Double minLng, Double maxLng);

    // 🔍 카테고리별 조회
    List<Marker> findByCategory(String category);

    // 🔍 제목으로 검색
    List<Marker> findByTitleContainingIgnoreCase(String title);

    // 🔍 설명으로 검색
    List<Marker> findByDescriptionContainingIgnoreCase(String description);

    // 🔍 키워드 검색 (제목 또는 설명)
    @Query("SELECT m FROM Marker m WHERE " +
            "LOWER(m.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(m.description) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Marker> searchByKeyword(@Param("keyword") String keyword);

    // 📄 페이징된 사용자별 마커 조회
    Page<Marker> findByCreatedBy(User user, Pageable pageable);

    // 📄 카테고리별 페이징 조회
    Page<Marker> findByCategory(String category, Pageable pageable);

    // 📄 사용자별 + 카테고리별 조회
    Page<Marker> findByCreatedByAndCategory(User user, String category, Pageable pageable);

    // 📅 시간 기반 조회
    List<Marker> findTop10ByOrderByCreatedAtDesc();

    List<Marker> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    List<Marker> findTop5ByCreatedByOrderByCreatedAtDesc(User user);

    // 📍 반경 내 마커 검색 (Haversine 공식 사용)
    @Query("SELECT m FROM Marker m WHERE " +
            "6371 * acos(cos(radians(:lat)) * cos(radians(m.latitude)) * " +
            "cos(radians(m.longitude) - radians(:lng)) + " +
            "sin(radians(:lat)) * sin(radians(m.latitude))) <= :radius")
    List<Marker> findMarkersWithinRadius(@Param("lat") Double latitude,
                                         @Param("lng") Double longitude,
                                         @Param("radius") Double radiusKm);
}