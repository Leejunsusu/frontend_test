package com.example.navermapbackend.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class MarkerResponse {

    private Long id;
    private Double latitude;
    private Double longitude;
    private String title;
    private String description;
    private String category;
    private String createdByEmail; // 생성자 이메일
    private String createdByName;  // 생성자 이름
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}