package fr.caishen.server.web.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ExpenseResponse(Long id, String title, BigDecimal amount, String participant, String payerName, LocalDate expenseDate) {
}
