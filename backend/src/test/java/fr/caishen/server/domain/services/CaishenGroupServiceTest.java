package fr.caishen.server.domain.services;

import fr.caishen.server.dal.entity.AppUserEntity;
import fr.caishen.server.dal.entity.ExpenseEntity;
import fr.caishen.server.dal.entity.GroupEntity;
import fr.caishen.server.dal.entity.SettlementPaymentEntity;
import fr.caishen.server.dal.repository.AppUserRepository;
import fr.caishen.server.dal.repository.ExpenseHistoryRepository;
import fr.caishen.server.dal.repository.ExpenseRepository;
import fr.caishen.server.dal.repository.GroupRepository;
import fr.caishen.server.dal.repository.SettlementPaymentRepository;
import fr.caishen.server.web.dto.GroupMemberResponse;
import fr.caishen.server.web.dto.GroupResponse;
import fr.caishen.server.web.dto.SettlementPaymentRequest;
import fr.caishen.server.web.dto.SettlementResponse;
import fr.caishen.server.websocket.service.WebSocketService;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class CaishenGroupServiceTest {

    private final AppUserRepository appUserRepository = mock(AppUserRepository.class);
    private final GroupRepository groupRepository = mock(GroupRepository.class);
    private final ExpenseRepository expenseRepository = mock(ExpenseRepository.class);
    private final ExpenseHistoryRepository expenseHistoryRepository = mock(ExpenseHistoryRepository.class);
    private final SettlementPaymentRepository settlementPaymentRepository = mock(SettlementPaymentRepository.class);
    private final AuthService authService = mock(AuthService.class);
    private final WebSocketService webSocketService = mock(WebSocketService.class);
    private final PushNotificationService pushNotificationService = mock(PushNotificationService.class);
    private final CaishenGroupService service = new CaishenGroupService(
            appUserRepository,
            groupRepository,
            authService,
            expenseRepository,
            expenseHistoryRepository,
            settlementPaymentRepository,
            webSocketService,
            pushNotificationService
    );

    CaishenGroupServiceTest() {
        when(settlementPaymentRepository.findByGroupId(any())).thenReturn(List.of());
    }

    @Test
    void balancesStayBalancedWhenExpenseCannotBeSplitEvenly() {
        AppUserEntity shen = user(1L, "Shen");
        AppUserEntity leona = user(2L, "Leona");
        AppUserEntity neeko = user(3L, "Neeko");
        GroupEntity group = group(List.of(shen, leona, neeko), List.of(expense("100.00", "1 2 3", 1L)));

        when(groupRepository.findById(1L)).thenReturn(Optional.of(group));
        when(appUserRepository.findById(1L)).thenReturn(Optional.of(shen));
        mockCurrentUser(shen);

        GroupResponse response = service.getGroupInfo(1L);

        assertThat(totalBalance(response)).isEqualByComparingTo("0.00");
        assertThat(balanceFor(response, "Shen")).isEqualByComparingTo("66.67");
        assertThat(balanceFor(response, "Leona")).isEqualByComparingTo("-33.34");
        assertThat(balanceFor(response, "Neeko")).isEqualByComparingTo("-33.33");
        assertThat(response.settlementList())
                .extracting(SettlementResponse::debtorName, SettlementResponse::creditorName, settlement -> settlement.amount().toPlainString())
                .containsExactly(
                        org.assertj.core.groups.Tuple.tuple("Leona", "Shen", "33.34"),
                        org.assertj.core.groups.Tuple.tuple("Neeko", "Shen", "33.33")
                );
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
        mockCurrentUser(shen);

        GroupResponse response = service.getGroupInfo(1L);

        assertThat(totalBalance(response)).isEqualByComparingTo("0.00");
        assertThat(balanceFor(response, "Shen")).isEqualByComparingTo("10.00");
        assertThat(balanceFor(response, "Leona")).isEqualByComparingTo("-3.33");
        assertThat(balanceFor(response, "Neeko")).isEqualByComparingTo("-3.34");
        assertThat(balanceFor(response, "Garen")).isEqualByComparingTo("-3.33");
        assertThat(response.settlementList())
                .extracting(SettlementResponse::debtorName, SettlementResponse::creditorName, settlement -> settlement.amount().toPlainString())
                .containsExactly(
                        org.assertj.core.groups.Tuple.tuple("Neeko", "Shen", "3.34"),
                        org.assertj.core.groups.Tuple.tuple("Leona", "Shen", "3.33"),
                        org.assertj.core.groups.Tuple.tuple("Garen", "Shen", "3.33")
                );
    }

    @Test
    void pushNotificationIsNotSentToExpenseActor() {
        AppUserEntity shen = user(1L, "Shen");
        AppUserEntity bob = user(2L, "Bob");
        GroupEntity group = group(List.of(shen, bob), List.of());

        when(groupRepository.findById(1L)).thenReturn(Optional.of(group));
        when(expenseRepository.save(any(ExpenseEntity.class))).thenAnswer(invocation -> {
            ExpenseEntity expense = invocation.getArgument(0);
            expense.setId(10L);
            return expense;
        });
        mockCurrentUser(shen);

        service.createExpense(new fr.caishen.server.web.dto.ExpenseRequest(
                1L,
                "Dinner",
                new BigDecimal("20.00"),
                "1 2",
                1L,
                LocalDate.now()
        ));

        verify(pushNotificationService).notifyUsers(
                argThat(users -> users.size() == 1 && users.get(0).getId().equals(bob.getId())),
                eq("Dépense ajoutée"),
                any(),
                any()
        );
    }

    @Test
    void pushNotificationIsNotSentToJoiningUser() throws Exception {
        AppUserEntity shen = user(1L, "Shen");
        AppUserEntity bob = user(2L, "Bob");
        GroupEntity group = group(List.of(bob), List.of());

        when(groupRepository.findByUuid("group-uuid")).thenReturn(Optional.of(group));
        when(groupRepository.save(group)).thenReturn(group);
        mockCurrentUser(shen);

        service.addUserToGroup("group-uuid");

        verify(pushNotificationService).notifyUsers(
                argThat(users -> users.size() == 1 && users.get(0).getId().equals(bob.getId())),
                eq("Caishen"),
                any(),
                any()
        );
    }

    @Test
    void paidSettlementReducesBalancesAndNotifiesOtherMembers() {
        AppUserEntity shen = user(1L, "Shen");
        AppUserEntity bob = user(2L, "Bob");
        GroupEntity group = group(List.of(shen, bob), List.of(expense("20.00", "1 2", 2L)));
        List<SettlementPaymentEntity> settlementPayments = new ArrayList<>();

        when(groupRepository.findById(1L)).thenReturn(Optional.of(group));
        when(appUserRepository.findById(2L)).thenReturn(Optional.of(bob));
        when(settlementPaymentRepository.findByGroupId(1L)).thenAnswer(invocation -> settlementPayments);
        when(settlementPaymentRepository.save(any(SettlementPaymentEntity.class))).thenAnswer(invocation -> {
            SettlementPaymentEntity payment = invocation.getArgument(0);
            payment.setId(1L);
            settlementPayments.add(payment);
            return payment;
        });
        mockCurrentUser(shen);

        GroupResponse response = service.paySettlement(new SettlementPaymentRequest(1L, 2L, new BigDecimal("10.00")));

        assertThat(balanceFor(response, "Shen")).isEqualByComparingTo("0.00");
        assertThat(balanceFor(response, "Bob")).isEqualByComparingTo("0.00");
        assertThat(response.settlementList()).isEmpty();
        verify(pushNotificationService).notifyUsers(
                argThat(users -> users.size() == 1 && users.get(0).getId().equals(bob.getId())),
                eq("Règlement payé"),
                any(),
                eq("/group/1")
        );
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
        group.setGroupAppUserEntityList(new ArrayList<>(users));
        group.setGroupExpenseEntityList(new ArrayList<>(expenses));
        expenses.forEach(expense -> expense.setGroupEntity(group));
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

    private void mockCurrentUser(AppUserEntity user) {
        when(authService.getCurrentUser()).thenReturn(new org.springframework.security.core.userdetails.User(user.getLogin(), "", List.of()));
        when(appUserRepository.findByLogin(user.getLogin())).thenReturn(Optional.of(user));
    }
}
