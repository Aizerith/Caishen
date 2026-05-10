package fr.caishen.server.web.dto;

public record LoginResponse(String token, String refreshToken) {
}
