# More about CSRF

CSRF protection mainly matters for unauthenticated or partially authenticated flows where the browser is allowed to send cookies cross-site. Examples include user registration, login, forgot-password, password reset, and onboarding flows. These can be abused cross-site to create accounts, trigger password resets, or modify user data without user intent.

Once the user is fully logged in and all state-changing operations require same-site navigation (because the session cookie is issued with `SameSite=Strict` or `Lax`). 

SameSite cookies significantly reduce classical CSRF by preventing third-party sites from sending authentication cookies. However, they do not defend against attacks originating from subdomains or deployments that have been compromised or taken over. For that reason, we should still use antiforgery tokens. Post-login flows may rely on SameSite protections only if the trust boundary ensures no untrusted subdomains or external origins can send authenticated requests.
