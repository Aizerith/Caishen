package fr.caishen.server.web.dto;

public record ExpenseHistoryChangeResponse(
        String field,
        String beforeValue,
        String afterValue
) {
}
