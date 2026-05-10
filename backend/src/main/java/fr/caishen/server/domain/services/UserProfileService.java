package fr.caishen.server.domain.services;

import fr.caishen.server.dal.entity.AppUserEntity;
import fr.caishen.server.dal.entity.GroupEntity;
import fr.caishen.server.dal.repository.AppUserRepository;
import fr.caishen.server.dal.repository.GroupRepository;
import fr.caishen.server.web.dto.ProfileInfoResponse;
import fr.caishen.server.web.dto.UserGroupResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserProfileService {

    private final AuthService authService;
    private final AppUserRepository appUserRepository;
    private final GroupRepository groupRepository;

    public ProfileInfoResponse getProfileInfo() {
        AppUserEntity appUser = appUserRepository.findByLogin(authService.getCurrentUser().getUsername()).orElseThrow();
        List<GroupEntity> userGroups = groupRepository.findAllByGroupAppUserEntityListContaining(appUser);
        return new ProfileInfoResponse(
                appUser.getId(),
                appUser.getUsername(),
                userGroups.stream()
                        .map(groupEntity -> new UserGroupResponse(groupEntity.getTitle(), groupEntity.getId()))
                        .collect(Collectors.toList()));
    }
}
