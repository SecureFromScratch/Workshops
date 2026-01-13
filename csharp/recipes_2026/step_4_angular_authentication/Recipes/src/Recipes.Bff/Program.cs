using Recipes.Bff.Extensions;
using Recipes.Bff.Options;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddAntiforgery();

builder.Services.Configure<ApiOptions>(options =>
{
    options.BaseAddress = builder.Configuration[
        "ReverseProxy:Clusters:apiCluster:Destinations:api:Address"
    ] ?? throw new InvalidOperationException("API address is not configured");
});

builder.Services.AddBffAuthAndApiClient(builder.Configuration);

builder.Services
    .AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));




var app = builder.Build();
app.MapControllers();
// BFF /health that calls API /health
app.MapGet("/health", async (IHttpClientFactory httpClientFactory, CancellationToken ct) =>
{
    var client = httpClientFactory.CreateClient("Api");
    var response = await client.GetAsync("/api/health", ct);

    if (response.IsSuccessStatusCode)
    {
        return Results.Ok(new { status = "ok", api = "up" });
    }

    return Results.Problem(
        statusCode: StatusCodes.Status503ServiceUnavailable,
        title: "API health check failed",
        detail: $"API returned status code {(int)response.StatusCode}"
    );
});

// Important: map health BEFORE the proxy so it is not proxied
app.MapReverseProxy();



app.Run();
