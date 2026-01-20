using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Recipes.Api.Services;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using Recipes.Api.Security;


namespace Recipes.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AccountController : ControllerBase
{
   private readonly IUserService m_userService;
   private readonly JwtConfig m_jwtConfig;


   public AccountController(IUserService userService, JwtConfig jwtConfig)
   {
      m_userService = userService;
      m_jwtConfig = jwtConfig;
   }


   public record RegisterRequest(string UserName, string Password);
   public record LoginRequest(string UserName, string Password);
   public record MeResponse(string UserName, string[] Roles);
   public record LoginResponse(string Token, MeResponse User);

   [HttpGet("is-first-user")]
   [AllowAnonymous]
   public async Task<ActionResult<bool>> IsFirstUser()
   {
      return Ok(await m_userService.IsFirstUserAsync());
   }

   [HttpPost("setup")]
   [AllowAnonymous]
   public async Task<IActionResult> Setup([FromBody] RegisterRequest req)
   {
      try
      {
         await m_userService.RegisterFirstAdminAsync(req.UserName, req.Password);
         return NoContent();
      }
      catch (ArgumentException ex)
      {
         return BadRequest(new { error = ex.Message });
      }
      catch (InvalidOperationException ex)
      {
         return Conflict(new { error = ex.Message });
      }
   }

   [HttpPost("register")]
   [AllowAnonymous]
   public async Task<IActionResult> Register([FromBody] RegisterRequest req)
   {
      try
      {

         if (await m_userService.IsFirstUserAsync())
         {
            // Automatically create as admin
            await m_userService.RegisterFirstAdminAsync(req.UserName, req.Password);
         }
         else
         {

            await m_userService.RegisterUserAsync(req.UserName, req.Password, isAdmin: false);
         }
         return NoContent();
      }
      catch (ArgumentException ex)
      {
         return BadRequest(new { error = ex.Message });
      }
   }

   [HttpPost("login")]
   [AllowAnonymous]
   public async Task<IActionResult> Login([FromBody] LoginRequest req)
   {
      var user = await m_userService.FindByUserNameAsync(req.UserName);
      if (user == null || !user.Enabled)
         return Unauthorized(new { error = "Invalid credentials" });

      if (!await m_userService.VerifyPasswordAsync(user, req.Password))
         return Unauthorized(new { error = "Invalid credentials" });

      var roles = user.Roles
         .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
         .ToArray();

      var token = GenerateToken(user.UserName, roles);

      var me = new MeResponse(user.UserName, roles);
      return Ok(new LoginResponse(token, me));
   }

   [HttpPost("logout")]
   public IActionResult Logout()
   {
      // JWT logout is handled client side by deleting token
      return NoContent();
   }

   [HttpGet("me")]
   [Authorize]
   public ActionResult<MeResponse> Me()
   {
      if (!User.Identity?.IsAuthenticated ?? true)
         return Unauthorized();

      var userName = User.Identity!.Name ?? string.Empty;
      var roles = User.Claims
         .Where(c => c.Type == ClaimTypes.Role)
         .Select(c => c.Value)
         .ToArray();

      return Ok(new MeResponse(userName, roles));
   }

   private string GenerateToken(string userName, string[] roles)
   {
      string key = m_jwtConfig.Secret;
      string issuer = m_jwtConfig.Issuer;
      string audience = m_jwtConfig.Audience;

      SymmetricSecurityKey signingKey =
          new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));

      SigningCredentials creds =
          new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);

      List<Claim> claims = new List<Claim>
        {
            new Claim(ClaimTypes.Name, userName)
        };

      foreach (string role in roles)
      {
         claims.Add(new Claim(ClaimTypes.Role, role));
      }

      JwtSecurityToken token = new JwtSecurityToken(
          issuer: issuer,
          audience: audience,
          claims: claims,
          expires: DateTime.UtcNow.AddHours(1),
          signingCredentials: creds);

      return new JwtSecurityTokenHandler().WriteToken(token);
   }

}