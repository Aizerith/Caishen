package fr.caishen.server.dal.repository;

import fr.caishen.server.dal.entity.PushSubscriptionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PushSubscriptionRepository extends JpaRepository<PushSubscriptionEntity, Long> {
    List<PushSubscriptionEntity> findByUserIdInAndEnabledTrue(List<Long> userIds);

    Optional<PushSubscriptionEntity> findByEndpoint(String endpoint);
}
