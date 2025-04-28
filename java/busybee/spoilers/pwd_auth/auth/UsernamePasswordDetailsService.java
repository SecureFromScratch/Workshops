package com.securefromscratch.busybee.auth;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class UsernamePasswordDetailsService implements UserDetailsService {
    private final UsersStorage m_usersStorage;

    public UsernamePasswordDetailsService(UsersStorage usersStorage) {
        this.m_usersStorage = usersStorage;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // TODO: Fetch user from storage, map details to Spring Security's user

        // Map User entity to Spring Security's UserDetails
        return org.springframework.security.core.userdetails.User
                .withUsername("Yariv")
                .password("$2a$10$edWpneV.CBg7s2Gl.slQ7e4NfmNE6502X0HNhkIrNe3b/kWZotUGO") // Encrypted password
                .roles("USER") // Role(s) of the user
                .build();
    }

    public void createUser(String username, String password) {
        m_usersStorage.createUser(username, password);
    }
}
