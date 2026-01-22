## Mass Assignment Vulnerability 
### What is Mass Assignment?

Mass assignment occurs when a backend automatically maps all fields from a JSON request into a server-side model, including fields the client was **never intended to control**.

If an API binds a request body directly to an entity like `Recipe`, every writable property becomes attacker-controlled.

---

### Why is this Dangerous?

Some fields must always be controlled by the server, for example:

* `Status` (Draft / Published / Deleted)
* `CreatedBy`
* `CreateDate`
* Privilege or workflow fields

Allowing the client to set them breaks business rules and authorization logic.

---

### Scenario Overview

The UI allows users to create a recipe with:

* name
* description
* photo

The backend `Recipe` model also contains:

* `Status`
* `CreatedBy`

These fields are **not shown in the UI** but **exist on the server model**.

---

### Practical Observation (Using Developer Tools)

The browser’s **Developer Tools** can be used to inspect the network request sent when creating a recipe. By using the **“Edit and Resend”** feature, the request payload can be modified to include fields that are not part of the original UI submission.

---

Example payload sent by the attacker:

```json
{
  "name": "mass assignment",
  "description": "<p>mass assignment</p>",
  "status": 1,
  "photo": "",
  "createdBy": ""
}
```

Although `status` was not part of the original request, the server accepted it.

---

### Why This Works

* The backend binds the request body directly to the `Recipe` entity
* The `Status` field is writable
* Enum values are predictable (`Draft = 0`, `Published = 1`)
* No server-side enforcement overrides the client input

Result:
A recipe that should be created as **Draft** is immediately **Published**, bypassing moderation or approval.

---

