package com.securefromscratch.busybee.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;


@RestController
public class CsrfController {
    
public record CsrfTokenResponse(String token, String str, String headerName, String paramName) {}   
@GetMapping("/gencsrftoken")
    public ResponseEntity<CsrfTokenResponse> getCsrfToken(HttpServletRequest request, HttpServletResponse response) {
        CsrfToken token = (CsrfToken) request.getAttribute(CsrfToken.class.getName());
        return ResponseEntity.ok(new CsrfTokenResponse(token.getToken(), token.toString(), token.getHeaderName(), token.getParameterName()));
    }

}

