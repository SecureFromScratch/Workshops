using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Mvc;
using Recipes.Bff.Extensions;
using Recipes.Bff.Options;

var builder = WebApplication.CreateBuilder(args);

var apiAddress = builder.Configuration[
    "ReverseProxy:Clusters:apiCluster:Destinations:api:Address"
];
if (string.IsNullOrWhiteSpace(apiAddress))
{
    throw new InvalidOperationException(
        "API address is not configured at ReverseProxy:Clusters:apiCluster:Destinations:api:Address"
    );
}
builder.Services.AddControllersWithViews(options =>
{
    options.Filters.Add(new AutoValidateAntiforgeryTokenAttribute());
});

// Sending JWT to API
builder.Services.AddHttpContextAccessor();

builder.Services.AddTransient<ApiAccessTokenHandler>();

builder.Services
    .AddHttpClient("Api", client =>
    {
        client.BaseAddress = new Uri(apiAddress);
    })
    .AddHttpMessageHandler<ApiAccessTokenHandler>();

builder.Services.AddBffAntiforgery();
builder.Services.AddAuthorization();


builder.Services.Configure<ApiOptions>(options =>
{
    options.BaseAddress = apiAddress;
});

builder.Services.AddBffAuthAndApiClient(builder.Configuration);

builder.Services
    .AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));


builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:8888", "http://127.0.0.1:8888", "http://localhost:4200")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
              
    });
});


var app = builder.Build();

app.UseCors();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.MapReverseProxy();

app.Run();
