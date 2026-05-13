package fr.caishen.server.domain.services;

import fr.caishen.server.dal.entity.AppUserEntity;
import fr.caishen.server.dal.entity.ExpenseEntity;
import fr.caishen.server.dal.entity.GroupEntity;
import fr.caishen.server.dal.repository.AppUserRepository;
import fr.caishen.server.dal.repository.ExpenseRepository;
import fr.caishen.server.dal.repository.GroupRepository;
import fr.caishen.server.domain.exception.UserAlreadyInGroupException;
import fr.caishen.server.web.dto.*;
import fr.caishen.server.websocket.service.WebSocketService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

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
    private final WebSocketService webSocketService;

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
        GroupEntity finalGroup = group;
        group.getGroupAppUserEntityList().forEach(appUserEntity -> webSocketService.sendNotificationToUser(appUserEntity.getLogin(), finalGroup.getId()));
        return new UserGroupResponse(
                group.getTitle(),
                group.getId()
        );
    }

    public GroupResponse createExpense(ExpenseRequest data) {
        if (data.participant().isEmpty()) {
            return null;
        }
        GroupEntity group = groupRepository.findById(data.groupId()).orElse(null);
        if (group == null) {
            return null;
        }

        ExpenseEntity expense = new ExpenseEntity();
        expense.setTitle(data.title());
        expense.setAmount(data.amount());
        expense.setPayerId(data.payerId());
        expense.setExpenseDate(data.expenseDate());
        expense.setParticipant(data.participant().trim());
        expense.setGroupEntity(group);
        expense.setExpenseDate(expense.getExpenseDate());

        expenseRepository.save(expense);
        group.getGroupAppUserEntityList().forEach(appUserEntity -> webSocketService.sendNotificationToUser(appUserEntity.getLogin(), group.getId()));
        return getGroupResponse(group);
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
}
