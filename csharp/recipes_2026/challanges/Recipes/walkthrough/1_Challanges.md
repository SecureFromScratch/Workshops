# Hack The Recipes

## Exploit, Fix, Repeat
This application contain a vulnerabilities
Your goal is to exploit them, fix them and verify.

---
### Stroll around
Before trying any tricks or fixes, take a deep breath and try to register, log in, and add some recipes.
Explore the solution.

---

### User enumuration
An attacker can determine whether a user exists in the system or not.
Write a program that demonstrates how this user-enumeration vulnerability can be exploited.
What can you do to prevent it?

---

### Approve the recipe
A user can submit a new recipe and manipulate the process to force it into an approved state.

---

### Denial of service
It's possible to overwrite an important system file, which can cause a denial of service. Can you do it?

---

### Access to internal sysem
It’s possible to retrieve AWS information only from localhost. How could an attacker trick the system into exposing this information?
1. Check service health
curl http://localhost:4566/_localstack/health

2. Get LocalStack info
curl http://localhost:4566/_localstack/info

3. Diagnostics
curl http://localhost:4566/_localstack/diagnose

---

### Delete someone else’s recipe
According to the requirements, only an admin or the recipe’s creator can delete a recipe.
Can you delete someone else’s recipe?
What needs to be changed in the code to prevent this?

---

### Create a Recipe in someonelses name
One scenario is when an attacker can host a page on the same domain.
Another scenario is when the page is hosted on a different domain.

If you try from another host, the `SameSite=Strict` attribute will block it.
A developer cannot set `SameSite=None` without also setting `Secure=true`, because browsers reject cookies with `SameSite=None` unless `Secure` is enabled.

So for this discussion, stick to the scenario where the attacker can host a page on the same domain.

---


### Admin Dashboard Access 
Attempt to reach the admin dashboard with a standart user.

What is the Answer to the Ultimate Question of Life, the Universe, and Everything?

What needs to be changed in the code to prevent this?

---

### Login with Attacker credentails
A hacker can trick the user into logging in under the hacker’s identity. Later, the user might provide sensitive information that the hacker will be able to access.
In this exercise, prepare an HTML page that runs from `http://localhost:8888` and demonstrates how the user can be tricked into logging in.

---

### Prompt Injection Against the RecipeAI Controller
The RecipeAI controller is vulnerable.
As an attacker, manipulate the prompt to make the controller perform non-recipe actions.
Demonstrate the misuse.
Then fix the controller to prevent prompt-based exploitation.
