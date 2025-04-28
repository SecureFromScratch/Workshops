package com.securefromscratch.Tasks.controllers;

import com.securefromscratch.Tasks.auth.UsernamePasswordDetailsService;
import com.securefromscratch.Tasks.safety.Password;
import com.securefromscratch.Tasks.safety.UserName;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.web.csrf.CsrfToken;

import jakarta.validation.constraints.NotNull;

@Controller
public class UsersController {
    private final UsernamePasswordDetailsService usersStorage;
    private final PasswordEncoder passwordEncoder;
    private final CookieCsrfTokenRepository csrfTokenRepository = CookieCsrfTokenRepository.withHttpOnlyFalse();

    public UsersController(UsernamePasswordDetailsService usersStorage, PasswordEncoder passwordEncoder) {
        this.usersStorage = usersStorage;
        this.passwordEncoder = passwordEncoder;
    }


    public record CsrfTokenResponse(String token, String str, String headerName, String paramName) {}
    @GetMapping("/gencsrftoken")
    public ResponseEntity<CsrfTokenResponse> getCsrfToken(HttpServletRequest request, HttpServletResponse response) {
        CsrfToken token = (CsrfToken) request.getAttribute(CsrfToken.class.getName());
        return ResponseEntity.ok(new CsrfTokenResponse(token.getToken(), token.toString(), token.getHeaderName(), token.getParameterName()));
    }

    public record NewUserCreationFields(@NotNull UserName username, @NotNull Password password) {}
    public record ErrorCreatingUser(String error) {}
    public record UserCreationSuccess(String redirectTo) {}

    @PostMapping("/register")
    public ResponseEntity registerNewUser(
            @Valid @RequestBody NewUserCreationFields request
    ) {
        try {
			// TODO: Create new user
            
            return ResponseEntity.ok(new UserCreationSuccess("main.html"));
        }
        catch (Throwable ex) {
            return ResponseEntity.status(401).body(new ErrorCreatingUser(ex.getMessage()));
        }
    }
}
