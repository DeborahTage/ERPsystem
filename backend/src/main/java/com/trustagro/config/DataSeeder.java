package com.trustagro.config;

import com.trustagro.user.entity.Role;
import com.trustagro.user.entity.User;
import com.trustagro.user.entity.UserStatus;
import com.trustagro.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (!userRepository.existsByEmail("admin@trustagro.com")) {
            User admin = new User();
            admin.setFullName("System Administrator");
            admin.setEmail("admin@trustagro.com");
            admin.setPhone("+233000000000");
            admin.setPassword(passwordEncoder.encode("Admin@1234"));
            admin.setRole(Role.ADMIN);
            admin.setStatus(UserStatus.ACTIVE);
            userRepository.save(admin);
            log.info("Default admin user created: admin@trustagro.com / Admin@1234");
        }
    }
}
