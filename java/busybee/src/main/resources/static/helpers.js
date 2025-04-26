const baseUrl = "http://localhost:8080";

// Helper function to retrieve a cookie by name
function getCookie(name) {
	const value = `; ${document.cookie}`;
	const parts = value.split(`; ${name}=`);
	if (parts.length === 2) return parts.pop().split(';').shift();
}

async function sendPost(path, jsonOrFormData) {
    const csrfToken = getCookie("XSRF-TOKEN");

    const headers = {
        "X-XSRF-TOKEN": csrfToken // Include the CSRF token in the headers
    };
    if (!(jsonOrFormData instanceof FormData)) {
        headers["Content-Type"] = "application/json";
        jsonOrFormData = JSON.stringify(jsonOrFormData);
    }

    const response = await fetch(`${baseUrl}${path}`, {
        method: "POST",
        headers: headers,
        body: jsonOrFormData
    });
    return response;
}
