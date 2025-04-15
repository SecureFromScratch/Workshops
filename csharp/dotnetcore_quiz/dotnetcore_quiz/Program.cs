using Serilog;
using SecureFromScratch.Quiz.Config;

LoggerConfig.Configure();       // ✅ Call your custom method
var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog();      // ✅ Plug Serilog into ASP.NET

builder.Services.AddControllers();
builder.Services.AddSingleton<SecureFromScratch.Quiz.Services.MultipleChoiceQuestion>();

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

app.MapControllers();
app.Run();
