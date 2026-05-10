package fr.caishen.server.web.controller;

import fr.caishen.server.domain.exception.UserAlreadyInGroupException;
import fr.caishen.server.domain.services.CaishenGroupService;
import fr.caishen.server.web.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

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

    @GetMapping("/expenses/{id}")
    public ExpenseInfoResponse getExpenseInfo(@PathVariable Long id) {
        log.info("GET /group/expenses/{}", id);
        return caishenGroupService.getExpenseInfo(id);
    }
}
