package com.securefromscratch.busybee.safety;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;

@Schema(type = "String", description = "Due Date (YYYY-MM-DD)")
public class TaskDueDate {
    private final LocalDate date;

    public TaskDueDate(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("DueDate cannot be null or blank.");
        }
        final LocalDate parsedDate;
        try {
            parsedDate = LocalDate.parse(value); // Strict ISO 8601 parsing
        } catch (DateTimeParseException ex) {
            throw new IllegalArgumentException("Invalid DueDate format. Expected YYYY-MM-DD.", ex);
        }

        if (parsedDate.isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("DueDate cannot be in the past.");
        }

        this.date = parsedDate;
    }

    public LocalDate get() {
        return date;
    }

    @Override
    public String toString() {
        return date.toString();
    }
}
