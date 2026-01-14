# CSRF Protection


## Remove CORS policy:
   - Re-run attack
   - **Result**: Blocked (OPTIONS returns 405)

## Enable Antiforgery Tokens:
   ```csharp
   builder.Services.AddAntiforgery();
   
   [ValidateAntiForgeryToken]
   public IActionResult Login(...) { }
   ```
   - Re-run attack
   - **Result**: Blocked 


