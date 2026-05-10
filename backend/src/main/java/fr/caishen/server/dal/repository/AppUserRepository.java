package fr.caishen.server.dal.repository;

import fr.caishen.server.dal.entity.AppUserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AppUserRepository extends JpaRepository<AppUserEntity, Long> {
    Optional<AppUserEntity> findByLogin(String login);

    Optional<AppUserEntity> findByLoginOrUsername(String login, String username);
}
