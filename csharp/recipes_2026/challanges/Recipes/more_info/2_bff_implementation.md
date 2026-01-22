## Overview
The login endpoint receives credentials, forwards them to a backend API, and if successful, creates an authenticated session for the user.

## Detailed Breakdown

**Endpoint Definition**
Creates a POST endpoint that accepts login requests.
- Creates an HTTP client configured for the backend API
- Forwards the login request to the actual authentication API
(Copy the Recipes.Bff/Controllers/AccountController.cs)

**Forward Request to Backend API**
```csharp
var client = factory.CreateClient("Api");
var resp = await client.PostAsJsonAsync("api/account/login", req);
```
- Creates an HTTP client configured for the backend API
- Forwards the login request to the actual authentication API

**Handle API Errors**
```csharp
if (!resp.IsSuccessStatusCode)
{
   var body = await resp.Content.ReadAsStringAsync();
   return Results.Content(body, "application/json", statusCode: (int)resp.StatusCode);
}
```
If authentication fails, returns the error response directly to the client.

**Process Successful Login**
```csharp
var login = await resp.Content.ReadFromJsonAsync<LoginResponse>();
```
Deserializes the API response containing user details and an access token.

**Create Claims for Session**
```csharp
var claims = new List<Claim>
{
   new(ClaimTypes.Name, login.User.UserName),
   new("access_token", login.Token)
};

foreach (var role in login.User.Roles)
{
   claims.Add(new Claim(ClaimTypes.Role, role));
}
```
Creates a claims collection containing:
- Username
- Access token (stored securely in the session)
- User roles for authorization

**Establish Authenticated Session**
```csharp
var identity = new ClaimsIdentity(claims, "bff");
var principal = new ClaimsPrincipal(identity);

await http.SignInAsync("bff", principal, new AuthenticationProperties
{
   IsPersistent = true,
   ExpiresUtc = DateTimeOffset.UtcNow.AddHours(1)
});
```
- Creates a claims-based identity
- Signs the user into a cookie-based session (scheme: "bff")
- Session persists across browser sessions and expires in 1 hour

The claims are **automatically protected** by ASP.NET Core's cookie authentication middleware when you call:

```csharp
await http.SignInAsync("bff", principal, new AuthenticationProperties {...});
```

## Built-in Protection

When you sign in with cookie authentication, ASP.NET Core automatically:

1. **Serializes** the `ClaimsPrincipal` (including all claims)
2. **Encrypts** the serialized data using the Data Protection API (DPAPI)
3. **Signs** the encrypted data to prevent tampering
4. **Stores** it in a cookie sent to the client

## The Claims Journey

```
Claims in Memory → Serialization → Encryption → MAC/Signature → Cookie
```

**What's encrypted in the cookie:**
- Username (`ClaimTypes.Name`)
- Access token (`"access_token"` claim) ← **This is the JWT stored securely**
- User roles (`ClaimTypes.Role`)
- Authentication scheme metadata

## Why This Matters

The JWT token extracted from the backend API response (`login.Token`) is stored as a claim:

```csharp
new("access_token", login.Token)  // JWT stored here
```

This JWT is then:
- ✅ **Encrypted** in the session cookie (client can't read it)
- ✅ **Protected** from tampering
- ✅ **Available server-side** for subsequent API calls
- ✅ **Never exposed** to JavaScript in the browser

## Configuration Required

For this to work securely, you need cookie authentication configured in your startup/program.
Add a BffAuthExtension and use it in the program.cs


 **Return Response**
```csharp
return Results.Ok(login.User);
```
Returns only the user information to the frontend—**not the access token**, which is kept secure in the server-side session.

## Key Security Pattern
This BFF pattern is secure because:
- The access token never reaches the frontend (stored in server-side session)
- Frontend only receives a session cookie
- Subsequent API calls can use the stored token from the session
- Reduces risk of token theft via XSS attacks