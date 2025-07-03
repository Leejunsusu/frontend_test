// src/main/java/com/example/navermapbackend/dto/UserResponse.java
package com.example.navermapbackend.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class UserResponse {

    private Long id;
    private String name;
    private String email;
    private String phone;
    private boolean agreeToMarketing;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // 비밀번호는 응답에 포함하지 않음 (보안)
}