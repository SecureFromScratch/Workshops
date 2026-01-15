using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Claims;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Recipes.Bff.Controllers;

[ApiController]
[Route("bff/recipes")]
[Authorize(AuthenticationSchemes = "bff")]
public sealed class RecipesBffController : ControllerBase
{
    private readonly IHttpClientFactory m_factory;
    private readonly IAntiforgery _antiforgery;
    private readonly ILogger<RecipesBffController> _logger;



    public RecipesBffController(IHttpClientFactory factory, IAntiforgery antiforgery,
    ILogger<RecipesBffController> logger)
    {
        m_factory = factory;
        _antiforgery = antiforgery;
        _logger = logger;

    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Add([FromBody] RecipeRequest req)
    {
        var http = HttpContext;

        RecipeRequest enrichedReq = req with
        {
            CreatedBy = User.Identity?.Name ?? string.Empty
        };       


        var client = m_factory.CreateClient("Api");
        var resp = await client.PostAsJsonAsync("api/recipes", enrichedReq, HttpContext.RequestAborted);

        if (!resp.IsSuccessStatusCode)
        {
            var body = await resp.Content.ReadAsStringAsync(HttpContext.RequestAborted);
            _logger.LogWarning(
       "API POST /api/recipes returned {StatusCode}. Body: {Body}",
       resp.StatusCode,
       body);

            return new ContentResult
            {
                Content = body,
                ContentType = "application/json",
                StatusCode = (int)resp.StatusCode
            };

        }

        var result = await resp.Content.ReadFromJsonAsync<RecipeResponse>(cancellationToken: HttpContext.RequestAborted);
        if (result is null)
            return StatusCode((int)HttpStatusCode.InternalServerError);



        return Ok(result.Status);
    }


    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        _logger.LogInformation("User authenticated: {Auth}, name: {Name}",
            User.Identity?.IsAuthenticated,
            User.Identity?.Name);

        HttpClient client = m_factory.CreateClient("Api");

        HttpResponseMessage resp =
            await client.GetAsync("api/recipes", HttpContext.RequestAborted);

        string body =
            await resp.Content.ReadAsStringAsync(HttpContext.RequestAborted);

        return new ContentResult
        {
            Content = body,
            ContentType = "application/json",
            StatusCode = (int)resp.StatusCode
        };
    }



    public sealed record RecipeRequest(
      string Name,
      string Description,
      int Status,
      string Photo,
      string CreatedBy = ""
  );

    public sealed record RecipeResponse(
        int Status,
        string Msg
    );


}