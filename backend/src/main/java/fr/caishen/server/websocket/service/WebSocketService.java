package fr.caishen.server.websocket.service;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class WebSocketService {

    private final SimpMessagingTemplate template;

    public void sendNotificationToUser(String username, Long id) {
        template.convertAndSendToUser(username, "/queue/notifications", id);
    }
}
