package fr.caishen.server.domain.services;

import fr.caishen.server.dal.entity.*;
import fr.caishen.server.dal.repository.AppUserRepository;
import fr.caishen.server.dal.repository.ExpenseHistoryRepository;
import fr.caishen.server.dal.repository.ExpenseRepository;
import fr.caishen.server.dal.repository.GroupRepository;
import fr.caishen.server.domain.exception.GroupAccessDeniedException;
import fr.caishen.server.domain.exception.UserAlreadyInGroupException;
import fr.caishen.server.web.dto.*;
import fr.caishen.server.websocket.service.WebSocketService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CaishenGroupService {
    private final AppUserRepository appUserRepository;
    private final GroupRepository groupRepository;
    private final AuthService authService;
    private final ExpenseRepository expenseRepository;
    private final ExpenseHistoryRepository expenseHistoryRepository;
    private final WebSocketService webSocketService;
    private final PushNotificationService pushNotificationService;

    private record ParticipantShare(Long participantId, BigDecimal amount) {
    }

    public UserGroupResponse createGroup(String title, List<Long> members) {
        GroupEntity group = new GroupEntity();
        group.setTitle(title);
        group.setGroupAppUserEntityList(appUserRepository.findAllById(members));
        group.setUuid(UUID.randomUUID().toString());
        group = groupRepository.save(group);
        return new UserGroupResponse(group.getTitle(), group.getId());
    }

    public GroupResponse getGroupInfo(Long id) {
        GroupEntity group = groupRepository.findById(id).orElse(null);
        if (group == null) {
            return null;
        }
        requireCurrentUserMemberOf(group);
        return getGroupResponse(group);
    }

    public UserGroupResponse addUserToGroup(String uuid) throws UserAlreadyInGroupException {
        GroupEntity group = groupRepository.findByUuid(uuid).orElse(null);
        if (group == null) {
            return null;
        }
        AppUserEntity appUser = appUserRepository.findByLogin(authService.getCurrentUser().getUsername()).orElseThrow();
        if (group.getGroupAppUserEntityList().contains(appUser)) {
            throw new UserAlreadyInGroupException("appUser with id: " + appUser.getId() + " already in group with id " + group.getId());
        }
        group.getGroupAppUserEntityList().add(appUser);
        group = groupRepository.save(group);
        recordMemberJoinedHistory(group, appUser);
        notifyGroupMembers(group);
        pushNotificationService.notifyUsers(
                group.getGroupAppUserEntityList(),
                "Caishen",
                appUser.getUsername() + " a rejoint le groupe " + group.getTitle(),
                "/group/" + group.getId()
        );
        return new UserGroupResponse(
                group.getTitle(),
                group.getId()
        );
    }

    @Transactional
    public GroupResponse createExpense(ExpenseRequest data) {
        if (data.participant().isEmpty()) {
            return null;
        }
        GroupEntity group = groupRepository.findById(data.groupId()).orElse(null);
        if (group == null) {
            return null;
        }
        AppUserEntity currentUser = requireCurrentUserMemberOf(group);
        validateExpenseMembers(group, data);

        ExpenseEntity expense = new ExpenseEntity();
        expense.setTitle(data.title());
        expense.setAmount(data.amount());
        expense.setPayerId(data.payerId());
        expense.setExpenseDate(data.expenseDate());
        expense.setParticipant(data.participant().trim());
        expense.setGroupEntity(group);
        expense.setExpenseDate(expense.getExpenseDate());

        expense = expenseRepository.save(expense);
        recordExpenseHistory(expense, ExpenseHistoryAction.CREATED, currentUser);
        notifyGroupMembers(group);
        notifyExpenseChanged(group, currentUser, "Dépense ajoutée", expense);
        return getGroupResponse(group);
    }

    @Transactional
    public GroupResponse updateExpense(Long id, ExpenseRequest data) {
        if (data.participant().isEmpty()) {
            return null;
        }
        ExpenseEntity expense = expenseRepository.findById(id).orElse(null);
        if (expense == null) {
            return null;
        }

        GroupEntity group = expense.getGroupEntity();
        AppUserEntity currentUser = requireCurrentUserMemberOf(group);
        validateExpenseMembers(group, data);
        expense.setTitle(data.title());
        expense.setAmount(data.amount());
        expense.setPayerId(data.payerId());
        expense.setExpenseDate(data.expenseDate());
        expense.setParticipant(data.participant().trim());

        expenseRepository.save(expense);
        recordExpenseHistory(expense, ExpenseHistoryAction.UPDATED, currentUser);
        notifyGroupMembers(group);
        notifyExpenseChanged(group, currentUser, "Dépense modifiée", expense);
        return getGroupResponse(group);
    }

    @Transactional
    public GroupResponse deleteExpense(Long id) {
        ExpenseEntity expense = expenseRepository.findById(id).orElse(null);
        if (expense == null) {
            return null;
        }

        GroupEntity group = expense.getGroupEntity();
        AppUserEntity currentUser = requireCurrentUserMemberOf(group);
        recordExpenseHistory(expense, ExpenseHistoryAction.DELETED, currentUser);
        group.getGroupExpenseEntityList().removeIf(groupExpense -> Objects.equals(groupExpense.getId(), id));
        expenseRepository.delete(expense);
        notifyGroupMembers(group);
        notifyExpenseChanged(group, currentUser, "Dépense supprimée", expense, "/group/" + group.getId());
        return getGroupResponse(group);
    }

    private void notifyGroupMembers(GroupEntity group) {
        group.getGroupAppUserEntityList().forEach(appUserEntity -> webSocketService.sendNotificationToUser(appUserEntity.getLogin(), group.getId()));
    }

    private void notifyExpenseChanged(GroupEntity group, AppUserEntity actor, String title, ExpenseEntity expense) {
        notifyExpenseChanged(group, actor, title, expense, "/group/" + group.getId() + "/expense/" + expense.getId());
    }

    private void notifyExpenseChanged(GroupEntity group, AppUserEntity actor, String title, ExpenseEntity expense, String url) {
        pushNotificationService.notifyUsers(
                group.getGroupAppUserEntityList(),
                title,
                actor.getUsername() + " - " + expense.getTitle() + " (" + normalizeMoney(expense.getAmount()) + " €)",
                url
        );
    }

    private GroupResponse getGroupResponse(GroupEntity group) {
        return new GroupResponse(
                group.getId(),
                group.getUuid(),
                group.getTitle(),
                group.getGroupAppUserEntityList()
                        .stream()
                        .map(appUserEntity -> new GroupMemberResponse(appUserEntity.getId(), appUserEntity.getUsername(), getMemberExpensesDelta(appUserEntity.getId(), group.getGroupExpenseEntityList())))
                        .collect(Collectors.toList()),
                group.getGroupExpenseEntityList()
                        .stream()
                        .sorted(Comparator.comparing(ExpenseEntity::getExpenseDate).reversed())
                        .map(expenseEntity -> new ExpenseResponse(
                                expenseEntity.getId(),
                                expenseEntity.getTitle(),
                                expenseEntity.getAmount(),
                                expenseEntity.getParticipant(),
                                Objects.requireNonNull(appUserRepository.findById(expenseEntity.getPayerId()).orElse(null)).getUsername(),
                                expenseEntity.getExpenseDate()))
                        .toList()
        );
    }

    private BigDecimal getMemberExpensesDelta(Long id, List<ExpenseEntity> expenseList) {
        return expenseList.stream()
                .map(expense -> getMember1ExpenseDelta(id, expense))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal getMember1ExpenseDelta(Long id, ExpenseEntity expense) {
        List<ParticipantShare> participantShares = getExpenseParticipantShares(expense);

        BigDecimal participantShare = participantShares.stream()
                .filter(share -> Objects.equals(share.participantId(), id))
                .map(ParticipantShare::amount)
                .findFirst()
                .orElse(BigDecimal.ZERO.setScale(2, RoundingMode.UNNECESSARY));

        if (!Objects.equals(id, expense.getPayerId()) && participantShare.signum() == 0) {
            return BigDecimal.ZERO;
        }

        BigDecimal amount = normalizeMoney(expense.getAmount());

        if (Objects.equals(id, expense.getPayerId())) {
            return amount.subtract(participantShare);
        } else {
            return participantShare.negate();
        }
    }

    private List<Long> getExpenseParticipants(ExpenseEntity expense) {
        return Arrays.stream(expense.getParticipant().split(" "))
                .map(Long::parseLong)
                .collect(Collectors.toList());
    }

    private List<ParticipantShare> getExpenseParticipantShares(ExpenseEntity expense) {
        List<Long> participantsIdList = getExpenseParticipants(expense);
        long amountInCents = normalizeMoney(expense.getAmount()).movePointRight(2).longValueExact();
        long baseShareInCents = amountInCents / participantsIdList.size();
        long remainderInCents = amountInCents % participantsIdList.size();
        int extraCentOffset = expense.getId() == null ? 0 : Math.floorMod(expense.getId().intValue(), participantsIdList.size());

        List<ParticipantShare> shares = new ArrayList<>();
        for (int index = 0; index < participantsIdList.size(); index++) {
            boolean receivesExtraCent = Math.floorMod(index - extraCentOffset, participantsIdList.size()) < remainderInCents;
            long shareInCents = baseShareInCents + (receivesExtraCent ? 1 : 0);
            shares.add(new ParticipantShare(participantsIdList.get(index), BigDecimal.valueOf(shareInCents, 2)));
        }
        return shares;
    }

    private BigDecimal normalizeMoney(BigDecimal amount) {
        return amount.setScale(2, RoundingMode.HALF_UP);
    }

    public ExpenseInfoResponse getExpenseInfo(Long id) {
        ExpenseEntity expense = expenseRepository.findById(id).orElse(null);
        if (expense == null) {
            return null;
        }
        requireCurrentUserMemberOf(expense.getGroupEntity());
        List<ParticipantShare> participantShares = getExpenseParticipantShares(expense);
        List<Long> participantsIdList = participantShares.stream()
                .map(ParticipantShare::participantId)
                .toList();
        List<AppUserEntity> participantList = appUserRepository.findAllById(participantsIdList);
        Map<Long, AppUserEntity> participantsById = participantList.stream()
                .collect(Collectors.toMap(AppUserEntity::getId, participant -> participant));

        return new ExpenseInfoResponse(
                expense.getId(),
                expense.getTitle(),
                expense.getAmount(),
                participantShares
                        .stream()
                        .map(share -> {
                            AppUserEntity participant = participantsById.get(share.participantId());
                            return new ParticipantDTO(participant.getUsername(), share.amount());
                        })
                        .collect(Collectors.toList()),
                Objects.requireNonNull(appUserRepository.findById(expense.getPayerId()).orElse(null)).getUsername(),
                expense.getExpenseDate()
        );
    }

    public List<ExpenseHistoryResponse> getGroupExpenseHistory(Long groupId) {
        GroupEntity group = groupRepository.findById(groupId).orElse(null);
        if (group == null) {
            return List.of();
        }
        requireCurrentUserMemberOf(group);
        return expenseHistoryRepository.findByGroupIdOrderByCreatedAtDesc(groupId)
                .stream()
                .map(this::toExpenseHistoryResponse)
                .toList();
    }

    public List<ExpenseHistoryResponse> getExpenseHistory(Long expenseId) {
        ExpenseEntity expense = expenseRepository.findById(expenseId).orElse(null);
        if (expense == null) {
            return List.of();
        }
        requireCurrentUserMemberOf(expense.getGroupEntity());
        return expenseHistoryRepository.findByExpenseIdOrderByCreatedAtDesc(expenseId)
                .stream()
                .map(this::toExpenseHistoryResponse)
                .toList();
    }

    private AppUserEntity getCurrentAppUser() {
        return appUserRepository.findByLogin(authService.getCurrentUser().getUsername()).orElseThrow();
    }

    private AppUserEntity requireCurrentUserMemberOf(GroupEntity group) {
        AppUserEntity currentUser = getCurrentAppUser();
        boolean isMember = group.getGroupAppUserEntityList().stream()
                .anyMatch(member -> Objects.equals(member.getId(), currentUser.getId()));
        if (!isMember) {
            throw new GroupAccessDeniedException();
        }
        return currentUser;
    }

    private void validateExpenseMembers(GroupEntity group, ExpenseRequest data) {
        Set<Long> groupMemberIds = group.getGroupAppUserEntityList().stream()
                .map(AppUserEntity::getId)
                .collect(Collectors.toSet());
        Set<Long> participantIds = Arrays.stream(data.participant().trim().split(" "))
                .filter(participant -> !participant.isBlank())
                .map(Long::parseLong)
                .collect(Collectors.toSet());
        if (!groupMemberIds.contains(data.payerId()) || !groupMemberIds.containsAll(participantIds)) {
            throw new GroupAccessDeniedException();
        }
    }

    private void recordExpenseHistory(ExpenseEntity expense, ExpenseHistoryAction action, AppUserEntity actor) {
        ExpenseHistoryEntity history = new ExpenseHistoryEntity();
        history.setGroupId(expense.getGroupEntity().getId());
        history.setExpenseId(expense.getId());
        history.setExpenseTitle(expense.getTitle());
        history.setAction(action);
        history.setActorId(actor.getId());
        history.setActorName(actor.getUsername());
        history.setAmount(normalizeMoney(expense.getAmount()));
        history.setCreatedAt(java.time.LocalDateTime.now());
        expenseHistoryRepository.save(history);
    }

    private void recordMemberJoinedHistory(GroupEntity group, AppUserEntity actor) {
        ExpenseHistoryEntity history = new ExpenseHistoryEntity();
        history.setGroupId(group.getId());
        history.setAction(ExpenseHistoryAction.MEMBER_JOINED);
        history.setActorId(actor.getId());
        history.setActorName(actor.getUsername());
        history.setCreatedAt(java.time.LocalDateTime.now());
        expenseHistoryRepository.save(history);
    }

    private ExpenseHistoryResponse toExpenseHistoryResponse(ExpenseHistoryEntity history) {
        return new ExpenseHistoryResponse(
                history.getId(),
                history.getGroupId(),
                history.getExpenseId(),
                history.getExpenseTitle(),
                history.getAction(),
                history.getActorId(),
                history.getActorName(),
                history.getAmount(),
                history.getCreatedAt()
        );
    }
}
