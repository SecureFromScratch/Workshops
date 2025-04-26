package com.securefromscratch.busybee.controllers;

import com.securefromscratch.busybee.storage.Task;
import com.securefromscratch.busybee.storage.TasksStorage;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.collections4.Transformer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.Collection;
import java.util.List;

@RestController
@CrossOrigin(origins = "null")
public class TasksController {
    private static final Logger LOGGER = LoggerFactory.getLogger(TasksController.class);

    @Autowired
    private TasksStorage m_tasks;

    // Request: No arguments
    // Expected Response: [
    //    {
    //       "taskid": "<UUID>",
    //       "name": "<name>",
    //       "desc": "<desc>",
    //       "dueDate": "<date>",  // this is optional
    //       "dueTime": "<time>",  // this is optional
    //       "createdBy": "<name of user>",
    //       "responsibilityOf": [ "<user1">, "<user2>", ...],
    //       "creationDatetime": "<date+time>",
    //       "done": false/true,
    //       "comments": [ { comment1 }, { comment2 }, ... ] (see TaskCommentOut for fields)
    //    }, ...
    // ]
    @GetMapping("/tasks")
    public Collection<TaskOut> getTasks() {
        List<Task> allTasks = m_tasks.getAll();
        Transformer<Task, TaskOut> transformer = t-> TaskOut.fromTask((Task)t);
        return CollectionUtils.collect(allTasks, transformer);
    }

    // Request: { "taskid": "<uuid>" }
    // Expected Response: { "success": true/false }
    @PostMapping("/done")
    public ResponseEntity markTaskDone() {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).body("TODO");
    }

    // Request: {
    //     "name": "<task name>",
    //     "desc": "<description>",
    //     "dueDate": "<date>", // or null
    //     "dueTime": "<time>", // or null
    //     "responsibilityOf": [ "<name1>", "<name2>", ... ]
    // }
    // Expected Response: { "taskid": "<uuid>" }
    @PostMapping("/create")
    public ResponseEntity create() {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).body("TODO");
    }
}
