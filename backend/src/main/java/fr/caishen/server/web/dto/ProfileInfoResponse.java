package fr.caishen.server.web.dto;

import java.util.List;

public record ProfileInfoResponse(Long id, String name, List<UserGroupResponse> userGroups) {
}
