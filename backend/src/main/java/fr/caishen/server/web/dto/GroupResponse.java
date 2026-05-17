package fr.caishen.server.web.dto;

import java.util.List;

public record GroupResponse(Long id, String uuid, String title, List<GroupMemberResponse> memberList, List<ExpenseResponse> expenseList, List<SettlementResponse> settlementList) {
}
