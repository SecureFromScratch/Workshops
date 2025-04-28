package com.securefromscratch.busybee.auth;

import org.springframework.stereotype.Service;

import javax.swing.text.html.Option;
import java.util.*;

@Service
public class UsersStorage {
    private final Map<String, UserAccount> m_users = new HashMap<>();

    public Optional<UserAccount> findByUsername(String username) {
        return Optional.ofNullable(m_users.get(username));
    }

    public UserAccount createUser(String username, String password) {
        UserAccount newAccount = new UserAccount(username, password);
        // TODO: Add user to map

        return newAccount;
    }
}
