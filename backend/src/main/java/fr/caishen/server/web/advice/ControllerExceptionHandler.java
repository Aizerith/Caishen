package fr.caishen.server.web.advice;

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
}
