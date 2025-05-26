package com.securefromscratch.busybee.auth;

import java.util.ArrayList;
import java.util.List;

public class UserAccount {
    private String username;
    private String hashedPassword;
    private boolean enabled = true;
    private List<String> roles = new ArrayList<String>();

    public UserAccount(String username, String hashedPassword, String role) {
        this.username = username;
        this.hashedPassword = hashedPassword;
        this.roles.add(role);
    }

    public UserAccount(String username, String hashedPassword, List<String> roles) {
        // TODO: Assign username, hashedPassword
        this.username = username;
        this.hashedPassword = hashedPassword;
        this.roles = roles;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getHashedPassword() {
        return hashedPassword;
    }

    public void setHashedPassword(String hashedPassword) {
        this.hashedPassword = hashedPassword;
    }

    public List<String> getRoles() {
        return roles;
    }

    public boolean isEnabled() {
        return enabled;
    }
}
