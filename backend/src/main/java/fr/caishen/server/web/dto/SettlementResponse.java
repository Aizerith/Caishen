package fr.caishen.server.web.dto;

import java.math.BigDecimal;

public record SettlementResponse(Long debtorId, String debtorName, Long creditorId, String creditorName, BigDecimal amount) {
}
