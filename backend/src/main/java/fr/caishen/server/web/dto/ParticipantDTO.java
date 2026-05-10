package fr.caishen.server.web.dto;

import java.math.BigDecimal;

public record ParticipantDTO(String username, BigDecimal amount) {
}
