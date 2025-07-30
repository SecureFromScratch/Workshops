// Controllers/LoginController.cs
using Microsoft.AspNetCore.Mvc;

[ApiController]
// use /auth/login     →  keep Route("auth") + HttpPost("login")
// use /login          →  delete the Route("auth") line and leave HttpPost("/login")
[Route("auth")]
[Consumes("application/x-www-form-urlencoded")]
[Route("[controller]")]
public class RedisLoginController : ControllerBase
{
    private readonly IRedisRateLimiter _limiter;

    public RedisLoginController(IRedisRateLimiter limiter) => _limiter = limiter;
    private const string VALID_USER = "carlos";
    private const string VALID_PASS = "111111";


    [HttpPost("login")]
    public async Task<IActionResult> Login([FromForm] string username,
                                           [FromForm] string password)
    {
        var key = HttpContext.Connection.RemoteIpAddress?.ToString() ?? username;

        if (await _limiter.IsBlockedAsync($"login:{key}"))
            return StatusCode(429, "Too many attempts");

        return (username == VALID_USER && password == VALID_PASS)
               ? Ok("Logged in")
               : Unauthorized("Invalid credentials");
    }
    
    
}
