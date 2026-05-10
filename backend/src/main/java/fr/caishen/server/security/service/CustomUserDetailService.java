package fr.caishen.server.security.service;

import fr.caishen.server.dal.entity.AppUserEntity;
import fr.caishen.server.dal.repository.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class CustomUserDetailService implements UserDetailsService {

    private final AppUserRepository appUserRepository;

    @Override
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
        AppUserEntity appUser = appUserRepository.findByLoginOrUsername(identifier, identifier)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + identifier));
        return new User(appUser.getLogin(), appUser.getPassword(), new ArrayList<>());
    }
}
