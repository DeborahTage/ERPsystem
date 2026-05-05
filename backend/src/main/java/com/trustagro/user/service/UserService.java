package com.trustagro.user.service;

import com.trustagro.common.exception.BusinessException;
import com.trustagro.common.exception.ResourceNotFoundException;
import com.trustagro.user.dto.UserRequest;
import com.trustagro.user.dto.UserResponse;
import com.trustagro.user.entity.Role;
import com.trustagro.user.entity.RoleName;
import com.trustagro.user.entity.User;
import com.trustagro.user.entity.UserStatus;
import com.trustagro.user.repository.RoleRepository;
import com.trustagro.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public List<UserResponse> getAll() {
        return userRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public UserResponse getById(Long id) {
        return toResponse(findById(id));
    }

    public UserResponse create(UserRequest req) {
        if (userRepository.existsByEmail(req.getEmail()))
            throw new BusinessException("Email already in use");
        if (req.getPassword() == null || req.getPassword().isBlank())
            throw new BusinessException("Password is required");
        User user = new User();
        user.setFullName(req.getFullName());
        user.setEmail(req.getEmail());
        user.setPhone(req.getPhone());
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setRole(req.getRole());
        assignRoles(user, req.getRole(), req.getAdditionalRoles());
        return toResponse(userRepository.save(user));
    }

    public UserResponse update(Long id, UserRequest req) {
        User user = findById(id);
        user.setFullName(req.getFullName());
        user.setPhone(req.getPhone());
        user.setRole(req.getRole());
        assignRoles(user, req.getRole(), req.getAdditionalRoles());
        if (req.getPassword() != null && !req.getPassword().isBlank())
            user.setPassword(passwordEncoder.encode(req.getPassword()));
        return toResponse(userRepository.save(user));
    }

    private void assignRoles(User user, RoleName primaryRole, Set<RoleName> additionalRoles) {
        user.getRoles().clear();
        // Always assign primary role
        roleRepository.findByName(primaryRole).ifPresent(user.getRoles()::add);
        // Assign additional roles if provided
        if (additionalRoles != null) {
            for (RoleName rn : additionalRoles) {
                roleRepository.findByName(rn).ifPresent(user.getRoles()::add);
            }
        }
    }

    public UserResponse updateStatus(Long id, UserStatus status) {
        User user = findById(id);
        user.setStatus(status);
        return toResponse(userRepository.save(user));
    }

    private User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
    }

    public UserResponse toResponse(User user) {
        UserResponse r = new UserResponse();
        r.setId(user.getId());
        r.setFullName(user.getFullName());
        r.setEmail(user.getEmail());
        r.setPhone(user.getPhone());
        r.setRole(user.getRole());
        if (user.getRoles() != null) {
            r.setRoles(user.getRoles().stream()
                    .map(rm -> rm.getName() != null ? rm.getName().name() : null)
                    .filter(java.util.Objects::nonNull)
                    .collect(Collectors.toSet()));
        }
        r.setStatus(user.getStatus());
        r.setCreatedAt(user.getCreatedAt());
        r.setUpdatedAt(user.getUpdatedAt());
        return r;
    }
}
