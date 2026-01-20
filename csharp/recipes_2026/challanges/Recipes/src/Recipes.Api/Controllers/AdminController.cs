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
      return Ok(new
      {
         message =
              "The number 42 is, in The Hitchhiker’s Guide to the Galaxy by Douglas Adams, the Answer to the Ultimate Question of Life, the Universe, and Everything, calculated by an enormous supercomputer named Deep Thought over a period of 7.5 million years. Unfortunately, no one knows what the question is. To discover the Ultimate Question, a special computer the size of a small planet was built from organic components and named Earth."
      });


   }
}