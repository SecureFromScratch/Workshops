# User Enumuration
## What is it?
User enumeration is a vulnerability where an application reveals whether a specific user account exists, usually through different error messages, response codes, timings, or UI behavior during login, password reset, or registration. Attackers exploit this to build valid user lists, which then enables targeted brute-force, credential stuffing, phishing, or social engineering attacks. Best practice is to make authentication and recovery flows indistinguishable for existing and non-existing users, with uniform messages, timing, and responses, plus rate limiting and monitoring.

---

## How To Exploit It?

In the Recipes client, the registration page displays a helpful message when a user already exists. To enumerate users, prepare a list of possible usernames. Open the browser’s Developer Tools, go to the **Network** tab, and copy the **register** request. Then write a script (in a language of your choice) that replays that request for each username and records which ones are confirmed.

Do you have what it takes to write it yourself, or do you want to use a prebuilt [exploit](https://github.com/SecureFromScratch/Workshops/tree/main/csharp/recipes_2026/challanges/Recipes/test/UsernameEnumeration)?


---


