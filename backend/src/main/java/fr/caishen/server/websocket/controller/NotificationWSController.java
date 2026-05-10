package fr.caishen.server.websocket.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class NotificationWSController {
    private final SimpMessagingTemplate messagingTemplate;

    @GetMapping("/api/notify")
    public ResponseEntity<Void> sendNotification() {
        messagingTemplate.convertAndSend("/topic/notifications", "Bonjour depuis Spring !");
        return ResponseEntity.ok().build();
    }
}
