package fr.caishen.server.domain.services;

import fr.caishen.server.dal.entity.AppUserEntity;
import fr.caishen.server.dal.entity.PushSubscriptionEntity;
import fr.caishen.server.dal.repository.AppUserRepository;
import fr.caishen.server.dal.repository.PushSubscriptionRepository;
import fr.caishen.server.web.dto.PushPublicKeyResponse;
import fr.caishen.server.web.dto.PushSubscriptionRequest;
import fr.caishen.server.web.dto.PushUnsubscribeRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nl.martijndwars.webpush.Notification;
import nl.martijndwars.webpush.PushService;
import org.bouncycastle.jce.ECNamedCurveTable;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.bouncycastle.jce.spec.ECNamedCurveParameterSpec;
import org.bouncycastle.jce.spec.ECPublicKeySpec;
import org.bouncycastle.math.ec.ECPoint;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.KeyFactory;
import java.security.PublicKey;
import java.security.Security;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class PushNotificationService {
    private final PushSubscriptionRepository pushSubscriptionRepository;
    private final AppUserRepository appUserRepository;
    private final AuthService authService;

    @Value("${push.vapid.public-key:}")
    private String vapidPublicKey;

    @Value("${push.vapid.private-key:}")
    private String vapidPrivateKey;

    @Value("${push.vapid.subject:mailto:caishen@laurent-chen.fr}")
    private String vapidSubject;

    public PushPublicKeyResponse getPublicKey() {
        return new PushPublicKeyResponse(isConfigured(), vapidPublicKey);
    }

    public void subscribe(PushSubscriptionRequest request) {
        AppUserEntity currentUser = getCurrentAppUser();
        PushSubscriptionEntity subscription = pushSubscriptionRepository.findByEndpoint(request.endpoint())
                .orElseGet(PushSubscriptionEntity::new);
        LocalDateTime now = LocalDateTime.now();

        if (subscription.getCreatedAt() == null) {
            subscription.setCreatedAt(now);
        }
        subscription.setUserId(currentUser.getId());
        subscription.setEndpoint(request.endpoint());
        subscription.setP256dh(request.p256dh());
        subscription.setAuth(request.auth());
        subscription.setEnabled(true);
        subscription.setUpdatedAt(now);
        pushSubscriptionRepository.save(subscription);
        log.info("Push subscription registered for user {}", currentUser.getId());
    }

    public void unsubscribe(PushUnsubscribeRequest request) {
        pushSubscriptionRepository.findByEndpoint(request.endpoint()).ifPresent(subscription -> {
            subscription.setEnabled(false);
            subscription.setUpdatedAt(LocalDateTime.now());
            pushSubscriptionRepository.save(subscription);
        });
    }

    public void notifyUsers(List<AppUserEntity> users, String title, String body, String url) {
        if (!isConfigured() || users.isEmpty()) {
            log.info("Push notification skipped: configured={}, userCount={}", isConfigured(), users.size());
            return;
        }

        List<Long> userIds = users.stream().map(AppUserEntity::getId).toList();
        List<PushSubscriptionEntity> subscriptions = pushSubscriptionRepository.findByUserIdInAndEnabledTrue(userIds);
        log.info("Sending push notification '{}' to {} subscription(s)", title, subscriptions.size());
        subscriptions.forEach(subscription -> send(subscription, title, body, url));
    }

    public void sendTestToCurrentUser() {
        AppUserEntity currentUser = getCurrentAppUser();
        notifyUsers(
                List.of(currentUser),
                "Caishen",
                "Notification de test",
                "/settings"
        );
    }

    private void send(PushSubscriptionEntity subscription, String title, String body, String url) {
        try {
            ensureBouncyCastleProvider();
            PushService pushService = new PushService(vapidPublicKey, vapidPrivateKey, vapidSubject);
            String payload = """
                    {
                      "notification": {
                        "title": "%s",
                        "body": "%s",
                        "icon": "/icons/pwa/icon-192.png",
                        "badge": "/icons/pwa/icon-96.png",
                        "data": {
                          "onActionClick": {
                            "default": {
                              "operation": "openWindow",
                              "url": "%s"
                            }
                          }
                        }
                      }
                    }
                    """.formatted(escapeJson(title), escapeJson(body), escapeJson(url));
            Notification notification = new Notification(
                    subscription.getEndpoint(),
                    getUserPublicKey(subscription.getP256dh()),
                    decodeBase64Url(subscription.getAuth()),
                    payload.getBytes(StandardCharsets.UTF_8)
            );
            pushService.send(notification);
        } catch (Exception e) {
            log.warn("Unable to send push notification to endpoint {}", subscription.getEndpoint(), e);
        }
    }

    private boolean isConfigured() {
        return !vapidPublicKey.isBlank() && !vapidPrivateKey.isBlank();
    }

    private AppUserEntity getCurrentAppUser() {
        return appUserRepository.findByLogin(authService.getCurrentUser().getUsername()).orElseThrow();
    }

    private PublicKey getUserPublicKey(String p256dh) throws Exception {
        byte[] key = decodeBase64Url(p256dh);
        KeyFactory keyFactory = KeyFactory.getInstance("ECDH", BouncyCastleProvider.PROVIDER_NAME);
        ECNamedCurveParameterSpec ecSpec = ECNamedCurveTable.getParameterSpec("secp256r1");
        ECPoint point = ecSpec.getCurve().decodePoint(key);
        ECPublicKeySpec pubSpec = new ECPublicKeySpec(point, ecSpec);
        return keyFactory.generatePublic(pubSpec);
    }

    private byte[] decodeBase64Url(String value) {
        String padded = value + "=".repeat((4 - value.length() % 4) % 4);
        return Base64.getUrlDecoder().decode(padded);
    }

    private void ensureBouncyCastleProvider() {
        if (Security.getProvider(BouncyCastleProvider.PROVIDER_NAME) == null) {
            Security.addProvider(new BouncyCastleProvider());
        }
    }

    private String escapeJson(String value) {
        return value
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r");
    }
}
