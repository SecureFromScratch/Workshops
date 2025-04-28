package com.securefromscratch.busybee.auth;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.UUID;

@Component
public class UsersPrePopulate {
    @Bean
    CommandLineRunner createUser(UsersStorage usersStorage, PasswordEncoder passwordEncoder) {
        return args -> {
            String username = "Yariv";
            // TODO: The password MUST NOT be left empty!
            String plainPassword = "";
            // TODO: encode the password
            String encodedPassword = "";

            UserAccount newAccount = usersStorage.createUser(username, encodedPassword);

            System.out.print("User created: ");
            System.out.println(newAccount.getUsername());
            System.out.println("******** Password: ");
            System.out.println(plainPassword);
            System.out.println("Hashed Password: ");
            System.out.println(newAccount.getHashedPassword());
        };
    }
}
