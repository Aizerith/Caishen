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
        List<Long> participantsIdList = getExpenseParticipants(expense);

        if (!Objects.equals(id, expense.getPayerId()) && !participantsIdList.contains(id)) {
            return BigDecimal.ZERO;
        }

        BigDecimal amount = expense.getAmount();
        BigDecimal participantsCount = BigDecimal.valueOf(participantsIdList.size());
        BigDecimal share = amount.divide(participantsCount, 2, RoundingMode.HALF_UP);

        if (Objects.equals(id, expense.getPayerId())) {
            return participantsIdList.contains(id) ? amount.subtract(share) : amount;
        } else {
            return share.negate();
        }
    }

    private List<Long> getExpenseParticipants(ExpenseEntity expense) {
        return Arrays.stream(expense.getParticipant().split(" "))
                .map(Long::parseLong)
                .collect(Collectors.toList());
    }

    public ExpenseInfoResponse getExpenseInfo(Long id) {
        ExpenseEntity expense = expenseRepository.findById(id).orElse(null);
        if (expense == null) {
            return null;
        }
        List<Long> participantsIdList = getExpenseParticipants(expense);
        List<AppUserEntity> participantList = appUserRepository.findAllById(participantsIdList);
        BigDecimal amount = expense.getAmount();
        BigDecimal participantsCount = BigDecimal.valueOf(participantsIdList.size());
        BigDecimal share = amount.divide(participantsCount, 2, RoundingMode.HALF_UP);

        return new ExpenseInfoResponse(
                expense.getId(),
                expense.getTitle(),
                expense.getAmount(),
                participantList
                        .stream()
                        .map(appUserEntity -> new ParticipantDTO(appUserEntity.getUsername(), share))
                        .collect(Collectors.toList()),
                Objects.requireNonNull(appUserRepository.findById(expense.getPayerId()).orElse(null)).getUsername(),
                expense.getExpenseDate()
        );
    }
}
