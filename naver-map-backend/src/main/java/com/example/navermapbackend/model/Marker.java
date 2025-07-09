package com.example.navermapbackend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

@Entity
@Table(name = "markers",
        indexes = {
                @Index(name = "idx_marker_user", columnList = "user_id"),
                @Index(name = "idx_marker_location", columnList = "latitude, longitude"),
                @Index(name = "idx_marker_category", columnList = "category")
        })
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Marker {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "위도는 필수입니다")
    @DecimalMin(value = "-90.0", message = "위도는 -90 이상이어야 합니다")
    @DecimalMax(value = "90.0", message = "위도는 90 이하여야 합니다")
    @Column(nullable = false)
    private Double latitude;

    @NotNull(message = "경도는 필수입니다")
    @DecimalMin(value = "-180.0", message = "경도는 -180 이상이어야 합니다")
    @DecimalMax(value = "180.0", message = "경도는 180 이하여야 합니다")
    @Column(nullable = false)
    private Double longitude;

    @Size(max = 100, message = "제목은 100자 이하여야 합니다")
    @Column(length = 100)
    private String title;

    @NotBlank(message = "설명은 필수입니다")
    @Size(max = 500, message = "설명은 500자 이하여야 합니다")
    @Column(nullable = false, length = 500)
    private String description;

    @Size(max = 50, message = "카테고리는 50자 이하여야 합니다")
    @Column(length = 50)
    private String category;

    // ⭐ 가장 중요한 추가: User와의 관계
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User createdBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // JPA 생명주기 콜백
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}