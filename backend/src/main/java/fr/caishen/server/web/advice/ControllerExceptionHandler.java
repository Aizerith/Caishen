package fr.caishen.server.web.advice;

import fr.caishen.server.domain.exception.AccountNotActivatedException;
import fr.caishen.server.domain.exception.GroupAccessDeniedException;
import fr.caishen.server.domain.exception.InvalidAuthTokenException;
import fr.caishen.server.domain.exception.UserAlreadyExistsException;
import fr.caishen.server.domain.exception.UserAlreadyInGroupException;
import fr.caishen.server.web.dto.ErrorResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@ControllerAdvice
public class ControllerExceptionHandler {

    @ExceptionHandler(UserAlreadyInGroupException.class)
    public ResponseEntity<?> userAlreadyInGroupException(UserAlreadyInGroupException e) {
        log.error("Add user in group error : {}", e.getMessage());
        return ResponseEntity.unprocessableEntity().body(
                new ErrorResponse(
                        HttpStatus.UNPROCESSABLE_ENTITY,
                        "Vous faites déjà partie de ce groupe",
                        LocalDateTime.now(),
                        List.of("UserAlreadyInGroupException")));
    }

    @ExceptionHandler(AccountNotActivatedException.class)
    public ResponseEntity<?> accountNotActivatedException(AccountNotActivatedException e) {
        log.error("Login error : {}", e.getMessage());
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                new ErrorResponse(
                        HttpStatus.FORBIDDEN,
                        "Compte non active. Verifiez vos emails.",
                        LocalDateTime.now(),
                        List.of("AccountNotActivatedException")));
    }

    @ExceptionHandler(GroupAccessDeniedException.class)
    public ResponseEntity<?> groupAccessDeniedException(GroupAccessDeniedException e) {
        log.error("Group access denied : {}", e.getMessage());
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                new ErrorResponse(
                        HttpStatus.FORBIDDEN,
                        "Vous ne faites pas partie de ce groupe.",
                        LocalDateTime.now(),
                        List.of("GroupAccessDeniedException")));
    }

    @ExceptionHandler(InvalidAuthTokenException.class)
    public ResponseEntity<?> invalidAuthTokenException(InvalidAuthTokenException e) {
        log.error("Authentication token error : {}", e.getMessage());
        return ResponseEntity.badRequest().body(
                new ErrorResponse(
                        HttpStatus.BAD_REQUEST,
                        "Lien invalide ou expire.",
                        LocalDateTime.now(),
                        List.of("InvalidAuthTokenException")));
    }

    @ExceptionHandler(UserAlreadyExistsException.class)
    public ResponseEntity<?> userAlreadyExistsException(UserAlreadyExistsException e) {
        log.error("Register error : {}", e.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(
                new ErrorResponse(
                        HttpStatus.CONFLICT,
                        "Email ou pseudo deja utilise.",
                        LocalDateTime.now(),
                        List.of("UserAlreadyExistsException")));
    }
}
