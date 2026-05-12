package fr.caishen.server.web.dto;

public record PasswordResetConfirmRequest(String token, String password) {
}
