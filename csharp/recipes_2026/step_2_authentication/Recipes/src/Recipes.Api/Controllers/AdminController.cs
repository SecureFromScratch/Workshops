using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Recipes.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "AdminOnly")]
public class AdminController : ControllerBase
{
   [HttpGet("dashboard")]
   public IActionResult Dashboard()
   {
      return Ok(new { message = "Admin only dashboard" });
   }
}