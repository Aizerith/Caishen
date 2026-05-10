package fr.caishen.server.domain.services;

import fr.caishen.server.dal.entity.AppUserEntity;
import fr.caishen.server.dal.repository.AppUserRepository;
import fr.caishen.server.security.service.JwtService;
import fr.caishen.server.web.dto.LoginResponse;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;

    public LoginResponse login(String identifier, String password) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(identifier, password));
        AppUserEntity appUser = appUserRepository.findByLoginOrUsername(identifier, identifier).orElseThrow();
        return new LoginResponse(
                jwtService.generateToken(appUser.getLogin(), appUser.getId()),
                jwtService.generateRefreshToken(appUser.getLogin()));
    }

    public LoginResponse register(String username, String email, String password) {
        AppUserEntity user = new AppUserEntity();
        user.setUsername(username);
        user.setLogin(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setDateOfRegistration(LocalDateTime.now());
        appUserRepository.save(user);
        return new LoginResponse(jwtService.generateToken(email, user.getId()), jwtService.generateRefreshToken(email));
    }

    public ResponseEntity<Void> refresh(HttpServletResponse response) {
        AppUserEntity appUser = appUserRepository.findByLogin(getCurrentUser().getUsername()).orElseThrow();
        if (appUser.getDeletedAt() == null) {
            response.setHeader("Access-Control-Expose-Headers", "access_token, refresh_token");
            response.addHeader("access_token",
                    jwtService.generateToken(appUser.getLogin(), appUser.getId()));
            response.addHeader("refresh_token",
                    jwtService.generateRefreshToken(appUser.getLogin()));
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.status(403).build();
    }

    public User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return new User((String) auth.getPrincipal(), "", auth.getAuthorities());
    }
}
