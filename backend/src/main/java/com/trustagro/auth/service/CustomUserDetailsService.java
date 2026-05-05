package com.trustagro.auth.service;

import com.trustagro.user.entity.Role;
import com.trustagro.user.entity.RoleName;
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
import java.util.Set;
import java.util.stream.Collectors;

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

        // Load from ManyToMany roles collection (new RBAC)
        if (user.getRoles() != null && !user.getRoles().isEmpty()) {
            for (Role role : user.getRoles()) {
                if (role.getName() != null) {
                    addAuthority(authorities, role.getName().name());
                    // Add aliases for backward compatibility
                    addRoleAliases(authorities, role.getName());
                }
            }
        } else {
            // Fallback to primary role (backward compatibility)
            addAuthority(authorities, user.getRole().name());
            addRoleAliases(authorities, user.getRole());
        }
        return authorities;
    }

    private void addRoleAliases(List<SimpleGrantedAuthority> authorities, RoleName roleName) {
        switch (roleName) {
            case VET -> addAuthority(authorities, "VETERINARY_OFFICER");
            case VETERINARY_OFFICER -> addAuthority(authorities, "VET");
            case STORE -> addAuthority(authorities, "STORE_KEEPER");
            case STORE_KEEPER -> addAuthority(authorities, "STORE");
            default -> {
            }
        }
    }

    private void addAuthority(List<SimpleGrantedAuthority> authorities, String role) {
        authorities.add(new SimpleGrantedAuthority("ROLE_" + role));
    }

    public Set<String> getRolesForUser(User user) {
        if (user.getRoles() != null && !user.getRoles().isEmpty()) {
            return user.getRoles().stream()
                    .map(r -> r.getName() != null ? r.getName().name() : null)
                    .filter(java.util.Objects::nonNull)
                    .collect(Collectors.toSet());
        }
        return Set.of(user.getRole().name());
    }
}
