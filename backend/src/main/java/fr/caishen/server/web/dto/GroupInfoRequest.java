package fr.caishen.server.web.dto;

import java.util.List;

public record GroupInfoRequest(String title, List<Long> members) {
}
