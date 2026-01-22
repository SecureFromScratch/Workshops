# CSRF (Cross-Site Request Forgery) Security Lab

## Educational Purpose

This lab demonstrates **CSRF attacks and defenses** in a modern ASP.NET Core BFF (Backend-For-Frontend) architecture. Students will learn how various security mechanisms work together to prevent unauthorized requests.

---

## Learning Objectives

By completing this lab, you will understand:

1. **What is CSRF** and why it's dangerous
2. **How browser security works** (Same-Origin Policy, CORS, SameSite cookies)
3. **Defense mechanisms** and when each applies
4. **Why defense-in-depth matters** in web security

---

## Architecture

```
┌─────────────────┐         ┌──────────────┐         ┌─────────────┐
│  Attack Page    │  POST   │     BFF      │  Proxy  │  Backend    │
│ localhost:8888  │────────>│ localhost:4200│────────>│   API       │
└─────────────────┘         └──────────────┘         └─────────────┘
```

- **Attack Page**: Simulated malicious website (CSRF PoC)
- **BFF**: Backend-For-Frontend with authentication
- **Backend API**: Your actual API server

---

## 🔐 Security Layers Explored

### Layer 1: Same-Origin Policy (SOP)
**What it does**: Browser restricts scripts from one origin accessing resources from another origin.

**Example**:
- Origin A: `http://localhost:8888`
- Origin B: `http://localhost:4200`
- Different ports = Different origins!

**Key Concept**: 
```
Origin = Protocol + Domain + Port
http://localhost:4200  ≠  http://localhost:8888
```

### Layer 2: CORS (Cross-Origin Resource Sharing)
**What it does**: Allows servers to specify which origins can access their resources.

**Without CORS**:
```
Browser: Can I make a request from localhost:8888 to localhost:4200?
Server: (no CORS policy)
Browser: Blocked!
```

**With CORS**:
```csharp
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:8888")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});
```

** Security Note**: CORS is a **trust list**. If you allow an origin in CORS, you're saying "I trust this origin to make authenticated requests."

### Layer 3: SameSite Cookies
**What it does**: Controls when browsers send cookies with cross-site requests.

| Setting | When Cookies Are Sent | Use Case |
|---------|----------------------|----------|
| `Strict` | Only same-site requests | Maximum security (default for sensitive apps) |
| `Lax` | Same-site + top-level navigation | Standard web apps |
| `None` | All requests (requires HTTPS) | Cross-domain authentication, iframes |

**Example Configuration**:
```csharp
options.Cookie.SameSite = SameSiteMode.Strict;
options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
options.Cookie.HttpOnly = true;
```

### Layer 4: Antiforgery Tokens
**What it does**: Ensures requests originate from your legitimate application, not malicious scripts.

**How it works**:
1. Server generates unique token per session
2. Token embedded in forms/headers
3. Server validates token on state-changing requests

**Implementation**:
```csharp
// Startup
builder.Services.AddAntiforgery();

// Controller
[HttpPost]
[ValidateAntiForgeryToken]
public IActionResult Login(LoginModel model)
{
    // Process login
}
```

---

## 🧪 Lab Experiments

**Attack**:
Serve the test/csrfPoC.html file and examine the results.


**Result**:  **Attack succeeds!**
- Status 200 + BFF Cookie
- CORS allows the origin
- Server authenticates the request

**Lesson**: Permissive CORS *Vulnerable to CSRF** from whitelisted origins!

---

