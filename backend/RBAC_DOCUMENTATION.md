# Trust Agro - Role-Based Access Control (RBAC) Documentation

## Overview

This document describes the production-level RBAC system implemented in the Trust Agro Management System using Spring Security and JWT authentication.

## Architecture

### 1. Entity Design

#### User Entity
```java
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    // Primary role (backward compatibility + quick reference)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RoleName role;

    // Many-to-Many roles (new RBAC system)
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "user_roles",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> roles = new HashSet<>();

    // Helper method for role checking
    public boolean hasRole(RoleName roleName) {
        return roles.stream().anyMatch(r -> r.getName() == roleName);
    }
}
```

#### Role Entity
```java
@Entity
@Table(name = "roles")
public class Role {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    @Enumerated(EnumType.STRING)
    private RoleName name;

    private String description;

    @ManyToMany(mappedBy = "roles")
    private Set<User> users = new HashSet<>();
}
```

#### RoleName Enum
```java
public enum RoleName {
    ADMIN,                           // Full system access
    GENERAL_MANAGER,                 // Cross-module view access
    OPERATIONS_MANAGER,              // Farm + Inventory + CRM operations
    FARM_MANAGER,                    // Farm daily records, flock management
    VET,                             // Alias for VETERINARY_OFFICER
    VETERINARY_OFFICER,              // Disease cases, treatments, prescriptions
    STORE,                           // Alias for STORE_KEEPER
    STORE_KEEPER,                    // Inventory management
    PHARMACY_SALES,                  // Pharmacy sales, prescriptions dispensing
    FINANCE_OFFICER,                 // Financial transactions, reports
    EXTENSION_WORKER                 // CRM client management, farm visits
}
```

### 2. Database Schema

```sql
-- Users table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,  -- Primary role (backward compat)
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Roles table (master list)
CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- User-Role join table (Many-to-Many)
CREATE TABLE user_roles (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- Index for faster role lookups
CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role_id);
```

### 3. Security Configuration

```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity  // Enables @PreAuthorize annotations
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final CustomUserDetailsService userDetailsService;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/login").permitAll()
                .anyRequest().authenticated()  // All other endpoints require auth
            )
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
```

### 4. JWT Filter

```java
@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                      HttpServletResponse response, 
                                      FilterChain chain) throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            chain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);
        try {
            String email = jwtService.extractEmail(token);
            if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = userDetailsService.loadUserByUsername(email);
                if (jwtService.isValid(token, userDetails)) {
                    UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities()
                        );
                    auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(auth);
                }
            }
        } catch (RuntimeException ex) {
            SecurityContextHolder.clearContext();
        }
        chain.doFilter(request, response);
    }
}
```

### 5. User Details Service with Role Loading

```java
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
            true, true, true,
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
        // Aliases for backward compatibility
        switch (roleName) {
            case VET -> addAuthority(authorities, "VETERINARY_OFFICER");
            case VETERINARY_OFFICER -> addAuthority(authorities, "VET");
            case STORE -> addAuthority(authorities, "STORE_KEEPER");
            case STORE_KEEPER -> addAuthority(authorities, "STORE");
            default -> {}
        }
    }

    private void addAuthority(List<SimpleGrantedAuthority> authorities, String role) {
        authorities.add(new SimpleGrantedAuthority("ROLE_" + role));
    }
}
```

## Access Control Matrix

### Module: Farm Management

| Endpoint | Method | Required Role(s) |
|----------|--------|-----------------|
| `/api/farms` | GET | ADMIN, FARM_MANAGER, VET, STORE |
| `/api/farms` | POST | ADMIN |
| `/api/farms/{id}` | GET | ADMIN, FARM_MANAGER, VET, STORE |
| `/api/farms/{id}` | PUT | ADMIN |
| `/api/farms/{id}/status` | PATCH | ADMIN |
| `/api/farms/{id}/daily-records` | GET | ADMIN, FARM_MANAGER, VET |
| `/api/farms/{id}/kpis` | GET | ADMIN, FARM_MANAGER, VET |
| `/api/flocks` | GET | ADMIN, FARM_MANAGER, VET, STORE |
| `/api/flocks` | POST | ADMIN, FARM_MANAGER |
| `/api/flocks/{id}` | PUT | ADMIN, FARM_MANAGER |
| `/api/flocks/{id}/close` | PATCH | ADMIN, FARM_MANAGER |
| `/api/daily-farm-records` | GET | ADMIN, FARM_MANAGER, VET |
| `/api/daily-farm-records` | POST | ADMIN, FARM_MANAGER, VET |
| `/api/daily-farm-records/{id}` | PUT | ADMIN, FARM_MANAGER, VET |

### Module: Veterinary

