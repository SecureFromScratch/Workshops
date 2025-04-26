document.addEventListener("DOMContentLoaded", () => {
    const menuButton = document.getElementById("menuButton");
    const menu = document.getElementById("menu");
    const exportOption = document.getElementById("exportOption");
    const importOption = document.getElementById("importOption");
    const logoutOption = document.getElementById("logoutOption");

    // Toggle menu visibility
    menuButton.addEventListener("click", (event) => {
        event.stopPropagation();
        menu.classList.toggle("hidden");
    });

    // Close the menu if clicking outside
    document.addEventListener("click", (event) => {
        if (!menu.contains(event.target) && event.target !== menuButton) {
            menu.classList.add("hidden");
        }
    });

    // Export option - Calls /extra/export
    exportOption.addEventListener("click", async () => {
        try {
            const response = await fetch("/extra/export");
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "tasks.ser"; // Specify the filename
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
            } else {
                alert("Failed to export tasks.");
            }
        } catch (error) {
            console.error("Error exporting tasks:", error);
            alert("An error occurred while exporting tasks.");
        }
        menu.classList.add("hidden");
    });

    // Import option - Redirects to import.html
    importOption.addEventListener("click", () => {
        window.location.href = "/import/import.html";
    });

    logoutOption.addEventListener("click", () => {
        window.location.href = "/logout";
    });

    document.getElementById('addTaskButton').addEventListener('click', redirectToCreate);
    fetchTasks();
});

async function fetchTasks() {
	try {
		const response = await fetch(`${baseUrl}/tasks`);
		if (!response.ok) throw new Error(`Error: ${response.status}`);
		
		const tasks = await response.json();
		displayTasks(tasks);
	} catch (error) {
		console.error('Failed to fetch tasks:', error);
	}
}

async function markTaskAsDone(taskId, checkbox) {
	try {
		const response = await sendPost("/done", { taskid: taskId });
		if (response.ok) {
			checkbox.checked = true;
			checkbox.readOnly = true;
		} else {
			throw new Error(`Error: ${response.status}`);
		}
	} catch (error) {
		console.error('Failed to mark task as done:', error);
		checkbox.checked = false; // Uncheck if the request fails
	}
}

function getDueDateClass(task) {
	const dueDate = new Date(task.dueDate);
	const today = new Date();
	const timeDiff = dueDate - today;
	const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

	if (daysDiff < 0) {
		return "overdue-summary";
	} else if (daysDiff === 0) {
		return "due-today-summary";
	} else if (daysDiff === 1) {
		return "due-tomorrow-summary";
	} else if (daysDiff <= 7) {
		return "due-in-7-days-summary";
	} else if (daysDiff <= 10) {
		return "due-in-10-days-summary";
	}
	return "";
}

function displayTasks(tasks) {
	const container = document.getElementById("tasks-container");
	container.innerHTML = "";  // Clear any existing content

	tasks.forEach(task => {
		const taskElement = document.createElement("details");
		taskElement.className = "task";

		// Create the summary element and append checkbox and name
		const summaryClass = task.dueDate ? getDueDateClass(task) : '';
		const summaryElement = document.createElement("summary");
		summaryElement.className = `task-header ${summaryClass}`;

		const label = createTaskHeader(task);
		summaryElement.appendChild(label);
        const dueDateSpan = document.createElement("span");
        dueDateSpan.textContent = task.dueDate ? `${task.dueDate} ${task.dueTime ? 'at ' + task.dueTime : ''}` : '';
		summaryElement.appendChild(dueDateSpan);

		// Append summary and details to task element
		taskElement.appendChild(summaryElement);

		const detailsElement = createDetails(task);
		taskElement.appendChild(detailsElement);

		container.appendChild(taskElement);
	});
}

function createTaskHeader(task) {
    const label = document.createElement("h2");

    const checkbox = createDoneCheckbox(task);
    label.appendChild(checkbox);

    const taskName = document.createElement("span");
    taskName.textContent = task.name;
    label.appendChild(taskName);

    //const expandButton = createTaskExpandButton(task);
    //label.appendChild(expandButton);

    return label;
}

/*function createTaskExpandButton(task) {
    const expandButton = document.createElement('button');
    expandButton.classList.add('expand-button');
    expandButton.textContent = "⤢"
    expandButton.title = 'Expand'; // Tooltip for better accessibility

    // Adding a glyph or icon
    //const expandIcon = document.createElement('i');
    //expandIcon.classList.add('fas', 'fa-expand'); // Using Font Awesome as an example
    //expandButton.appendChild(expandIcon);

    // Add click event to navigate to the Task page
    expandButton.addEventListener('click', () => {
        const taskId = encodeURIComponent(task.taskid); // Ensuring taskid is safely encoded
        window.location.href = `/task/task.html?taskid=${taskId}`;
    });

    // Append the button to the header
    return expandButton;
}*/

function createDoneCheckbox(task) {
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.done;
    checkbox.readOnly = task.done;
    checkbox.onclick = (event) => {
        //event.stopPropagation(); // Prevent triggering the <summary> toggle
        if (!checkbox.readOnly) {
            markTaskAsDone(task.taskid, checkbox);
        }
    };
    return checkbox;
}

