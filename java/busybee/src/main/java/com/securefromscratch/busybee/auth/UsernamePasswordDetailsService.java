package com.securefromscratch.busybee.auth;

import java.util.Optional;

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
        Optional<UserAccount> userAccount = m_usersStorage.findByUsername(username);
        if (userAccount.isEmpty())
            throw new UsernameNotFoundException(username);

        String[] arrRoles = new String[userAccount.get().getRoles().size()];

        // Map User entity to Spring Security's UserDetails
        return org.springframework.security.core.userdetails.User
                .withUsername(userAccount.get().getUsername())
                .password(userAccount.get().getHashedPassword()) // Hashed password
                .roles(userAccount.get().getRoles().toArray(arrRoles)) // Role(s) of the user
                .build();
    }

    public void createUser(String username, String password, String role) {
        m_usersStorage.createUser(username, password, role);
    }
}
