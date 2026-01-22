## File Upload Vulnerability – Inadequate Validation

### What is the Vulnerability?

A file upload vulnerability occurs when the backend accepts uploaded files **without enforcing strict validation** on file properties such as type, size, content, and storage path.

When multiple validation layers are missing, an attacker can upload files that negatively impact application availability or integrity.

---

### Why is this Dangerous?

Uploaded files can be used to:

* Overwrite application or configuration files
* Exhaust disk space or memory
* Bypass file-type restrictions
* Break application startup or runtime behavior
* System take over

This can lead to **denial of service (DoS)** or broader compromise.

---

### Scenario Overview

The UI allows users to upload a recipe photo.

The backend does **not strictly validate**:

* File size limits
* File extension
* File content (magic bytes)
* Storage path and filename normalization

---

### Practical Observation (Using Developer Tools)

The browser’s **Developer Tools** can be used to inspect the multipart file upload request. By modifying the request payload, an attacker can control:

* The uploaded filename
* The file extension
* The file size
* The actual file content

---

Example attacker-controlled characteristics:

```text
Filename: ../../../../appsettings.json
Extension: .json
Content-Type: image/png
Actual Content: configuration file
```

The server accepts the upload despite mismatches between declared type, extension, and content.

---

