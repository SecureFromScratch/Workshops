# Dealing with Antiforgery Tokens in Angular

Support CSRF in the authentication service.
There should be one method that fetches the token from the BFF and a getter.
You can copy `app/services/auth.service.ts` from the repo.

Call the CSRF initialization from `app.component.ts` in `OnInit`:

```
firstValueFrom(this.auth.initCsrf());
```

Use the CSRF interceptor so every request sends the CSRF cookie token and header.
You can copy it from `/interceptors/csrf.interceptor.ts` and register it under `providers` in `app.config.ts`.
