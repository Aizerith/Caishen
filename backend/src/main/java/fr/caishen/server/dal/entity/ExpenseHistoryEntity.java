package fr.caishen.server.dal.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "expense_history")
public class ExpenseHistoryEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long groupId;

    private Long expenseId;

    private String expenseTitle;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private ExpenseHistoryAction action;

    @Column(nullable = false)
    private Long actorId;

    @Column(nullable = false)
    private String actorName;

    private BigDecimal amount;

    @Column(name = "changes_json", columnDefinition = "LONGTEXT")
    private String changesJson;

    @Column(nullable = false)
    private LocalDateTime createdAt;
}
