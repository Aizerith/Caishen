package fr.caishen.server.security.service;

import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Date;

@Service
public class JwtService {

    @Value("${jwt.expiration-date}")
    private Long expirationDate;

    @Value("${jwt.refresh-expiration-date}")
    private Long refreshExpirationDate;

    @Value("${jwt.secret}")
    private String secret;

    public String generateToken(String username) {
        return generateToken(username, null);
    }

    public String generateToken(String username, Long userId) {
        Date now = new Date();
        Date expiration = new Date(now.getTime() + expirationDate);
        return Jwts.builder()
                .subject(username)
                .claim("id", userId)
                .claim("roles", List.of())
                .claim("remember", false)
                .issuedAt(now)
                .expiration(expiration)
                .signWith(secretKey())
                .compact();
    }

    public String generateRefreshToken(String username) {
        Date now = new Date();
        Date expiration = new Date(now.getTime() + refreshExpirationDate);
        return Jwts.builder()
                .subject(username)
                .issuedAt(now)
                .expiration(expiration)
                .signWith(secretKey())
                .compact();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(secretKey())
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (JwtException e) {
            return false;
        }
    }

    public String getLoginFromToken(String token) {
        return Jwts.parser()
                .verifyWith(secretKey())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    private SecretKey secretKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }
}
