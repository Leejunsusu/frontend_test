package com.example.navermapbackend.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class MarkerRequest {

    @NotNull(message = "위도는 필수입니다")
    @DecimalMin(value = "-90.0", message = "위도는 -90 이상이어야 합니다")
    @DecimalMax(value = "90.0", message = "위도는 90 이하여야 합니다")
    private Double latitude;

    @NotNull(message = "경도는 필수입니다")
    @DecimalMin(value = "-180.0", message = "경도는 -180 이상이어야 합니다")
    @DecimalMax(value = "180.0", message = "경도는 180 이하여야 합니다")
    private Double longitude;

    @Size(max = 100, message = "제목은 100자 이하여야 합니다")
    private String title;

    @NotBlank(message = "설명은 필수입니다")
    @Size(max = 500, message = "설명은 500자 이하여야 합니다")
    private String description;

    @Pattern(regexp = "^(restaurant|cafe|shop|park|tourist|transport|government|etc)$",
            message = "유효하지 않은 카테고리입니다")
    private String category = "etc";
}