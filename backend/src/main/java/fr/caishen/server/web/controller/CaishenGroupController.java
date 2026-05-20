package fr.caishen.server.web.controller;

import fr.caishen.server.domain.exception.UserAlreadyInGroupException;
import fr.caishen.server.domain.services.CaishenGroupService;
import fr.caishen.server.web.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@Slf4j
@RequiredArgsConstructor
@RequestMapping("/group")
public class CaishenGroupController {
    private final CaishenGroupService caishenGroupService;

    @PostMapping("/new")
    public UserGroupResponse createGroup(@RequestBody GroupInfoRequest data) {
        log.info("POST /group/new");
        return caishenGroupService.createGroup(data.title(), data.members());
    }

    @GetMapping("")
    public GroupResponse getGroupInfo(@RequestParam Long id) {
        log.info("GET /group");
        return caishenGroupService.getGroupInfo(id);
    }

    @PostMapping("/join/{uuid}")
    public UserGroupResponse createGroup(@PathVariable String uuid) throws UserAlreadyInGroupException {
        log.info("POST /group/join/{}", uuid);
        return caishenGroupService.addUserToGroup(uuid);
    }

    @PostMapping("/expenses")
    public GroupResponse createExpense(@RequestBody ExpenseRequest data) {
        log.info("POST /group/expenses");
        return caishenGroupService.createExpense(data);
    }

    @PutMapping("/expenses/{id}")
    public GroupResponse updateExpense(@PathVariable Long id, @RequestBody ExpenseRequest data) {
        log.info("PUT /group/expenses/{}", id);
        return caishenGroupService.updateExpense(id, data);
    }

    @DeleteMapping("/expenses/{id}")
    public GroupResponse deleteExpense(@PathVariable Long id) {
        log.info("DELETE /group/expenses/{}", id);
        return caishenGroupService.deleteExpense(id);
    }

    @PostMapping("/settlements/pay")
    public GroupResponse paySettlement(@RequestBody SettlementPaymentRequest data) {
        log.info("POST /group/settlements/pay");
        return caishenGroupService.paySettlement(data);
    }

    @DeleteMapping("/settlements/payments/{id}")
    public GroupResponse cancelSettlementPayment(@PathVariable Long id) {
        log.info("DELETE /group/settlements/payments/{}", id);
        return caishenGroupService.cancelSettlementPayment(id);
    }

    @GetMapping("/expenses/{id}")
    public ExpenseInfoResponse getExpenseInfo(@PathVariable Long id) {
        log.info("GET /group/expenses/{}", id);
        return caishenGroupService.getExpenseInfo(id);
    }

    @GetMapping("/{id}/expenses/history")
    public List<ExpenseHistoryResponse> getGroupExpenseHistory(@PathVariable Long id) {
        log.info("GET /group/{}/expenses/history", id);
        return caishenGroupService.getGroupExpenseHistory(id);
    }

    @GetMapping("/activity")
    public List<GroupActivityResponse> getCurrentUserGroupActivity() {
        log.info("GET /group/activity");
        return caishenGroupService.getCurrentUserGroupActivity();
    }

    @GetMapping("/expenses/{id}/history")
    public List<ExpenseHistoryResponse> getExpenseHistory(@PathVariable Long id) {
        log.info("GET /group/expenses/{}/history", id);
        return caishenGroupService.getExpenseHistory(id);
    }
}
