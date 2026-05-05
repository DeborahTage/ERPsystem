package com.trustagro.auth.service;

import com.trustagro.auth.dto.LoginRequest;
import com.trustagro.auth.dto.LoginResponse;
import com.trustagro.common.exception.BusinessException;
import com.trustagro.user.entity.User;
import com.trustagro.user.entity.UserStatus;
import com.trustagro.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final CustomUserDetailsService customUserDetailsService;

    public LoginResponse login(LoginRequest req) {
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));
        if (user.getStatus() == UserStatus.INACTIVE)
            throw new BusinessException("Account is inactive");
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword()));
        String token = jwtService.generateToken(user);
        Set<String> roles = customUserDetailsService.getRolesForUser(user);
        return new LoginResponse(token, "Bearer", jwtService.getExpiration(), user.getId(),
                user.getFullName(), user.getEmail(), user.getRole(), roles);
    }
}
