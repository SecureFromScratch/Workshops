package com.securefromscratch.busybee.controllers;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.securefromscratch.busybee.safety.Name;
import com.securefromscratch.busybee.safety.TaskDescription;
import com.securefromscratch.busybee.safety.TaskDueDate;
import com.securefromscratch.busybee.safety.TaskName;
import com.securefromscratch.busybee.storage.Task;
import com.securefromscratch.busybee.storage.TasksStorage;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.collections4.Transformer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.security.Principal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

@RestController
@CrossOrigin(origins = "null")
public class TasksController {
    private static final Logger LOGGER = LoggerFactory.getLogger(TasksController.class);

    @Autowired
    private TasksStorage m_tasks;

    // Request: No arguments
    // Expected Response: [
    // {
    // "taskid": "<UUID>",
    // "name": "<name>",
    // "desc": "<desc>",
    // "dueDate": "<date>", // this is optional
    // "dueTime": "<time>", // this is optional
    // "createdBy": "<name of user>",
    // "responsibilityOf": [ "<user1">, "<user2>", ...],
    // "creationDatetime": "<date+time>",
    // "done": false/true,
    // "comments": [ { comment1 }, { comment2 }, ... ] (see TaskCommentOut for
    // fields)
    // }, ...
    // ]
    @GetMapping("/tasks")
    public Collection<TaskOut> getTasks(Principal principal) {
        List<Task> allTasks = m_tasks.getAll();
        Transformer<Task, TaskOut> transformer = t -> TaskOut.fromTask((Task) t);
        // return CollectionUtils.collect(allTasks, transformer);
        Collection<TaskOut> taskOutCollection = CollectionUtils.collect(allTasks, transformer);
        List<TaskOut> taskOutList = new ArrayList<TaskOut>();
        for (TaskOut taskOut : taskOutCollection) {
            if (taskOut.createdBy().equals(principal.getName())) {
                taskOutList.add(taskOut);
            } else if (Arrays.asList(taskOut.responsibilityOf()).contains(principal.getName())) {
                taskOutList.add(taskOut);
            }
        }
        return taskOutList;

    }

    public record MarkAsDoneRequestDTO(UUID taskid) {
    }

    public record MarkAsDoneResponseDTO(boolean success) {
    }

    // Request: { "taskid": "<uuid>" }
    // Expected Response: { "success": true/false }
    @PostMapping("/done")
    public ResponseEntity<MarkAsDoneResponseDTO> markTaskDone(@RequestBody MarkAsDoneRequestDTO dto) {
        try {
            m_tasks.markDone(dto.taskid());
            return ResponseEntity.ok().body(new MarkAsDoneResponseDTO(true));

            // return new MarkAsDoneResponseDTO(true);
        } catch (IOException e) {
            // return ResponseEntity..internalServerError();
            return ResponseEntity.internalServerError().body(new MarkAsDoneResponseDTO(false));
        }
    }

    // public record CreateRequestDTO(TaskName name, @JsonProperty("desc")
    // TaskDescription description,
    // TaskDueDate dueDate) { }
    public record CreateRequestDTO(
            TaskName name,
            @JsonProperty("desc") TaskDescription description,
            TaskDueDate dueDate,
            String dueTime,
            List<Name> responsibilityOf) {
    }

    public record CreateResponseDTO(UUID taskid) {
    }

    // Request: {
    // "name": "<task name>",
    // "desc": "<description>",
    // "dueDate": "<date>", // or null
    // "dueTime": "<time>", // or null
    // "responsibilityOf": [ "<name1>", "<name2>", ... ]
    // }
    // Expected Response: { "taskid": "<uuid>" }
    @PostMapping("/create")
    public ResponseEntity create(@RequestBody CreateRequestDTO request, @AuthenticationPrincipal UserDetails user) throws AccessDeniedException {
        UUID newTaksId;
        // user.getAuthorities()
        // System.err.println(user.getAuthorities());
        String[] strAuthoroties = user.getAuthorities().stream().map(GrantedAuthority::getAuthority)
                .toArray(String[]::new);
        if (Arrays.asList(strAuthoroties).contains("ROLE_ADMIN")
                || Arrays.asList(strAuthoroties).contains("ROLE_CREATOR")) {

            try {

                String[] responsibleArray = request.responsibilityOf() == null
                        ? new String[0]
                        : request.responsibilityOf().stream().map(Name::get).toArray(String[]::new);

                newTaksId = m_tasks.add(
                        request.name(),
                        request.description(),
                        request.dueDate(),
                        responsibleArray);

                return ResponseEntity.ok().body(new CreateResponseDTO(newTaksId));

            } catch (IOException e) {
                LOGGER.error("Failed creating a task with parameters {0}", e);
                return ResponseEntity.internalServerError().body("IO Exception");
            }
        } else {
            throw new AccessDeniedException(null);
        }

    }

    

}