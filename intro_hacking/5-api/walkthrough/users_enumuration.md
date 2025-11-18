## User Enumuration
User enumeration is a security testing technique used to discover valid usernames or user IDs within an application or system. It's done by observing slight but discernible differences in the system's responses when an attacker attempts to authenticate or interact with different user accounts.

##  How User Enumeration Works

The core concept is to test a known input (a username or email) against a system function (like login or password reset) and look for different reactions based on whether the input is valid or invalid.

### Common Vectors for Enumeration:

| Attack Vector | User Response Difference | What the Attacker Sees |
| :--- | :--- | :--- |
| **Login Page** | A valid username results in the error: "Incorrect password." An invalid username results in: "User does not exist." | A change in the **error message**. |
| **Password Reset** | Entering a valid username sends a password reset link and returns: "If that user exists, a link has been sent." An invalid user returns: "User does not exist." | A change in the **page text** or **HTTP status code** (e.g., 200 OK vs. 404 Not Found). |
| **Response Timing** | Authenticating a valid user takes significantly longer than an invalid user (due to backend lookups or hashing). | A difference in the **time** it takes to receive the HTTP response. |

---

##  Exploit in VAmPI
- Register the following users: cyber_champion, quality_assurance, gov_il
- Capture the login method in Burp
- Send the request to Burp intruder using ctrl+i
- Mark the user name and click the add button, this is going to be our variable
- Go to the payload tab
- Type different values and combine and users you created between them for example: aaaaa, bbbb, cccccc, cyber_champion ,eeeeee, quality_assurance, gov_il 
- Click the start attack button
- What do you learn? 
  


