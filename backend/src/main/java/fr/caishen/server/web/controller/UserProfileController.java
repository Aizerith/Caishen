package fr.caishen.server.web.controller;

import fr.caishen.server.domain.services.UserProfileService;
import fr.caishen.server.web.dto.ProfileInfoResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@RestController
@Slf4j
@RequiredArgsConstructor
@RequestMapping("/profile")
public class UserProfileController {
    private final UserProfileService userProfileService;

    @GetMapping("")
    public ProfileInfoResponse getProfileInfo() {
        log.info("GET /profile");

        return userProfileService.getProfileInfo();
    }
}
