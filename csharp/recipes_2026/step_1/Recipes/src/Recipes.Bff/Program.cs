var builder = WebApplication.CreateBuilder(args);

// Get the API base address from the YARP config
var apiAddress = builder.Configuration[
    "ReverseProxy:Clusters:apiCluster:Destinations:api:Address"
] ?? throw new InvalidOperationException("API address is not configured");

builder.Services.AddHttpClient("Api", client =>
{
    client.BaseAddress = new Uri(apiAddress);
});

builder.Services
    .AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

var app = builder.Build();

// BFF /health that calls API /health
app.MapGet("/health", async (IHttpClientFactory httpClientFactory, CancellationToken ct) =>
{
    var client = httpClientFactory.CreateClient("Api");

    try
    {
        // BaseAddress is "http://localhost:7000/", so "health" -> "http://localhost:7000/health"
        var response = await client.GetAsync("health", ct);

        if (response.IsSuccessStatusCode)
        {
            return Results.Ok(new
            {
                status = "ok",
                api = "up"
            });
        }

        return Results.Problem(
            statusCode: StatusCodes.Status503ServiceUnavailable,
            title: "API health check failed",
            detail: $"API returned status code {(int)response.StatusCode}"
        );
    }
    catch (Exception ex)
    {
        return Results.Problem(
            statusCode: StatusCodes.Status503ServiceUnavailable,
            title: "API health check error",
            detail: ex.Message
        );
    }
});

// Important: map health BEFORE the proxy so it is not proxied
app.MapReverseProxy();

app.Run();
