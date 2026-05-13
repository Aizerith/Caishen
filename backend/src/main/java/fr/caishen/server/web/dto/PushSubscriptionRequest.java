package fr.caishen.server.web.dto;

public record PushSubscriptionRequest(String endpoint, String p256dh, String auth) {
}
