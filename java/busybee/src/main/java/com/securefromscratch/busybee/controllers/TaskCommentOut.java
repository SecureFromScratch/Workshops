package com.securefromscratch.busybee.controllers;

import com.securefromscratch.busybee.storage.TaskComment;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

public record TaskCommentOut(UUID commentid, String text, Optional<String> image, Optional<String> attachment, int indent, String createdBy, LocalDateTime createdOn) {
    static TaskCommentOut fromComment(TaskComment c) {
        return new TaskCommentOut(
                c.commentId(),
                c.text(),
                c.image(),
                c.attachment(),
                c.indent(),
                c.createdBy(),
                c.createdOn()
        );
    }
}
