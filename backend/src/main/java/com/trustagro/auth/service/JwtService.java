package com.trustagro.auth.service;

import com.trustagro.user.entity.User;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class JwtService {

    @Value("${app.jwt.secret}")
    private String secret;

    @Value("${app.jwt.expiration}")
    private long expiration;

    private Key getKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    public String generateToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getId());
        claims.put("role", user.getRole().name());

        // Include all roles from ManyToMany collection
        if (user.getRoles() != null && !user.getRoles().isEmpty()) {
            claims.put("roles", user.getRoles().stream()
                    .map(r -> r.getName() != null ? r.getName().name() : null)
                    .filter(java.util.Objects::nonNull)
                    .collect(Collectors.toList()));
        }

        return Jwts.builder()
                .setSubject(user.getEmail())
                .addClaims(claims)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public long getExpiration() {
        return expiration;
    }

    public String extractEmail(String token) {
        return Jwts.parserBuilder().setSigningKey(getKey()).build()
                .parseClaimsJws(token).getBody().getSubject();
    }

    @SuppressWarnings("unchecked")
    public java.util.List<String> extractRoles(String token) {
        try {
            Object roles = Jwts.parserBuilder().setSigningKey(getKey()).build()
                    .parseClaimsJws(token).getBody().get("roles");
            if (roles instanceof java.util.List) {
                return (java.util.List<String>) roles;
            }
        } catch (JwtException e) {
            // fallback
        }
        return java.util.Collections.emptyList();
    }

    public boolean isValid(String token, UserDetails userDetails) {
        try {
            String email = extractEmail(token);
            return email.equals(userDetails.getUsername()) &&
                    !Jwts.parserBuilder().setSigningKey(getKey()).build()
                            .parseClaimsJws(token).getBody().getExpiration().before(new Date());
        } catch (JwtException e) {
            return false;
        }
    }
}
