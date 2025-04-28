package com.securefromscratch.busybee.controllers;

import com.securefromscratch.busybee.storage.Task;
import com.securefromscratch.busybee.storage.TasksStorage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.util.List;

@RestController
public class ExportImportController {
    private static final Logger LOGGER = LoggerFactory.getLogger(ExportImportController.class);

    @Autowired
    private TasksStorage m_tasks;

    @GetMapping("/extra/export")
    public ResponseEntity<byte[]> exportTasks() {
        List<Task> allTasks = m_tasks.getAll();

		try {
            // Create headers for the downloadable response
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("attachment", "tasks.ser");

			// todo: serializedTasks needs to contain the serialized content of allTasks
			byte[] serializedTasks = new byte[0];
            if (serializedTasks.length == 0) {
                throw new IOException("TODO: Serialize tasks");
            }
			
			return ResponseEntity.ok()
					.headers(headers)
					.body(serializedTasks);
        } catch (IOException e) {
            LOGGER.error("Failed to serialize tasks for export", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/extra/import")
    public ResponseEntity<String> importTasks(@RequestParam("file") MultipartFile file) {
		// todo: import tasks from serialized file
		// - deserialize the file
		// - add the tasks to the storage m_tasks
        return null;
	}
}
