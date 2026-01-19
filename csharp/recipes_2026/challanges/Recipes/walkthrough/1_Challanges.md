# Hack The Recipes

## Exploit, Fix, Repeat
This application contain a vulnerabilities
Your goal is to exploit them, fix them and verify.

### Approve the recipe
A user can submit a new recipe and manipulate the process to force it into an approved state.

### User enumuration
An attacker can determine whether a user exists in the system or not.
Write a program that demonstrates how this user-enumeration vulnerability can be exploited.
What can you do to prevent it?

### Denial of service
It's possible to overwrite an important system file, which can cause a denial of service. Can you do it?

### Access to internal sysem
It’s possible to retrieve AWS information only from localhost. How could an attacker trick the system into exposing this information?
1. Check service health
curl http://localhost:4566/_localstack/health

2. Get LocalStack info
curl http://localhost:4566/_localstack/info

3. Diagnostics
curl http://localhost:4566/_localstack/diagnose



### Login with Attacker credentails
A hacker can trick the user into logging in under the hacker’s identity. Later, the user might provide sensitive information that the hacker will be able to access.
In this exercise, prepare an HTML page that runs from `http://localhost:8888` and demonstrates how the user can be tricked into logging in.
