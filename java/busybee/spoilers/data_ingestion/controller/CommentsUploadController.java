package com.securefromscratch.busybee.controllers;

import com.securefromscratch.busybee.safety.CommentText;
import com.securefromscratch.busybee.storage.FileStorage;
import com.securefromscratch.busybee.storage.Task;
import com.securefromscratch.busybee.storage.TaskNotFoundException;
import com.securefromscratch.busybee.storage.TasksStorage;
import jakarta.validation.constraints.NotNull;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.*;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
public class CommentsUploadController {
    private static final Logger LOGGER = LoggerFactory.getLogger(CommentsUploadController.class);

    @Autowired
    private TasksStorage m_tasks;

    // TODO: If you don't have a CommentText type - use whatever type you have
    public record AddCommentFields(@NotNull UUID taskid, Optional<UUID> commentid, @NotNull CommentText text) { }
    public record CreatedCommentId(UUID commentid) {}
    @PostMapping(value = "/comment", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CreatedCommentId> addComment(
            @RequestPart("commentFields") AddCommentFields commentFields,
            @RequestPart(value = "file", required = false) Optional<MultipartFile> optFile
    ) throws IOException {
        Optional<Task> t = m_tasks.find(commentFields.taskid());
        if (t.isEmpty()) {
            throw new TaskNotFoundException(commentFields.taskid());
        }

        if (optFile.isEmpty() || optFile.get().isEmpty()) {
            UUID newComment = m_tasks.addComment(t.get(), commentFields.text().get(), "Yariv", commentFields.commentid());
            return ResponseEntity.ok(new CreatedCommentId(newComment));
        }


		String storedFilename = filePartProcessingDemo(optFile.get());

        FileStorage.FileType filetype = FileStorage.identifyType(optFile.get());
        Optional<String> imageFilename = (filetype == FileStorage.FileType.IMAGE) ? Optional.of(storedFilename) : Optional.empty();
        Optional<String> attachFilename = (filetype != FileStorage.FileType.IMAGE) ? Optional.of(storedFilename) : Optional.empty();

        UUID newComment = m_tasks.addComment(
                t.get(),
                commentFields.text().get(),
                imageFilename,
                attachFilename,
                "Yariv",
                commentFields.commentid()
        );
		return ResponseEntity.ok(new CreatedCommentId(newComment));
    }

	private String filePartProcessingDemo(MultipartFile fileData) throws IOException {
		// TODO: This is only a DEMO of how to access the stream of an uploaded file
		// Remember PREVENT's Neat Code: apply good programming practices (meaning that
		// this WILL NOT be the name of the function for saving a file to disk and in 
		// fact maybe you want it in a differenct file)
		String originalFilename = fileData.getOriginalFilename();
		String contentType = fileData.getContentType();
		
		try (InputStream fileBytes = fileData.getInputStream()) {
			// TODO: do something with stream
		}

		// TODO: For now - this always fails.
		// When you write oyur own code you need to decide when it fails and when it succeeds
		throw new ResponseStatusException(
				HttpStatus.UNSUPPORTED_MEDIA_TYPE,
				"No file type is supported because it is not implemented, yet"
		);
	}
}
