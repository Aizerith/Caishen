package fr.caishen.server.web.controller;

import fr.caishen.server.domain.services.AuthService;
import fr.caishen.server.web.dto.LoginRequest;
import fr.caishen.server.web.dto.LoginResponse;
import fr.caishen.server.web.dto.PasswordResetConfirmRequest;
import fr.caishen.server.web.dto.PasswordResetRequest;
import fr.caishen.server.web.dto.RegisterRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@Slf4j
@RequiredArgsConstructor
@RequestMapping("/auth")
public class AuthController {
    private final AuthService authService;

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest data) {
        log.info("POST /auth/login");
        return authService.login(data.email(), data.password());
    }

    @PostMapping("/register")
    public ResponseEntity<Void> register(@RequestBody RegisterRequest data) {
        log.info("POST /auth/register");
        authService.register(data.username(), data.email(), data.password());
        return ResponseEntity.accepted().build();
    }

    @GetMapping("/activate")
    public ResponseEntity<Void> activateAccount(@RequestParam String token) {
        log.info("GET /auth/activate");
        authService.activateAccount(token);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/password-reset/request")
    public ResponseEntity<Void> requestPasswordReset(@RequestBody PasswordResetRequest data) {
        log.info("POST /auth/password-reset/request");
        authService.requestPasswordReset(data.email());
        return ResponseEntity.accepted().build();
    }

    @PostMapping("/password-reset/confirm")
    public ResponseEntity<Void> confirmPasswordReset(@RequestBody PasswordResetConfirmRequest data) {
        log.info("POST /auth/password-reset/confirm");
        authService.confirmPasswordReset(data.token(), data.password());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/refresh")
    public ResponseEntity<Void> refreshToken(HttpServletResponse response) {
        log.info("POST /auth/refresh");
        return this.authService.refresh(response);
    }
}
