using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Recipes.Api.Data;
using Recipes.Api.Models;
using Recipes.Api.Security;
using Recipes.Api.Serrvices;
using Recipes.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// database
string connectionString = await SecretsConfig.GetDbConnectionStringAsync(builder.Configuration);

builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseSqlServer(connectionString);
});

JwtConfig jwtConfig       = await SecretsConfig.GetJwtConfigAsync(builder.Configuration);




builder.Services.AddJwtAuth(jwtConfig);

builder.Services.AddControllers();
// Authentication
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IPasswordHasher<AppUser>, PasswordHasher<AppUser>>();

//Items
builder.Services.AddScoped<IRecipeService, RecipeService>();

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerWithJwtAuth();   


var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.MapControllers();
app.MapGet("/api/health", () => Results.Ok(new { status = "ok" }))
.WithOpenApi();

app.Run();

