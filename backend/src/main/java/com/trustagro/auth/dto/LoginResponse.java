package com.trustagro.auth.dto;

import com.trustagro.user.entity.RoleName;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.Set;

@Data
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private String tokenType;
    private Long expiresIn;
    private Long userId;
    private String fullName;
    private String email;
    private RoleName role;
    private Set<String> roles;
}
