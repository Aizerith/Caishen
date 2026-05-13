package fr.caishen.server.domain.services;

import fr.caishen.server.dal.entity.AppUserEntity;
import fr.caishen.server.dal.entity.ExpenseEntity;
import fr.caishen.server.dal.entity.GroupEntity;
import fr.caishen.server.dal.repository.AppUserRepository;
import fr.caishen.server.dal.repository.ExpenseRepository;
import fr.caishen.server.dal.repository.GroupRepository;
import fr.caishen.server.web.dto.GroupMemberResponse;
import fr.caishen.server.web.dto.GroupResponse;
import fr.caishen.server.websocket.service.WebSocketService;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class CaishenGroupServiceTest {

    private final AppUserRepository appUserRepository = mock(AppUserRepository.class);
    private final GroupRepository groupRepository = mock(GroupRepository.class);
    private final ExpenseRepository expenseRepository = mock(ExpenseRepository.class);
    private final WebSocketService webSocketService = mock(WebSocketService.class);
    private final CaishenGroupService service = new CaishenGroupService(
            appUserRepository,
            groupRepository,
            null,
            expenseRepository,
            webSocketService
    );

    @Test
    void balancesStayBalancedWhenExpenseCannotBeSplitEvenly() {
        AppUserEntity shen = user(1L, "Shen");
        AppUserEntity leona = user(2L, "Leona");
        AppUserEntity neeko = user(3L, "Neeko");
        GroupEntity group = group(List.of(shen, leona, neeko), List.of(expense("100.00", "1 2 3", 1L)));

        when(groupRepository.findById(1L)).thenReturn(Optional.of(group));
        when(appUserRepository.findById(1L)).thenReturn(Optional.of(shen));

        GroupResponse response = service.getGroupInfo(1L);

        assertThat(totalBalance(response)).isEqualByComparingTo("0.00");
        assertThat(balanceFor(response, "Shen")).isEqualByComparingTo("66.67");
        assertThat(balanceFor(response, "Leona")).isEqualByComparingTo("-33.34");
        assertThat(balanceFor(response, "Neeko")).isEqualByComparingTo("-33.33");
    }

    @Test
    void balancesStayBalancedWhenPayerIsNotParticipant() {
        AppUserEntity shen = user(1L, "Shen");
        AppUserEntity leona = user(2L, "Leona");
        AppUserEntity neeko = user(3L, "Neeko");
        AppUserEntity garen = user(4L, "Garen");
        GroupEntity group = group(List.of(shen, leona, neeko, garen), List.of(expense("10.00", "2 3 4", 1L)));

        when(groupRepository.findById(1L)).thenReturn(Optional.of(group));
        when(appUserRepository.findById(1L)).thenReturn(Optional.of(shen));

        GroupResponse response = service.getGroupInfo(1L);

        assertThat(totalBalance(response)).isEqualByComparingTo("0.00");
        assertThat(balanceFor(response, "Shen")).isEqualByComparingTo("10.00");
        assertThat(balanceFor(response, "Leona")).isEqualByComparingTo("-3.33");
        assertThat(balanceFor(response, "Neeko")).isEqualByComparingTo("-3.34");
        assertThat(balanceFor(response, "Garen")).isEqualByComparingTo("-3.33");
    }

    private AppUserEntity user(Long id, String username) {
        AppUserEntity user = new AppUserEntity();
        user.setId(id);
        user.setUsername(username);
        user.setLogin(username.toLowerCase());
        return user;
    }

    private GroupEntity group(List<AppUserEntity> users, List<ExpenseEntity> expenses) {
        GroupEntity group = new GroupEntity();
        group.setId(1L);
        group.setTitle("Trip");
        group.setUuid("group-uuid");
        group.setGroupAppUserEntityList(users);
        group.setGroupExpenseEntityList(expenses);
        return group;
    }

    private ExpenseEntity expense(String amount, String participants, Long payerId) {
        ExpenseEntity expense = new ExpenseEntity();
        expense.setId(1L);
        expense.setTitle("Dinner");
        expense.setAmount(new BigDecimal(amount));
        expense.setParticipant(participants);
        expense.setPayerId(payerId);
        expense.setExpenseDate(LocalDate.now());
        return expense;
    }

    private BigDecimal totalBalance(GroupResponse response) {
        return response.memberList().stream()
                .map(GroupMemberResponse::expenseDelta)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal balanceFor(GroupResponse response, String username) {
        return response.memberList().stream()
                .filter(member -> member.name().equals(username))
                .findFirst()
                .orElseThrow()
                .expenseDelta();
    }
}
