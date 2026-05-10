package fr.caishen.server.dal.repository;

import fr.caishen.server.dal.entity.AppUserEntity;
import fr.caishen.server.dal.entity.GroupEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GroupRepository extends JpaRepository<GroupEntity, Long> {
    List<GroupEntity> findAllByGroupAppUserEntityListContaining(AppUserEntity appUser);

    Optional<GroupEntity> findByUuid(String uuid);
}
