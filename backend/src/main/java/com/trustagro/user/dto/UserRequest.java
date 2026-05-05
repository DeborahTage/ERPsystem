package com.trustagro.user.dto;

import com.trustagro.user.entity.Role;
import com.trustagro.user.entity.UserStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.ToString;

@Data
public class UserRequest {
    @NotBlank
    private String fullName;
    @NotBlank @Email
    private String email;
    private String phone;
    @ToString.Exclude
    private String password;
    @NotNull
    private Role role;
}
