document.addEventListener("DOMContentLoaded", function () {
    const usernameInput = document.getElementById("username");
    const startButton = document.getElementById("start-button");
    const errorMessage = document.getElementById("error-message");

    usernameInput.addEventListener("input", function () {
        const fullNameRegex = /^[A-Za-z]+ [A-Za-z]+$/;
        const trimmedValue = usernameInput.value.trim();

        if (trimmedValue === "") {
            errorMessage.textContent = "Name cannot be empty";
            startButton.disabled = true;
        } else if (!fullNameRegex.test(trimmedValue)) {
            errorMessage.textContent = "A full name is required";
            startButton.disabled = true;
        } else {
            errorMessage.textContent = "";
            startButton.disabled = false;
        }
    });
});
