# CSRF Protection
The best thing we can do is disable the CORS policy and remove the third party from the server’s allowed list. Sometimes it’s a business requirement to support them. We trust this third party, but if they are taken over or exposed to an XSS attack, we should have the antiforgery token in place. To verify that you applied the fix correctly, don’t touch the CORS policy yet. Do it only after handling the antiforgery token.

## Remove CORS policy:
   - Re-run attack
   - **Result**: Blocked (OPTIONS returns 405)

## Enable Antiforgery Tokens:
   Create AntiforgeryController 
   The controller generates a new antiforgery token pair, writes the cookie token to the response so the browser stores it automatically, and returns the request token in the JSON payload so the frontend can attach it to subsequent state-changing requests. This establishes the two-part verification mechanism required by antiforgery: one secret delivered via cookie and the other delivered via request data, which the server later validates together to prevent forged authenticated requests.

   you can copy Controllers/BffAntiforgeryController.cs from the repo.
## Add the csrf cookie extension
you can copy Extensions/ConfigureBffAntiforgeryCookie.cs from the repo.
and register it in the program.cs:

   ```csharp
   builder.Services.AddBffAntiforgery();
   ```
## Validate the antforgery token
When the login is performed make sure to validate the antyforgery token.
You have to inject IAntiforgery interface to the constructor and use the ValidateAntiForgeryToken
attribute above the login method. 
you can copy Controllers/AccountController.cs from the repo.

   
   Re-run attack:

   1. Does the csrfPoC work?
   2. Does login from Angular work?

## Dealing with Antiforgery Tokens in Angular:


        

    

   
   
