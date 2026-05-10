package fr.caishen.server.web.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record ExpenseInfoResponse(Long id, String title, BigDecimal amount, List<ParticipantDTO> participantDTOList,
                                  String payerName, LocalDate expenseDate) {
}
