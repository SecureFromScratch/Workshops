// Controllers/BffAntiforgeryController.cs

using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Recipes.Bff.Controllers
{
    [ApiController]
    [Route("bff")]
    public class BffAntiforgeryController : ControllerBase
    {
        [HttpGet("antiforgery")]
        [IgnoreAntiforgeryToken] 
        [AllowAnonymous]         
        public IActionResult GetAntiforgeryToken([FromServices] IAntiforgery antiforgery)
        {
            AntiforgeryTokenSet tokens = antiforgery.GetAndStoreTokens(HttpContext);

            return Ok(new
            {
                token = tokens.RequestToken
            });
        }
    }
}
