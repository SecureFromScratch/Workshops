/*using StackExchange.Redis;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

// one Redis connection for the entire app
builder.Services.AddSingleton<IConnectionMultiplexer>(
    _ => ConnectionMultiplexer.Connect("localhost:6379"));

// register the limiter
builder.Services.AddSingleton<IRateLimiter>(sp =>
    new RedisRateLimiter(
        sp.GetRequiredService<IConnectionMultiplexer>(),
        maxPerWindow: 2,
        window: TimeSpan.FromSeconds(1)));

var app = builder.Build();
app.MapControllers();
app.Run();
*/
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;

var builder = WebApplication.CreateBuilder(args);

// MVC / minimal-API controllers
builder.Services.AddControllers();

/* ----------------------------------------------------------
   Register YOUR in-memory limiter as a singleton.
   If you defined an interface (e.g., IRateLimiter) and
   RateLimiter implements it, use the first line.
   Otherwise use the second line.
   ---------------------------------------------------------- */

// Option A – RateLimiter implements IRateLimiter
builder.Services.AddSingleton<IRateLimiter, RateLimiter>();

// Option B – no interface, inject the concrete type
// builder.Services.AddSingleton<RateLimiter>();

var app = builder.Build();

app.MapControllers();   // e.g., /auth/login
app.Run();

