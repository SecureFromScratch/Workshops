function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

function getCsrfToken() {
    return getCookie('XSRF-TOKEN');
}

async function submitTask() {
    const responsibilityElements = document.querySelectorAll(".responsibility-field");
    const responsibilities = Array.from(responsibilityElements).map(input => input.value).filter(value => value.trim());

    const taskData = {
        name: document.getElementById("name").value,
        desc: document.getElementById("desc").value,
        dueDate: document.getElementById("dueDate").value || null,
        dueTime: document.getElementById("dueDate").value ? document.getElementById("dueTime").value || null : null,
        responsibilityOf: responsibilities
    };

    // Step 1: Fetch CSRF token from backend
    try {
        const response = await fetch('/gencsrftoken', { credentials: 'same-origin' });
        if (response.ok) {
            const data = await response.json();
            csrfToken = data.token;
            csrfHeaderName = data.headerName;
            console.log("✅ CSRF token:", csrfToken);
        } else {
            console.error('❌ Failed to fetch CSRF token:', response.status);
        }
    } catch (err) {
        console.error('❌ Error fetching CSRF token:', err);
    }
    // creating the token
    try {

        const response = await fetch("/create", {
            method: "POST",
            headers: {                
                "Content-Type": "application/json",

                [csrfHeaderName]: csrfToken
            },
            body: JSON.stringify(taskData),
            credentials: "same-origin"
        });
        if (response.ok) {
            window.location.href = "/main/main.html";
        } else {
            alert("Failed to add task. Please try again.");
        }
    } catch (err) {
        console.error('❌ Error adding task:', err);
    }
}

function cancelTask() {
    window.location.href = "/main/main.html";
}

function addResponsibilityField() {
    const container = document.getElementById("responsibilityContainer");

    const responsibilityField = document.createElement("div");
    responsibilityField.className = "responsibility-group";

    const input = document.createElement("input");
    input.type = "text";
    input.className = "responsibility-field";
    input.placeholder = "Enter responsible person";
    responsibilityField.appendChild(input);

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.textContent = "Remove";
    removeButton.onclick = () => container.removeChild(responsibilityField);
    responsibilityField.appendChild(removeButton);

    container.appendChild(responsibilityField);
}

function toggleDueTime() {
    const dueDate = document.getElementById("dueDate").value;
    const dueTimeContainer = document.getElementById("dueTimeContainer");
    //dueTimeContainer.style.display = dueDate ? "block" : "none";
    dueTimeContainer.classList.toggle("hidden", !dueDate);
}

document.getElementById('dueDate').addEventListener('change', toggleDueTime);
document.getElementById('addResponsibility').addEventListener('click', addResponsibilityField);
document.getElementById('submitTask').addEventListener('click', submitTask);
document.getElementById('cancelTask').addEventListener('click', cancelTask);
