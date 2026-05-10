package fr.caishen.server.web.controller;

import fr.caishen.server.domain.services.AuthService;
import fr.caishen.server.web.dto.LoginRequest;
import fr.caishen.server.web.dto.LoginResponse;
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
    public LoginResponse register(@RequestBody RegisterRequest data) {
        log.info("POST /auth/register");
        return authService.register(data.username(), data.email(), data.password());
    }

    @PostMapping("/refresh")
    public ResponseEntity<Void> refreshToken(HttpServletResponse response) {
        log.info("POST /auth/refresh");
        return this.authService.refresh(response);
    }
}
