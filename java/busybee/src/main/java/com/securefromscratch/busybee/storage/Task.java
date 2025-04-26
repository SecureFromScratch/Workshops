package com.securefromscratch.busybee.storage;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.function.Function;
import java.util.stream.IntStream;

// IMPORTANT: This class in intentionally IMMUTABLE (except for adding comments, see below)
// It should not be possible to modify it.
// Also note that when returning all comments an unmodifiable list is returned:
// public List<TaskComment> comments() { return Collections.unmodifiableList(m_comments); }
//
// The addComment option is a MISTAKE. This class should be immutable (following Oracle secure coding guidelines)
// TODO: Make all neccessary changes so this class becomes truely immutable.
//       There are multiple ways to solve this, each with different pros-cons.
public final class Task {
    private final UUID m_taskid;
    private final String m_name;
    private final String m_desc;
    private final LocalDate m_dueDate;
    private final boolean m_hasDueTime;
    private final LocalTime dueTime;
    private final String m_createdBy;
    private final String[] m_responsibilityOf;
    private final LocalDateTime m_creationDatetime;
    private final boolean m_done;
    private final List<TaskComment> m_comments = new ArrayList<>();

    public Task(String name, String desc,
                String createdBy, String[] responsibilityOf
    ) {
        this(name, desc, Optional.empty(), Optional.empty(), createdBy, responsibilityOf);
    }

    public Task(String name, String desc, LocalDate dueDate,
                String createdBy, String[] responsibilityOf
    ) {
        this(name, desc, Optional.of(dueDate), Optional.empty(), createdBy, responsibilityOf);
    }

    public Task(String name, String desc, LocalDate dueDate, String createdBy) {
        this(name, desc, Optional.of(dueDate), Optional.empty(), createdBy, new String[]{createdBy});
    }

    public Task(String name, String desc, LocalDate dueDate, LocalTime dueTime,
                String createdBy, String[] responsibilityOf
    ) {
        this(name, desc, Optional.of(dueDate), Optional.of(dueTime), createdBy, responsibilityOf);
    }

    Task(String name, String desc, LocalDate dueDate, String createdBy, String[] responsibilityOf, LocalDateTime createdOn) {
        this(name, desc, Optional.of(dueDate), Optional.empty(), createdBy, responsibilityOf, createdOn);
    }

    Task(String name, String desc, LocalDate dueDate, String createdBy, LocalDateTime createdOn) {
        this(name, desc, Optional.of(dueDate), Optional.empty(), createdBy, new String[]{createdBy}, createdOn);
    }

    Task(String name, String desc, LocalDate dueDate, LocalTime dueTime, String createdBy, String[] responsibilityOf, LocalDateTime createdOn) {
        this(name, desc, Optional.of(dueDate), Optional.of(dueTime), createdBy, responsibilityOf, createdOn);
    }

    public Task(String name, String desc, LocalDate dueDate, LocalTime dueTime, String createdBy) {
        this(name, desc, Optional.of(dueDate), Optional.of(dueTime), createdBy, new String[]{createdBy});
    }

    private Task(
            String name,
            String desc,
            Optional<LocalDate> dueDate,
            Optional<LocalTime> dueTime,
            String createdBy,
            String[] responsibilityOf
    ) {
        this(UUID.randomUUID(), name, desc,
            dueDate.orElse(LocalDate.MAX),
            dueTime.isPresent(),
            dueTime.orElse(LocalTime.MIN),
            createdBy, responsibilityOf, LocalDateTime.now(), false
        );
    }

    private Task(
            String name,
            String desc,
            Optional<LocalDate> dueDate,
            Optional<LocalTime> dueTime,
            String createdBy,
            String[] responsibilityOf,
            LocalDateTime createdOn
    ) {
        this(UUID.randomUUID(), name, desc,
                dueDate.orElse(LocalDate.MAX),
                dueTime.isPresent(),
                dueTime.orElse(LocalTime.MIN),
                createdBy, responsibilityOf, createdOn, false
        );
    }

