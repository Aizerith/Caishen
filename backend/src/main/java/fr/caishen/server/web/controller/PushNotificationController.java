package fr.caishen.server.web.controller;

import fr.caishen.server.domain.services.PushNotificationService;
import fr.caishen.server.web.dto.PushPublicKeyResponse;
import fr.caishen.server.web.dto.PushSubscriptionRequest;
import fr.caishen.server.web.dto.PushUnsubscribeRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/push")
public class PushNotificationController {
    private final PushNotificationService pushNotificationService;

    @GetMapping("/public-key")
    public PushPublicKeyResponse getPublicKey() {
        log.info("GET /push/public-key");
        return pushNotificationService.getPublicKey();
    }

    @PostMapping("/subscriptions")
    public ResponseEntity<Void> subscribe(@RequestBody PushSubscriptionRequest request) {
        log.info("POST /push/subscriptions");
        pushNotificationService.subscribe(request);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/subscriptions")
    public ResponseEntity<Void> unsubscribe(@RequestBody PushUnsubscribeRequest request) {
        log.info("DELETE /push/subscriptions");
        pushNotificationService.unsubscribe(request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/test")
    public ResponseEntity<Void> test() {
        log.info("POST /push/test");
        pushNotificationService.sendTestToCurrentUser();
        return ResponseEntity.ok().build();
    }
}
