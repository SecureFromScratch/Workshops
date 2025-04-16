using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using recipes_api.data;
using recipes_api.Models;
using recipes_api.utils;
using recipes_api.attributes;


namespace recipes_api.Controllers
{

    public static class UserStore
    {
        public static readonly Dictionary<string, string> Users = new();
    }

    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            if (UserStore.Users.TryGetValue(request.Username, out var pw) && pw == request.Password)
            {
                return Ok(new { success = true, username = request.Username });
            }

            return Unauthorized(new { success = false, message = "Invalid credentials" });
        }

    }
}
