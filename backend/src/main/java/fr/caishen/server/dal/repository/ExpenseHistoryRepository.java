package fr.caishen.server.dal.repository;

import fr.caishen.server.dal.entity.ExpenseHistoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExpenseHistoryRepository extends JpaRepository<ExpenseHistoryEntity, Long> {
    List<ExpenseHistoryEntity> findByGroupIdOrderByCreatedAtDesc(Long groupId);

    List<ExpenseHistoryEntity> findByExpenseIdOrderByCreatedAtDesc(Long expenseId);
}
