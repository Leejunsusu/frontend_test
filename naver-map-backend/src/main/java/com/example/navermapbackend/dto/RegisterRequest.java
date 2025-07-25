// src/main/java/com/example/navermapbackend/dto/RegisterRequest.java
package com.example.navermapbackend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message = "이름은 필수입니다")
    @Size(min = 2, max = 50, message = "이름은 2자 이상 50자 이하여야 합니다")
    private String name;

    @NotBlank(message = "이메일은 필수입니다")
    @Email(message = "올바른 이메일 형식이 아닙니다")
    private String email;

    @NotBlank(message = "비밀번호는 필수입니다")
    @Size(min = 8, max = 100, message = "비밀번호는 8자 이상 100자 이하여야 합니다")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).*$",
            message = "비밀번호는 대문자, 소문자, 숫자를 포함해야 합니다")
    private String password;

    @Pattern(regexp = "^010-\\d{4}-\\d{4}$",
            message = "전화번호 형식이 올바르지 않습니다 (010-1234-5678)")
    private String phone;

    private boolean agreeToMarketing = false;
}