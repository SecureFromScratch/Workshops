package com.securefromscratch.busybee.auth;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;
import java.util.List;

@Component
@Configuration
public class UsersPrePopulate {

    private static final int PASSWORD_LENGTH = 12;
    private static final String CHAR_POOL = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";

    @Bean
    CommandLineRunner createUsers(UsersStorage usersStorage, PasswordEncoder passwordEncoder) {
        return args -> {
            List<String> usernames = List.of("Yariv", "Or", "Dana", "Avi");
            // ADMIN, CREATOR, TRIAL
            List<String> roles = List.of("ADMIN", "CREATOR", "TRIAL", "TRIAL");

            //for (String username : usernames) {
            for (int i=0;i<usernames.size(); i++) {
                String plainPassword = generatePassword();
                String encodedPassword = passwordEncoder.encode(plainPassword);

                String username = usernames.get(i);
                String role = roles.get(i);
                UserAccount newAccount = usersStorage.createUser(username, encodedPassword, role);

                System.out.println("User created: " + newAccount.getUsername());
                System.out.println("******** Password: " + plainPassword);
                System.out.println("Hashed Password: " + newAccount.getHashedPassword());
                System.out.println("------------------------");
            }
        };
    }

    private String generatePassword() {
        SecureRandom random = new SecureRandom();
        StringBuilder password = new StringBuilder(PASSWORD_LENGTH);
        for (int i = 0; i < PASSWORD_LENGTH; i++) {
            password.append(CHAR_POOL.charAt(random.nextInt(CHAR_POOL.length())));
        }
        return password.toString();
    }
}

