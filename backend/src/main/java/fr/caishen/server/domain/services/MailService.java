package fr.caishen.server.domain.services;

import fr.caishen.server.dal.entity.AppUserEntity;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.util.UriComponentsBuilder;

@Slf4j
@Service
@RequiredArgsConstructor
public class MailService {
    private final ObjectProvider<JavaMailSender> javaMailSenderProvider;

    @Value("${mail.enabled:false}")
    private boolean mailEnabled;

    @Value("${mail.from:}")
    private String mailFrom;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Value("${url.frontend}")
    private String frontendUrl;

    public void sendAccountActivationEmail(AppUserEntity user) {
        String activationUrl = buildFrontendUrl("/activate-account", "token", user.getActivationLink());
        send(
                user.getLogin(),
                "Activez votre compte Caishen",
                """
                        Bonjour %s,

                        Pour activer votre compte Caishen, cliquez sur le lien suivant :
                        %s

                        Ce lien expire dans 24 heures.
                        """.formatted(user.getUsername(), activationUrl));
    }

    public void sendPasswordResetEmail(AppUserEntity user) {
        String resetUrl = buildFrontendUrl("/reset-password", "token", user.getPasswordResetToken());
        send(
                user.getLogin(),
                "Reinitialisation de votre mot de passe Caishen",
                """
                        Bonjour %s,

                        Pour modifier votre mot de passe Caishen, cliquez sur le lien suivant :
                        %s

                        Ce lien expire dans 1 heure.
                        """.formatted(user.getUsername(), resetUrl));
    }

    private void send(String to, String subject, String body) {
        if (!mailEnabled) {
            log.info("Mail disabled. Would send '{}' to {} with body: {}", subject, to, body);
            return;
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(resolveSender());
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        JavaMailSender javaMailSender = javaMailSenderProvider.getIfAvailable();
        if (javaMailSender == null) {
            throw new IllegalStateException("JavaMailSender must be configured when mail.enabled=true");
        }
        javaMailSender.send(message);
    }

    private String resolveSender() {
        if (StringUtils.hasText(mailFrom)) {
            return mailFrom;
        }
        if (StringUtils.hasText(mailUsername)) {
            return mailUsername;
        }
        throw new IllegalStateException("MAIL_FROM or MAIL_USERNAME must be configured when mail.enabled=true");
    }

    private String buildFrontendUrl(String path, String queryParam, String value) {
        return UriComponentsBuilder.fromUriString(frontendUrl)
                .path(path)
                .queryParam(queryParam, value)
                .build()
                .toUriString();
    }
}
