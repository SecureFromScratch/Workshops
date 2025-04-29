//let csrfToken = null;
//let csrfHeaderName = "X-XSRF-TOKEN";

document.addEventListener("DOMContentLoaded", async () => {
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

    // Step 2: Add event listener to login form
    const loginForm = document.getElementById("login-form");
    const errorMessage = document.getElementById("login-error");

    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const username = document.getElementById("login-username").value.trim();
        const password = document.getElementById("login-password").value.trim();

        const formData = new URLSearchParams();
        formData.append("username", username);
        formData.append("password", password);
        formData.append("_csrf", csrfToken); // required for Spring's default setup

        try {
            const response = await fetch("/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    [csrfHeaderName]: csrfToken
                },
                body: formData,
                credentials: "same-origin"
            });

            if (response.redirected || response.ok) {
                window.location.href = "/main/main.html";
            } else {
                errorMessage.textContent = "❌ Login failed";
                errorMessage.classList.remove("hidden");
                console.error("Login failed", await response.text());
            }
        } catch (error) {
            errorMessage.textContent = "❌ Server error during login.";
            errorMessage.classList.remove("hidden");
            console.error("Login error", error);
        }
    });
});
