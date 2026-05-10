package fr.caishen.server.web.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ExpenseRequest(Long groupId, String title, BigDecimal amount, String participant, Long payerId, LocalDate expenseDate) {
}
