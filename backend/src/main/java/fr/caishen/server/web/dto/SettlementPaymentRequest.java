package fr.caishen.server.web.dto;

import java.math.BigDecimal;

public record SettlementPaymentRequest(Long groupId, Long receiverId, BigDecimal amount) {
}
