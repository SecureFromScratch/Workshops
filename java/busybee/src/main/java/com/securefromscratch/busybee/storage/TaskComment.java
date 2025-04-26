package com.securefromscratch.busybee.storage;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

public class TaskComment {
    private enum AttachedFileType { NONE, IMAGE, ATTACHMENT }
    private final UUID commentid;
    private final String text;
    private final AttachedFileType attachedFileType;
    private final String imageOrAttachment;
    private final String createdBy;
    private final LocalDateTime createdOn;
    private final int indent;

    public TaskComment(String text, String createdBy, int indent) {
        this(UUID.randomUUID(), text, Optional.empty(), Optional.empty(), indent, createdBy, LocalDateTime.now());
    }

    public TaskComment(String text, String createdBy, LocalDateTime createdOn, int indent) {
        this(UUID.randomUUID(), text, Optional.empty(), Optional.empty(), indent, createdBy, createdOn);
    }

    public TaskComment(String text, Optional<String> image, Optional<String> attachment, String createdBy, int indent) {
        this(UUID.randomUUID(), text, image, attachment, indent, createdBy, LocalDateTime.now());
    }

    public TaskComment(String text, Optional<String> image, Optional<String> attachment, String createdBy, LocalDateTime createdOn, int indent) {
        this(UUID.randomUUID(), text, image, attachment, indent, createdBy, createdOn);
    }

    private TaskComment(UUID commentid, String text, Optional<String> image, Optional<String> attachment, int indent, String createdBy, LocalDateTime createdOn) {
        this.commentid = commentid;
        this.text = text;

        AttachedFileType attachedFileType = AttachedFileType.NONE;
        String attachedFile = null;
        if (image.isPresent()) {
            attachedFile = image.get();
            attachedFileType = AttachedFileType.IMAGE;
        }
        else if (attachment.isPresent()) {
            attachedFile = attachment.get();
            attachedFileType = AttachedFileType.ATTACHMENT;
        }
        this.attachedFileType = attachedFileType;
        this.imageOrAttachment = attachedFile;
        this.indent = indent;
        this.createdBy = createdBy;
        this.createdOn = createdOn;
    }

    public UUID commentId() { return commentid; }
    public String text() { return text; }
    public String createdBy() { return createdBy; }
    public LocalDateTime createdOn() { return createdOn; }
    public int indent() { return indent; }

    public Optional<String> image() {
        return (attachedFileType == AttachedFileType.IMAGE)
                ? Optional.of(imageOrAttachment)
                : Optional.empty();
    }

    public Optional<String> attachment() {
        return (attachedFileType == AttachedFileType.ATTACHMENT)
                ? Optional.of(imageOrAttachment)
                : Optional.empty();
    }
}
