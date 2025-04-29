package com.securefromscratch.busybee.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.security.web.csrf.CsrfToken;

@Controller
public class HomeController {

    @GetMapping("/")
    public String home(Model model, CsrfToken csrfToken) {
        model.addAttribute("_csrf", csrfToken); // 🔥 attach CSRF token to the model
        return "index"; // will render templates/index.html
    }
}
