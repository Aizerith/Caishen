package fr.caishen.server.web.dto;

import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.util.List;

public record ErrorResponse(HttpStatus status, String message, LocalDateTime date, List<String> code) {
}