    private Task(
        UUID taskid,
        String name,
        String desc,
        LocalDate dueDate,
        boolean hasDueTime,
        LocalTime dueTime,
        String createdBy,
        String[] responsibilityOf,
        LocalDateTime creationDatetime,
        boolean done
    ) {
        this.m_taskid = taskid;
        this.m_name = name;
        this.m_desc = desc;
        this.m_dueDate = dueDate;
        this.m_hasDueTime = hasDueTime;
        this.dueTime = dueTime;
        this.m_createdBy = createdBy;
        this.m_responsibilityOf = responsibilityOf;
        this.m_creationDatetime = creationDatetime;
        this.m_done = done;
    }

    public static Task asDone(Task task) {
        return new Task(
                task.m_taskid,
                task.m_name,
                task.m_desc,
                task.m_dueDate,
                task.m_hasDueTime,
                task.dueTime,
                task.m_createdBy,
                task.m_responsibilityOf,
                task.m_creationDatetime,
                true
        );
    }

    public UUID taskid() { return m_taskid; }
    public String name() { return m_name; }
    public String desc() { return m_desc; }
    public String createdBy() { return m_createdBy; }
    public String[] responsibilityOf() { return m_responsibilityOf; }
    public LocalDateTime creationDatetime() { return m_creationDatetime; }
    public boolean done() { return m_done; }
    public List<TaskComment> comments() { return Collections.unmodifiableList(m_comments); }

    public Optional<LocalDate> dueDate() {
        return LocalDate.MAX.equals(m_dueDate) ? Optional.empty() : Optional.of(m_dueDate);
    }

    public Optional<LocalTime> dueTime() {
        return m_hasDueTime ? Optional.of(dueTime) : Optional.empty();
    }

    UUID addComment(String text, String createdBy, Optional<UUID> after) {
        return addComment((indent)->new TaskComment(text, createdBy, indent), after);
    }

    UUID addComment(String text, String createdBy, LocalDateTime createdOn, Optional<UUID> after) {
        return addComment((indent)->new TaskComment(text, createdBy, createdOn, indent), after);
    }

    UUID addComment(String text, Optional<String> image, Optional<String> attachment, String createdBy, Optional<UUID> after) {
        return addComment((indent)->new TaskComment(text, image, attachment, createdBy, indent), after);
    }

    UUID addComment(String text, Optional<String> image, Optional<String> attachment, String createdBy, LocalDateTime createdOn, Optional<UUID> after) {
        return addComment((indent)->new TaskComment(text, image, attachment, createdBy, createdOn, indent), after);
    }

    private int findCommentIdx(UUID id) {
        OptionalInt indexOpt = IntStream.range(0, m_comments.size())
                .filter(i -> m_comments.get(i).commentId().equals(id))
                .findAny();

        return indexOpt.orElse(-1);
    }

    private UUID addComment(Function<Integer, TaskComment> commentGenerator, Optional<UUID> after) {
        int afterIdx = after.map(this::findCommentIdx).orElse(-1);
        int indent = (afterIdx == -1) ? 0 : m_comments.get(afterIdx).indent() + 1;
        // advance to last comment with this indent (could have inner indents so looks as long as indent isn't lower)
        while (afterIdx + 1 < m_comments.size() && m_comments.get(afterIdx + 1).indent() >= indent) {
            ++afterIdx;
        }

        TaskComment c = commentGenerator.apply(indent);
        if (afterIdx == -1) {
            m_comments.add(c);
        }
        else {
            m_comments.add(afterIdx + 1, c);
        }
        return c.commentId();
    }

    public void removeComment(UUID commentId) {
        int commentIdx = findCommentIdx(commentId);
        if (commentIdx == -1) {
            throw new CommentNotFoundException(m_taskid, commentId);
        }
        TaskComment old = m_comments.remove(commentIdx);
        assert(old != null); // must succeed
    }
}
