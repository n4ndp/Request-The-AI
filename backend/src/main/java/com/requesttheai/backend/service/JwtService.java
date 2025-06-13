package com.requesttheai.backend.service;

import java.security.Key;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

    @Value("${jwt.secret-key}")
    private String secretKey;

    @Value("${jwt.expiration-ms}")
    private long expirationMs;

    public String getToken(UserDetails user) {
        return getToken(new HashMap<>(), user);
    }

    public String getToken(HashMap<String, Object> ExtraClaims, UserDetails user) {
        return Jwts.builder()
                .claims(ExtraClaims)
                .subject(user.getUsername())
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(getKey())
                .compact();
    }

    private Key getKey() {
        byte[] keyBytes = Base64.getDecoder().decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    // public String getToken(UserD user) {
    //     Map<String, Object> claims = new HashMap<>();
    //     claims.put("username", user.getUsername());
    //     claims.put("role", user.getAccount().getRole().name());
    //     return buildToken(claims, user.getUsername());
    // }

    // private String buildToken(Map<String, Object> claims, String subject) {
    //     return Jwts.builder()
    //         .claims(claims)
    //         .subject(subject)
    //         .issuedAt(new Date(System.currentTimeMillis()))
    //         .expiration(new Date(System.currentTimeMillis() + expirationMs))
    //         .signWith(getKey())
    //         .compact();
    // }

    // public String extractUsername(String token) {
    //     return extractClaim(token, Claims::getSubject);
    // }

    // public String extractRole(String token) {
    //     return extractClaim(token, claims -> claims.get("role", String.class));
    // }

    // public boolean isTokenValid(String token) {
    //     try {
    //         extractAllClaims(token);
    //         return true;
    //     } catch (Exception e) {
    //         return false;
    //     }
    // }

    // public boolean isTokenValid(String token, UserDetails userDetails) {
    //     final String username = extractUsername(token);
    //     return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
    // }

    // private boolean isTokenExpired(String token) {
    //     final Date expiration = extractClaim(token, Claims::getExpiration);
    //     return expiration.before(new Date());
    // }

    // private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
    //     final Claims claims = extractAllClaims(token);
    //     return claimsResolver.apply(claims);
    // }

    // private Claims extractAllClaims(String token) {
    //     return Jwts.parser()
    //         .verifyWith(getKey())
    //         .build()
    //         .parseSignedClaims(token)
    //         .getPayload();
    // }

    // private SecretKey getKey() {
    //     byte[] keyBytes = Decoders.BASE64.decode(secretKey);
    //     return Keys.hmacShaKeyFor(keyBytes);
    // }
}