| Endpoint | Method | Required Role(s) |
|----------|--------|-----------------|
| `/api/vet/vaccinations` | GET | ADMIN, VETERINARY_OFFICER, FARM_MANAGER, OPERATIONS_MANAGER |
| `/api/vet/vaccinations` | POST | ADMIN, VETERINARY_OFFICER |
| `/api/vet/vaccinations/{id}/complete` | PATCH | ADMIN, VETERINARY_OFFICER |
| `/api/vet/disease-cases` | GET | ADMIN, VETERINARY_OFFICER, FARM_MANAGER, OPERATIONS_MANAGER |
| `/api/vet/disease-cases` | POST | ADMIN, VETERINARY_OFFICER, FARM_MANAGER |
| `/api/vet/disease-cases/{id}` | PUT | ADMIN, VETERINARY_OFFICER |
| `/api/vet/treatments` | GET | ADMIN, VETERINARY_OFFICER, FARM_MANAGER |
| `/api/vet/treatments` | POST | ADMIN, VETERINARY_OFFICER |
| `/api/vet/prescriptions` | GET | ADMIN, VETERINARY_OFFICER, PHARMACY_SALES, FARM_MANAGER |
| `/api/vet/prescriptions` | POST | ADMIN, VETERINARY_OFFICER |
| `/api/vet/prescriptions/{id}/dispense` | PATCH | ADMIN, PHARMACY_SALES |

### Module: Inventory

| Endpoint | Method | Required Role(s) |
|----------|--------|-----------------|
| `/api/inventory/items` | GET | ADMIN, STORE_KEEPER, OPERATIONS_MANAGER, FARM_MANAGER, PHARMACY_SALES |
| `/api/inventory/items/{id}` | GET | ADMIN, STORE_KEEPER, OPERATIONS_MANAGER, FARM_MANAGER, PHARMACY_SALES |
| `/api/inventory/items` | POST | ADMIN, STORE_KEEPER, OPERATIONS_MANAGER |
| `/api/inventory/items/{id}` | PUT | ADMIN, STORE_KEEPER, OPERATIONS_MANAGER |
| `/api/inventory/stock-in` | POST | ADMIN, STORE_KEEPER |
| `/api/inventory/stock-out` | POST | ADMIN, STORE_KEEPER, FARM_MANAGER |
| `/api/inventory/current-stock` | GET | ADMIN, STORE_KEEPER, OPERATIONS_MANAGER, FARM_MANAGER, PHARMACY_SALES |
| `/api/inventory/low-stock` | GET | ADMIN, STORE_KEEPER, OPERATIONS_MANAGER |
| `/api/inventory/expiry-alerts` | GET | ADMIN, STORE_KEEPER, OPERATIONS_MANAGER, PHARMACY_SALES |

### Module: Pharmacy

| Endpoint | Method | Required Role(s) |
|----------|--------|-----------------|
| `/api/pharmacy/customers` | GET | ADMIN, PHARMACY_SALES, FINANCE_OFFICER |
| `/api/pharmacy/customers` | POST | ADMIN, PHARMACY_SALES |
| `/api/pharmacy/sales` | GET | ADMIN, PHARMACY_SALES, FINANCE_OFFICER, GENERAL_MANAGER |
| `/api/pharmacy/sales` | POST | ADMIN, PHARMACY_SALES |
| `/api/pharmacy/sales/{id}/receipt` | GET | ADMIN, PHARMACY_SALES, FINANCE_OFFICER |

### Module: Finance

| Endpoint | Method | Required Role(s) |
|----------|--------|-----------------|
| `/api/finance/transactions` | GET | ADMIN, GENERAL_MANAGER, FINANCE_OFFICER |
| `/api/finance/transactions` | POST | ADMIN, FINANCE_OFFICER |
| `/api/finance/income` | GET | ADMIN, GENERAL_MANAGER, FINANCE_OFFICER |
| `/api/finance/expenses` | GET | ADMIN, GENERAL_MANAGER, FINANCE_OFFICER |
| `/api/finance/profit-loss` | GET | ADMIN, GENERAL_MANAGER, FINANCE_OFFICER |

### Module: CRM

| Endpoint | Method | Required Role(s) |
|----------|--------|-----------------|
| `/api/crm/clients` | GET | ADMIN, EXTENSION_WORKER, OPERATIONS_MANAGER |
| `/api/crm/clients/{id}` | GET | ADMIN, EXTENSION_WORKER, OPERATIONS_MANAGER |
| `/api/crm/clients` | POST | ADMIN, EXTENSION_WORKER, OPERATIONS_MANAGER |
| `/api/crm/clients/{id}` | PUT | ADMIN, EXTENSION_WORKER, OPERATIONS_MANAGER |
| `/api/crm/farm-visits` | GET | ADMIN, EXTENSION_WORKER, OPERATIONS_MANAGER |
| `/api/crm/farm-visits` | POST | ADMIN, EXTENSION_WORKER |
| `/api/crm/follow-ups` | GET | ADMIN, EXTENSION_WORKER, OPERATIONS_MANAGER |

