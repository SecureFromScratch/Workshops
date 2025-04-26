document.getElementById("importForm").onsubmit = async function(event) {
    event.preventDefault();

    const formData = new FormData();
    const fileInput = document.getElementById("file");

    // Add file to FormData
    formData.append("file", fileInput.files[0]);

    try {
        const response = await sendPost("/extra/import", formData);
        if (response.ok) {
            alert("Tasks imported successfully!");
            window.location.href = "/main/main.html";
        } else {
            const errorMessage = await response.text();
            alert("Failed to import tasks: " + errorMessage);
        }
    } catch (error) {
        console.error("Error importing tasks:", error);
        alert("An error occurred while importing tasks.");
    }
};
