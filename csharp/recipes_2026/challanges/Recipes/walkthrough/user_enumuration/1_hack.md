# User Enumuration
## What is it?
User enumeration is a vulnerability where an application reveals whether a specific user account exists, usually through different error messages, response codes, timings, or UI behavior during login, password reset, or registration. Attackers exploit this to build valid user lists, which then enables targeted brute-force, credential stuffing, phishing, or social engineering attacks. Best practice is to make authentication and recovery flows indistinguishable for existing and non-existing users, with uniform messages, timing, and responses, plus rate limiting and monitoring.


## How To exploit it?