### Module: User Management

| Endpoint | Method | Required Role(s) |
|----------|--------|-----------------|
| `/api/users` | GET | ADMIN |
| `/api/users/{id}` | GET | ADMIN |
| `/api/users` | POST | ADMIN |
| `/api/users/{id}` | PUT | ADMIN |
| `/api/users/{id}/status` | PATCH | ADMIN |

### Module: Dashboard

| Endpoint | Method | Required Role(s) |
|----------|--------|-----------------|
| `/api/dashboard/admin` | GET | ADMIN, GENERAL_MANAGER |
| `/api/dashboard/farm-manager` | GET | ADMIN, FARM_MANAGER, OPERATIONS_MANAGER |
| `/api/dashboard/store` | GET | ADMIN, STORE_KEEPER, OPERATIONS_MANAGER |
| `/api/dashboard/vet` | GET | ADMIN, VETERINARY_OFFICER |
| `/api/dashboard/pharmacy` | GET | ADMIN, PHARMACY_SALES |
| `/api/dashboard/finance` | GET | ADMIN, FINANCE_OFFICER, GENERAL_MANAGER |

### Module: Audit

| Endpoint | Method | Required Role(s) |
|----------|--------|-----------------|
| `/api/audit` | GET | ADMIN, GENERAL_MANAGER |

### Module: Notifications

| Endpoint | Method | Required Role(s) |
|----------|--------|-----------------|
| `/api/notifications` | GET | Any authenticated user |
| `/api/notifications/{id}/read` | PATCH | Any authenticated user |

### Module: Auth

| Endpoint | Method | Required Role(s) |
|----------|--------|-----------------|
| `/api/auth/login` | POST | Public (permitAll) |
| `/api/auth/me` | GET | Any authenticated user |

## Sample Controller Implementation

```java
@RestController
@RequestMapping("/api/farms")
@RequiredArgsConstructor
public class FarmController {

    private final FarmService farmService;

    // Anyone with FARM_MANAGER, ADMIN, VET, or STORE role can view
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','FARM_MANAGER','VET','STORE')")
    public ResponseEntity<ApiResponse<List<FarmResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(farmService.getAll()));
    }

    // Only ADMIN can create
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<FarmResponse>> create(@Valid @RequestBody FarmRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Farm created", farmService.create(req)));
    }

    // Only ADMIN can update status
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<FarmResponse>> updateStatus(@PathVariable Long id, 
                                                                   @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.success(
            farmService.updateStatus(id, FarmStatus.valueOf(body.get("status")))));
    }
}
```

## JWT Token Structure

```json
{
  "sub": "user@trustagro.com",
  "userId": 1,
  "role": "ADMIN",
  "roles": ["ADMIN", "FARM_MANAGER"],
  "iat": 1704067200,
  "exp": 1704153600
}
```

## Security Annotations Reference

| Annotation | Usage |
|------------|-------|
| `@PreAuthorize("hasRole('ADMIN')")` | Single role required |
| `@PreAuthorize("hasAnyRole('ADMIN','FARM_MANAGER')")` | Any of the listed roles |
| `@PreAuthorize("isAuthenticated()")` | Any logged-in user |
| `@PreAuthorize("hasAuthority('ROLE_ADMIN')")` | Authority-based (with ROLE_ prefix) |

## Best Practices

1. **Use `hasAnyRole()` for read operations** - Allow multiple roles to view data
2. **Use `hasRole()` for write operations** - Restrict modifications to specific roles
3. **Always secure GET endpoints** - Even read operations should require authentication
4. **Keep role aliases** - VET ↔ VETERINARY_OFFICER for backward compatibility
5. **Validate at service layer** - Double-check permissions in business logic when needed
6. **Use JWT claims** - Include roles in token for stateless validation
7. **Database indexing** - Index the `user_roles` table for performance

## Testing RBAC

```bash
# Login as admin
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@trustagro.com","password":"Admin@1234"}'

# Use token to access protected endpoint
curl http://localhost:8080/api/farms \
  -H "Authorization: Bearer <token>"

# Attempt with insufficient permissions (should return 403)
curl http://localhost:8080/api/users \
  -H "Authorization: Bearer <farm_manager_token>"
```

## Migration Notes

When migrating from single-role to Many-to-Many:

1. Existing `users.role` column preserved for backward compatibility
2. New `user_roles` join table stores all assigned roles
3. `CustomUserDetailsService` loads from both sources (join table preferred)
4. Role aliases ensure existing `@PreAuthorize` annotations continue working
