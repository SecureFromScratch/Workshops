package com.securefromscratch.busybee.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/h2-console/**", "/webjars/**", "/favicon.ico", "/acceptance/**",
                                "/public/**",
                                "/index.html", "/*.css", "/busybee.webp","/register.js", "/register",
                                "/gencsrftoken", "/csrf.js", "/favicon.ico","/error","/login.js",
                                "/sfslogo4_w_white_margins2.png")
                        .permitAll()
                        .anyRequest().authenticated() // Protect all routes
                )
                .formLogin(form -> form
                        .loginProcessingUrl("/login") // ✅ handles form post
                        .defaultSuccessUrl("/main/main.html", true) // ✅ always go here after login
                        .permitAll())
                .logout(logout -> logout
                        .logoutUrl("/logout")
                        .logoutSuccessUrl("/index.html")
                        .permitAll())

                .csrf(csrf -> csrf
                        .ignoringRequestMatchers("/h2-console/**") // Disable CSRF for H2 console
                        .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse()))
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.ALWAYS))
                .headers(headers -> headers
                        .frameOptions(frame -> frame.sameOrigin()) // Allow H2 console to work inside frames
                );

        return http.build();
    }

}
