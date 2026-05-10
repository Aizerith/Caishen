package fr.caishen.server.dal.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Data
@Entity
@Table(name = "caishen_group")
public class GroupEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String uuid;

    @ManyToMany
    @JoinTable(name = "app_user_group",
            joinColumns = @JoinColumn(name = "group_id"),
            inverseJoinColumns = @JoinColumn(name = "app_user_id"))
    private List<AppUserEntity> groupAppUserEntityList;

    @OneToMany(mappedBy = "groupEntity")
    private List<ExpenseEntity> groupExpenseEntityList;
}
