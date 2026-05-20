package fr.caishen.server.web.dto;

import fr.caishen.server.dal.entity.ExpenseHistoryAction;
import org.jspecify.annotations.Nullable;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record GroupActivityResponse(
        Long groupId,
        Long latestHistoryId,
        ExpenseHistoryAction action,
        Long actorId,
        String actorName,
        @Nullable String expenseTitle,
        @Nullable BigDecimal amount,
        LocalDateTime createdAt
) {
}
