package fr.caishen.server.dal.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Entity
@Table(name = "app_user")
public class AppUserEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(unique = true, nullable = false)
    private String login;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private LocalDateTime dateOfRegistration;

    private LocalDateTime deletedAt;

    private String activationLink;

    private LocalDateTime activationTokenExpiresAt;

    private Boolean isActivated;

    private String passwordResetToken;

    private LocalDateTime passwordResetTokenExpiresAt;

    @ManyToMany(mappedBy = "groupAppUserEntityList")
    private List<GroupEntity> userGroupEntityList;
}
