package fr.caishen.server.dal.repository;

import fr.caishen.server.dal.entity.SettlementPaymentEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SettlementPaymentRepository extends JpaRepository<SettlementPaymentEntity, Long> {
    List<SettlementPaymentEntity> findByGroupId(Long groupId);
}
