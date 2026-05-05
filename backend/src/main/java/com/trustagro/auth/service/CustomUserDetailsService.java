package com.trustagro.auth.service;

import com.trustagro.user.entity.User;
import com.trustagro.user.entity.UserStatus;
import com.trustagro.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                user.getStatus() == UserStatus.ACTIVE,
                true,
                true,
                true,
                authoritiesFor(user)
        );
    }

    private List<SimpleGrantedAuthority> authoritiesFor(User user) {
        List<SimpleGrantedAuthority> authorities = new ArrayList<>();
        addAuthority(authorities, user.getRole().name());
        switch (user.getRole()) {
            case VET -> addAuthority(authorities, "VETERINARY_OFFICER");
            case VETERINARY_OFFICER -> addAuthority(authorities, "VET");
            case STORE -> addAuthority(authorities, "STORE_KEEPER");
            case STORE_KEEPER -> addAuthority(authorities, "STORE");
            default -> {
            }
        }
        return authorities;
    }

    private void addAuthority(List<SimpleGrantedAuthority> authorities, String role) {
        authorities.add(new SimpleGrantedAuthority("ROLE_" + role));
    }
}
