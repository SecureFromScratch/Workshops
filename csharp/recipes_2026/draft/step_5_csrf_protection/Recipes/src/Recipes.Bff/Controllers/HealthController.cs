// Controllers/HealthController.cs
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Recipes.Bff.Controllers
{
    [ApiController]
    [Route("health")]
    public class HealthController : ControllerBase
    {
        private readonly IHttpClientFactory _httpClientFactory;

        public HealthController(IHttpClientFactory httpClientFactory)
        {
            _httpClientFactory = httpClientFactory;
        }

        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status503ServiceUnavailable)]
        [AllowAnonymous] // usually health should be anonymous
        public async Task<IActionResult> Get(CancellationToken ct)
        {
            HttpClient client = _httpClientFactory.CreateClient("Api");
            HttpResponseMessage response = await client.GetAsync("/api/health", ct);

            if (response.IsSuccessStatusCode)
            {
                return Ok(new { status = "ok", api = "up" });
            }

            return Problem(
                statusCode: StatusCodes.Status503ServiceUnavailable,
                title: "API health check failed",
                detail: $"API returned status code {(int)response.StatusCode}"
            );
        }
    }
}
