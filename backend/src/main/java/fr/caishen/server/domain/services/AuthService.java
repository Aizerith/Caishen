package fr.caishen.server.domain.services;

import fr.caishen.server.dal.entity.AppUserEntity;
import fr.caishen.server.dal.repository.AppUserRepository;
import fr.caishen.server.domain.exception.AccountNotActivatedException;
import fr.caishen.server.domain.exception.InvalidAuthTokenException;
import fr.caishen.server.domain.exception.UserAlreadyExistsException;
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
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class AuthService {
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final MailService mailService;

    public LoginResponse login(String identifier, String password) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(identifier, password));
        AppUserEntity appUser = appUserRepository.findByLoginOrUsername(identifier, identifier).orElseThrow();
        if (!Boolean.TRUE.equals(appUser.getIsActivated())) {
            throw new AccountNotActivatedException();
        }
        return new LoginResponse(
                jwtService.generateToken(appUser.getLogin(), appUser.getId()),
                jwtService.generateRefreshToken(appUser.getLogin()));
    }

    public void register(String username, String email, String password) {
        if (appUserRepository.existsByLogin(email) || appUserRepository.existsByUsername(username)) {
            throw new UserAlreadyExistsException();
        }

        AppUserEntity user = new AppUserEntity();
        user.setUsername(username);
        user.setLogin(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setDateOfRegistration(LocalDateTime.now());
        user.setIsActivated(false);
        user.setActivationLink(generateToken());
        user.setActivationTokenExpiresAt(LocalDateTime.now().plusHours(24));
        appUserRepository.save(user);
        mailService.sendAccountActivationEmail(user);
    }

    public void activateAccount(String token) {
        AppUserEntity user = appUserRepository.findByActivationLink(token)
                .orElseThrow(InvalidAuthTokenException::new);

        if (user.getActivationTokenExpiresAt() == null || user.getActivationTokenExpiresAt().isBefore(LocalDateTime.now())) {
            throw new InvalidAuthTokenException();
        }

        user.setIsActivated(true);
        user.setActivationLink(null);
        user.setActivationTokenExpiresAt(null);
    }

    public void requestPasswordReset(String email) {
        appUserRepository.findByLogin(email)
                .filter(user -> Boolean.TRUE.equals(user.getIsActivated()))
                .ifPresent(user -> {
                    user.setPasswordResetToken(generateToken());
                    user.setPasswordResetTokenExpiresAt(LocalDateTime.now().plusHours(1));
                    mailService.sendPasswordResetEmail(user);
                });
    }

    public void confirmPasswordReset(String token, String password) {
        AppUserEntity user = appUserRepository.findByPasswordResetToken(token)
                .orElseThrow(InvalidAuthTokenException::new);

        if (user.getPasswordResetTokenExpiresAt() == null || user.getPasswordResetTokenExpiresAt().isBefore(LocalDateTime.now())) {
            throw new InvalidAuthTokenException();
        }

        user.setPassword(passwordEncoder.encode(password));
        user.setPasswordResetToken(null);
        user.setPasswordResetTokenExpiresAt(null);
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

    private String generateToken() {
        return UUID.randomUUID().toString();
    }
}
