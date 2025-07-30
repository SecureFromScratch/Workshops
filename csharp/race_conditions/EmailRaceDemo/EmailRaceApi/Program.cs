using EmailRaceDemo.Controllers;
using EmailRaceDemo.Data;
using EmailRaceDemo.Models;
using Microsoft.EntityFrameworkCore;


var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddControllers();
builder.Services.AddDbContext<AppDb>(opt =>
   opt.UseSqlite("Data Source=email_demo.db"));


builder.Services.AddSingleton<IEmailSvc, ConsoleEmailSvc>();


var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapControllers();

// ב-Program.cs, לפני app.Run();
using (var scope = app.Services.CreateScope())
{
   var db = scope.ServiceProvider.GetRequiredService<AppDb>();
   if (!db.Users.Any())
   {
      db.Users.Add(new User { Email = "attacker@exploit.com" });
      db.SaveChanges();
   }
}


app.Run();





