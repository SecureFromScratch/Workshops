var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddControllers(); // ✅ Register controllers

var app = builder.Build();
Database.Initialize();

app.UseHttpsRedirection();

app.MapControllers(); // ✅ Enable routing to your controller

app.Run();
