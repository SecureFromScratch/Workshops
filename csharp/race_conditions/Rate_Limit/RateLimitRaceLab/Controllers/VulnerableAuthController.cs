// Controllers/LoginController.cs
using Microsoft.AspNetCore.Mvc;

[ApiController]
// use /auth/login     →  keep Route("auth") + HttpPost("login")
// use /login          →  delete the Route("auth") line and leave HttpPost("/login")
[Route("vulnerable_auth")]
public class LoginController : ControllerBase
{
    private readonly IRateLimiter _limiter;
    public LoginController(IRateLimiter limiter) => _limiter = limiter;


    private const string VALID_USER = "carlos";
    private const string VALID_PASS = "111111";

    // Accept only x-www-form-urlencoded, not multipart
    [HttpPost("login")]
    [Consumes("application/x-www-form-urlencoded")]
    public IActionResult Login([FromForm] string username,
                           [FromForm] string password)
    {
        // use the client IP if available, otherwise fall back to the username
        var key = HttpContext.Connection.RemoteIpAddress?.ToString() ?? username;

        if (_limiter.IsBlocked(key))
            return StatusCode(429, "Too many attempts");

        if (username == VALID_USER && password == VALID_PASS)
            return Ok("Logged in");

        return Unauthorized("Invalid credentials");
    }
}
