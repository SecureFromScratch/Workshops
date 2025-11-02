document.addEventListener("DOMContentLoaded", function () {
    const usernameInput = document.getElementById("username");
    const startButton = document.getElementById("start-button");
    const errorMessage = document.getElementById("error-message");

    usernameInput.addEventListener("input", function () {
        const fullNameRegex = /^[A-Za-z]+ [A-Za-z]+$/;

        // clean up
        let multiSpacesAsSingleSpace = usernameInput.value.replace(/\s+/g, ' ');
        //console.log(`***${multiSpacesAsSingleSpace}***`);
        if (multiSpacesAsSingleSpace[0] === " ") {
            multiSpacesAsSingleSpace = multiSpacesAsSingleSpace.substring(1);
        }

        const lastCharIdx = multiSpacesAsSingleSpace.length - 1;
        if (multiSpacesAsSingleSpace.endsWith(" ") && fullNameRegex.test(multiSpacesAsSingleSpace.substring(0, lastCharIdx))) {
            multiSpacesAsSingleSpace = multiSpacesAsSingleSpace.substring(0, lastCharIdx);
        }

        // updated with trimmed value
        usernameInput.value = multiSpacesAsSingleSpace;

        if (multiSpacesAsSingleSpace.length === 0) {
            errorMessage.textContent = "Name cannot be empty";
            startButton.disabled = true;
        } else if (multiSpacesAsSingleSpace.length > 40) {
            errorMessage.textContent = "Full name cannot exceed 40 characters";
            startButton.disabled = true;
        } else if (!fullNameRegex.test(multiSpacesAsSingleSpace)) {
            errorMessage.textContent = "A full name is required";
            startButton.disabled = true;
        } else if (usernameInput.value.endsWith(" ")) {
            usernameInput.value = usernameInput.value.substring(0, usernameInput.value.length - 1);
        } else {
            errorMessage.textContent = "";
            startButton.disabled = false;
        }
    });
});
