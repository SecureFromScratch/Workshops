using Serilog;
using SecureFromScratch.Quiz.Config;

LoggerConfig.Configure();       // ✅ Call your custom method
var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog();      // ✅ Plug Serilog into ASP.NET

builder.Services.AddControllers();
builder.Services.AddSingleton<SecureFromScratch.Quiz.Services.MultipleChoiceQuestion>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage(); // shows detailed errors
}
else
{    
    app.UseExceptionHandler("/error"); // generic error endpoint
    app.UseHsts();    
}

app.Map("/error", () => Results.Problem("An unexpected error occurred."));
app.UseDefaultFiles();
app.UseStaticFiles();

app.MapControllers();




app.Run();
