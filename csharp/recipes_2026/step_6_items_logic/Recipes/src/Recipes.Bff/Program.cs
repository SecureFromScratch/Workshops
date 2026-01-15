using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Mvc;
using Recipes.Bff.Extensions;
using Recipes.Bff.Options;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllersWithViews(options =>
{
    options.Filters.Add(new AutoValidateAntiforgeryTokenAttribute());
});
builder.Services.AddHttpContextAccessor();

builder.Services.AddTransient<ApiAccessTokenHandler>();

builder.Services
    .AddHttpClient("Api", client =>
    {
        client.BaseAddress = new Uri("http://localhost:7000/");
    })
    .AddHttpMessageHandler<ApiAccessTokenHandler>();

//builder.Services.AddTransient<BffAccessTokenHandler>();
builder.Services.AddBffAntiforgery();
builder.Services.AddAuthorization();


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
