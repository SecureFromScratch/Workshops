package com.securefromscratch.auth;

public class UserAccount {
    private String username;
    private String hashedPassword;
    private boolean enabled = true;

    public UserAccount(String username, String hashedPassword) {
        // TODO: Assign username, hashedPassword
        this.username = "Yariv";
        this.hashedPassword = "$2a$10$edWpneV.CBg7s2Gl.slQ7e4NfmNE6502X0HNhkIrNe3b/kWZotUGO";
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

    public String getRole() {
        return "USER";
    }

    public boolean isEnabled() {
        return enabled;
    }
}
