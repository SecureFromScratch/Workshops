using System.Net;
using System.Net.Http.Json;
using System.Security.Claims;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Recipes.Bff.Controllers;

[ApiController]
[Route("bff/account")]
public sealed class AccountBffController : ControllerBase
{
    private readonly IHttpClientFactory m_factory;
    private readonly IAntiforgery _antiforgery;

    public AccountBffController(IHttpClientFactory factory, IAntiforgery antiforgery)
    {
        m_factory = factory;
        _antiforgery = antiforgery;
    }

    [HttpGet("/bff/unauthorized")]
    public IActionResult UnauthorizedEndpoint() => Unauthorized();

    [HttpGet("antiforgery")]
    [AllowAnonymous]
    [IgnoreAntiforgeryToken]
    public IActionResult GetAntiforgeryToken()
    {
        var tokens = _antiforgery.GetAndStoreTokens(HttpContext);

        // The cookie is set automatically by GetAndStoreTokens
        // Return the REQUEST token so Angular knows what to send in the header
        return Ok(new { token = tokens.RequestToken });
    }

    [HttpPost("login")]    
    [AllowAnonymous]   
    public async Task<IActionResult> Login([FromBody] LoginRequest req)
    {       

        // Check what name AddBffAuthAndApiClient uses - might be "BffApiClient" or "Api"
        var client = m_factory.CreateClient("Api");

        var resp = await client.PostAsJsonAsync("api/account/login", req, HttpContext.RequestAborted);

        if (!resp.IsSuccessStatusCode)
        {
            var body = await resp.Content.ReadAsStringAsync(HttpContext.RequestAborted);
            return new ContentResult
            {
                Content = body,
                ContentType = "application/json",
                StatusCode = (int)resp.StatusCode
            };
        }

        var login = await resp.Content.ReadFromJsonAsync<LoginResponse>(cancellationToken: HttpContext.RequestAborted);
        if (login is null)
            return StatusCode((int)HttpStatusCode.InternalServerError);

        var claims = new List<Claim>
        {
            new(ClaimTypes.Name, login.User.UserName),
            new("access_token", login.Token)
        };

        foreach (var role in login.User.Roles)
            claims.Add(new Claim(ClaimTypes.Role, role));

        var identity = new ClaimsIdentity(claims, "bff");
        var principal = new ClaimsPrincipal(identity);

        await HttpContext.SignInAsync("bff", principal, new AuthenticationProperties
        {
            IsPersistent = true,
            ExpiresUtc = DateTimeOffset.UtcNow.AddHours(1)
        });

        return Ok(login.User);
    }

    [HttpPost("logout")]
    [Authorize(AuthenticationSchemes = "bff")]
    public async Task<IActionResult> Logout()
    {
        await HttpContext.SignOutAsync("bff");
        return NoContent();
    }

    [HttpGet("me")]
    [Authorize(AuthenticationSchemes = "bff")]
    public IActionResult Me()
    {
        var name = User.Identity?.Name ?? string.Empty;
        var roles = User.Claims
           .Where(c => c.Type == ClaimTypes.Role)
           .Select(c => c.Value)
           .ToArray();

        return Ok(new MeResponse(name, roles));
    }

    [HttpGet("is-first-user")]
    [AllowAnonymous]
    [IgnoreAntiforgeryToken]
    public async Task<IActionResult> IsFirstUser()
    {
        var client = m_factory.CreateClient("BffApiClient");
        var resp = await client.GetAsync("api/account/is-first-user", HttpContext.RequestAborted);
        var body = await resp.Content.ReadAsStringAsync(HttpContext.RequestAborted);
        return new ContentResult
        {
            Content = body,
            ContentType = "application/json",
            StatusCode = (int)resp.StatusCode
        };
    }

    [HttpPost("setup")]
    [AllowAnonymous]
    [ValidateAntiForgeryToken] // CSRF protection for signup
    public async Task<IActionResult> Setup([FromBody] LoginRequest req)
    {
        var client = m_factory.CreateClient("BffApiClient");
        var resp = await client.PostAsJsonAsync("api/account/setup", req, HttpContext.RequestAborted);
        var body = await resp.Content.ReadAsStringAsync(HttpContext.RequestAborted);
        return new ContentResult
        {
            Content = body,
            ContentType = "application/json",
            StatusCode = (int)resp.StatusCode
        };
    }

    [HttpPost("register")]
    [AllowAnonymous]    
    public async Task<IActionResult> Register([FromBody] LoginRequest req)
    {
        var client = m_factory.CreateClient("Api");
        var resp = await client.PostAsJsonAsync("api/account/register", req, HttpContext.RequestAborted);
        var body = await resp.Content.ReadAsStringAsync(HttpContext.RequestAborted);
        return new ContentResult
        {
            Content = body,
            ContentType = "application/json",
            StatusCode = (int)resp.StatusCode
        };
    }

    [HttpGet("debug-antiforgery")]
    [AllowAnonymous]
    [IgnoreAntiforgeryToken]
    public IActionResult DebugAntiforgery()
    {
        var tokens = _antiforgery.GetAndStoreTokens(HttpContext);
        return Ok(new
        {
            cookieName = "bff-xsrf",
            headerName = "X-XSRF-TOKEN",
            cookieToken = tokens.CookieToken,
            requestToken = tokens.RequestToken,
            cookieValue = Request.Cookies["bff-xsrf"],
            headerValue = Request.Headers["X-XSRF-TOKEN"].ToString()
        });
    }

    public record LoginRequest(string UserName, string Password);
    public record MeResponse(string UserName, string[] Roles);
    public record LoginResponse(string Token, MeResponse User);
}