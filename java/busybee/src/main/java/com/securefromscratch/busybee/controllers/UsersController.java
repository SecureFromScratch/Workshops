package com.securefromscratch.busybee.controllers;


import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import com.securefromscratch.busybee.auth.UsernamePasswordDetailsService;

/*/
@Controller
public class UsersController {
    private final UsernamePasswordDetailsService usernamePasswordDetailsService;
    private final PasswordEncoder passwordEncoder;
    private final CookieCsrfTokenRepository csrfTokenRepository = CookieCsrfTokenRepository.withHttpOnlyFalse();

    public UsersController(UsernamePasswordDetailsService usernamePasswordDetailsService, PasswordEncoder passwordEncoder) {
        this.usernamePasswordDetailsService = usernamePasswordDetailsService;
        this.passwordEncoder = passwordEncoder;
    }

    public record NewUserCreationFields(@NotNull String username, @NotNull String password) {}
    public record ErrorCreatingUser(String error) {}
    public record UserCreationSuccess(String redirectTo) {}

    @PostMapping("/register")
    public ResponseEntity registerNewUser(@Valid @RequestBody NewUserCreationFields request) {
        try {
            usernamePasswordDetailsService.createUser(
                request.username(), 
                request.password()
            );
            return ResponseEntity.ok(new UserCreationSuccess("main.html"));
        }
        catch (Throwable ex) {
            return ResponseEntity.status(401).body(new ErrorCreatingUser(ex.getMessage()));
        }
    }
}
*/