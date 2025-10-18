package com.example.ecom_proj.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SecurityException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.function.Function;

/**
 * JWT Utility Class (Compatible with JJWT 0.12.x)
 */
@Component
public class JwtUtil {

    @Value("${jwt.secret:MySecretKeyForJWTTokenGenerationAndValidation123456789}")
    private String SECRET_KEY;

    @Value("${jwt.expiration:36000000}") // 10 hours default
    private long JWT_TOKEN_VALIDITY;

    private SecretKey getSigningKey() {
        byte[] keyBytes = SECRET_KEY.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    // =====================
    // ===== GENERATION ====
    // =====================

    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        // e.g., claims.put("role", userDetails.getAuthorities());
        return createToken(claims, userDetails.getUsername());
    }

    public String generateToken(Map<String, Object> extraClaims, String username) {
        return createToken(extraClaims, username);
    }

    private String createToken(Map<String, Object> claims, String subject) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + JWT_TOKEN_VALIDITY);

        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey())   // automatically picks HS256 for HMAC keys
                .compact();
    }

    // =====================
    // ===== EXTRACTION ====
    // =====================

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> resolver) {
        final Claims claims = extractAllClaims(token);
        return resolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()                       // ✅ new parser factory in 0.12.x
                .verifyWith(getSigningKey())       // verify signature using our key
                .build()
                .parseSignedClaims(token)          // new method name in 0.12.x
                .getPayload();                     // payload = Claims
    }

    // =====================
    // ===== VALIDATION ====
    // =====================

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    public boolean validateToken(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (ExpiredJwtException e) {
            System.out.println("Token expired");
            return false;
        } catch (JwtException e) {
            System.out.println("Invalid token");
            return false;
        }
    }
}
