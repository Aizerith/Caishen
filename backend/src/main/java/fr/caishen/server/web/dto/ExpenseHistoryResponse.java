package fr.caishen.server.web.dto;

import fr.caishen.server.dal.entity.ExpenseHistoryAction;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ExpenseHistoryResponse(
        Long id,
        Long groupId,
        Long expenseId,
        String expenseTitle,
        ExpenseHistoryAction action,
        Long actorId,
        String actorName,
        BigDecimal amount,
        LocalDateTime createdAt
) {
}