function createDetails(task) {
    const detailsElement = document.createElement("div");
    detailsElement.className = "task-details";
    detailsElement.innerHTML = `
        <p>Created by: ${task.createdBy}</p>
        <p>Assigned to: ${task.responsibilityOf.join(", ")}</p>
        <p>Created on: ${task.creationDatetime}</p>
        <p>Status: ${task.done ? 'Done' : 'Pending'}</p>
        <p>Description:</p>
        <div>${task.desc}</div>
    `;

    if (task.comments) {
        const commentsContainer = createComments(task.taskid, task.comments);
        detailsElement.appendChild(commentsContainer);
    }

    const addCommentForm = createCommentForm(task.taskid);
    detailsElement.appendChild(addCommentForm);

    return detailsElement;
}

function createComments(taskid, comments) {
    const commentsContainer = document.createElement("div");
    commentsContainer.className = "comments";

    comments.forEach(comment => {
        const commentElement = document.createElement("div");
        commentElement.className = "comment";
        commentElement.style.paddingLeft = `${(comment.indent || 0) * 20}px`;

        if (comment.image) {
            const img = document.createElement("img");
            img.src = `${baseUrl}/image?img=${comment.image}`;
            img.alt = "Comment Image";
            commentElement.appendChild(img);
        }

        const textElement = document.createElement("span");
        textElement.className = "text";
        textElement.textContent = `${comment.createdBy}: ${comment.text}`;
        commentElement.appendChild(textElement);

        if (comment.attachment) {
            const attachmentIcon = document.createElement("img");
            attachmentIcon.classList.add("attachment-type-img")
            if (comment.attachment.endsWith(".pdf")) {
                attachmentIcon.src = "/pdf-icon.png";
                attachmentIcon.alt = "Pdf";
            }
            else if (comment.attachment.endsWith(".docx") || comment.attachment.endsWith(".doc")) {
                attachmentIcon.src = "/doc-icon.jpg";
                attachmentIcon.alt = "Word Doc";
            }
            else {
                attachmentIcon.src = "/other-icon.jpg";
                attachmentIcon.alt = "Unknown document type";
            }
            const attachmentLink = document.createElement("a");
            attachmentLink.href = `${baseUrl}/attachment?file=${comment.attachment}`;
            attachmentLink.textContent = comment.attachment;
            attachmentLink.className = "attachment";

            commentElement.appendChild(attachmentIcon);
            commentElement.appendChild(attachmentLink);
        }

        // Display createdOn date at the bottom right
        const createdOnElement = document.createElement("span");
        createdOnElement.className = "created-on";
        createdOnElement.textContent = comment.createdOn;
        commentElement.appendChild(createdOnElement);

        // Reply button
        const replyButton = document.createElement("button");
        replyButton.textContent = "↩"; // Unicode reply symbol
        replyButton.className = "reply-button";
        console.log(comment)
        replyButton.onclick = () => toggleReplyForm(commentElement, taskid, comment.commentid);
        commentElement.appendChild(replyButton);

        commentsContainer.appendChild(commentElement);
    });

    return commentsContainer;
}

function createCommentForm(taskId, commentId = null) {
    //console.log(taskId)
    //console.log(commentId)
    const form = document.createElement("div");
    form.className = "comment-form";

    const textBox = document.createElement("input");
    textBox.type = "text";
    textBox.placeholder = "Write a comment...";
    form.appendChild(textBox);

    const fileInput = document.createElement("input");
    fileInput.type = "file";
    form.appendChild(fileInput);

    const addButton = document.createElement("button");
    addButton.textContent = "Add";
    addButton.onclick = () => submitComment(taskId, textBox, fileInput, commentId);
    form.appendChild(addButton);

    return form;
}

function toggleReplyForm(commentElement, taskId, commentId) {
    // Check if reply form already exists
    const existingForm = commentElement.querySelector(".comment-form");
    if (existingForm) {
        existingForm.remove();
    } else {
        const replyForm = createCommentForm(taskId, commentId);
        commentElement.appendChild(replyForm);
    }
}

async function submitComment(taskId, textBox, fileInput, parentCommentId = null) {
    const formData = new FormData();

    // Create the JSON object for comment fields
    const commentFields = {
        text: textBox.value,
        taskid: taskId,       // Lowercase "taskid"
        commentid: parentCommentId // Lowercase "commentid"
    };

    // Add the JSON part with explicit Content-Type
    const blob = new Blob([JSON.stringify(commentFields)], { type: 'application/json' });
    formData.append("commentFields", blob);

    if (fileInput.files[0]) {
        formData.append("file", fileInput.files[0]);
    }

    try {
        const response = await sendPost("/comment", formData);

        if (response.ok) {
            textBox.value = ""; // Clear text box
            fileInput.value = ""; // Clear file input
            fetchTasks(); // Refresh tasks to show the new comment
        } else {
            throw new Error(`Error: ${response.status}`);
        }
    } catch (error) {
        console.error("Failed to submit comment:", error);
        alert("An error occurred while submitting the comment.");
    }
}

function redirectToCreate() {
	window.location.href = "/create/create.html";
}
