var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();
var app = builder.Build();

app.MapControllers();          // enable attribute-routed controllers
app.Run("http://localhost:5107");