package com.securefromscratch.busybee.storage;

import java.util.UUID;

public class TaskNotFoundException extends RuntimeException {
    public TaskNotFoundException(UUID taskId) {
        super("Task with ID " + taskId + " not found.");
    }
}
