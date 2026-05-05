package com.trustagro.user.dto;

import com.trustagro.user.entity.RoleName;
import com.trustagro.user.entity.UserStatus;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.stream.Collectors;

@Data
public class UserResponse {
    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private RoleName role;
    private Set<String> roles;
    private UserStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
