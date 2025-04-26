let csrfToken = null;
let csrfHeaderName = null;

document.addEventListener('DOMContentLoaded', async function () {
    // Fetch CSRF token on page load
    try {
        csrfToken = "dummy";
        csrfHeaderName = "X-CSRF-TOKEN";
        // TODO: Uncomment this to call CSRF token generations
        const response = await fetch('/gencsrftoken', {
            method: 'GET'
            //, credentials: 'same-origin', // Ensures cookies are sent
        });

        if (response.ok) {
            const data = await response.json();
            csrfToken = data.token;
            csrfHeaderName = data.headerName;
            // TODO: Print csrfToken & csrfHeaderName to console. Compare with cookie value.
        } else {
            console.error('Failed to fetch CSRF token:', response.status);
        }
    } catch (error) {
        console.error('Error fetching CSRF token:', error);
    }

    // Attach event listener to registration form
    const registrationForm = document.getElementById('registration-form');
    const errorMessageElement = document.getElementById('error-message');

    registrationForm.addEventListener('submit', async function (event) {
        event.preventDefault(); // Prevent form from reloading the page

        const username = document.getElementById('new-username').value.trim();
        const password = document.getElementById('new-password').value.trim();

        try {
            const response = await fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password }),
            });

            if (response.status === 200) {
                const data = await response.json();
                window.location.href = data.redirectTo;
            } else if (response.status === 401) {
                const errorData = await response.json();
                showError(errorData.error);
            } else {
                showError('Unexpected error occurred. Please try again.');
            }
        } catch (error) {
            showError('Failed to connect to the server.');
        }
    });

    function showError(message) {
        errorMessageElement.textContent = message;
        errorMessageElement.classList.remove('hidden');
    }
});
