package com.securefromscratch.quiz.controllers;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
public class AnswersFileController {
   @GetMapping("/answers.txt")
   public ResponseEntity<Resource> downloadFile() throws IOException {
      Path path = Paths.get("answers.txt");
      if (!Files.exists(path)) {
         throw new ResponseStatusException(HttpStatus.NOT_FOUND, "answers.txt not found");
      }

      Resource resource = new UrlResource(path.toUri());
      return ResponseEntity.ok()
            .contentType(MediaType.TEXT_PLAIN)
            .body(resource);
   }
}
