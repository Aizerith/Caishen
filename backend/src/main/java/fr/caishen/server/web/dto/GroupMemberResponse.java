package fr.caishen.server.web.dto;

import java.math.BigDecimal;

public record GroupMemberResponse(Long id, String name, BigDecimal expenseDelta) {
}
