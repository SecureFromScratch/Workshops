package com.securefromscratch.busybee.controllers;

import com.securefromscratch.busybee.storage.Task;
import com.securefromscratch.busybee.storage.TaskComment;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.collections4.Transformer;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Optional;
import java.util.UUID;

public record TaskOut(UUID taskid, String name, String desc, Optional<LocalDate> dueDate, Optional<LocalTime> dueTime, String createdBy, String[] responsibilityOf, LocalDateTime creationDatetime, boolean done, TaskCommentOut[] comments) {
    static TaskOut fromTask(Task t) {
        Transformer<TaskComment, TaskCommentOut> transformer = c-> TaskCommentOut.fromComment((TaskComment)c);
        return new TaskOut(
                t.taskid(), t.name(), t.desc(),
                t.dueDate(), t.dueTime(), t.createdBy(),
                t.responsibilityOf(), t.creationDatetime(), t.done(),
                CollectionUtils.collect(t.comments(), transformer).toArray(new TaskCommentOut[0])
        );
    }
}
