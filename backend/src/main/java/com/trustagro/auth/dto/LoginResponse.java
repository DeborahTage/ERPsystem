package com.trustagro.auth.dto;

import com.trustagro.user.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private String tokenType;
    private Long expiresIn;
    private Long userId;
    private String fullName;
    private String email;
    private Role role;
}
