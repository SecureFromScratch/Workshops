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

If you want it more **formal**, **academic**, or **CTF-style**, say which tone to use.


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

### Why Swagger Helps the Attacker

Swagger exposes:

* Full request schemas
* Hidden fields
* Enum values

Swagger is not the vulnerability.
**Trusting the client is.**

---

### How to Detect Mass Assignment

Ask:

* Can I send fields the UI doesn’t send?
* Does the server silently accept them?
* Does application state change because of it?

If yes → mass assignment exists.

---

### How to Prevent (Best Practice)

Golden rule:

> **Never bind request bodies directly to database entities**

#### Correct Pattern

* Use request DTOs with only allowed fields
* Server sets protected fields explicitly

For example:

* Client can send: `Name`, `Description`, `Photo`
* Server always sets:

  * `Status = Draft`
  * `CreatedBy = current user`
  * `CreateDate = now`

Optional hardening:

* Reject unknown JSON properties
* Separate “create” and “publish” endpoints
* Authorization checks on state transitions

---

### Key Takeaway

Mass assignment is not about hacking tools.
It is about **broken trust boundaries**.

If the client can control fields it should not,
**your business logic is already compromised**.

---

If you want, I can:

* convert this into **slides**
* add a **secure refactor lab**
* or turn it into a **graded exercise with hints**
