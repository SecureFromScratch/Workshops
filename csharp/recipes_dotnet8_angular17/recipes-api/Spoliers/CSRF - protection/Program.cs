using Microsoft.AspNetCore.Antiforgery;
using recipes_api.data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();


// Add services to the container.
// Add the Anti-forgery service to generate and validate tokens
builder.Services.AddAntiforgery(options =>
{
    options.HeaderName = "X-XSRF-TOKEN"; // The header where the CSRF token is expected
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp", builder =>
    {
        builder.WithOrigins("http://localhost:4200") // Allow Angular development server
               .AllowAnyMethod()  // Allow all HTTP methods (GET, POST, etc.)
               .AllowAnyHeader()  // Allow all headers
               .AllowCredentials(); // Allow cookies or other credentials
    });
});


// Add services for anti-forgery
builder.Services.AddMvc();
builder.Services.AddAntiforgery(options => options.HeaderName = "X-XSRF-TOKEN");


var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddSingleton<IRecipeDataLayer>(new RecipeDataLayer(connectionString));


var app = builder.Build();



// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseAuthorization();
app.UseStaticFiles(); 
app.UseRouting();
app.UseCors("AllowAngularApp");
// Middleware to generate CSRF tokens
app.Use((context, next) =>
{
    if (context.Request.Method == HttpMethods.Get)
    {
        // Generate the anti-forgery token and store it in a cookie
        var antiforgery = context.RequestServices.GetService<IAntiforgery>();
        var tokens = antiforgery?.GetAndStoreTokens(context);
        
        context.Response.Cookies.Append("X-XSRF-TOKEN", tokens.RequestToken, new CookieOptions

        {
            HttpOnly = false, // Allow client-side access
            Secure = true, // Change to true if using HTTPS
            SameSite = SameSiteMode.Strict
        });
    }
    return next();
});

// Middleware to validate CSRF tokens for state-changing methods
app.Use((context, next) =>
{
    if (context.Request.Method is "POST" or "PUT" or "DELETE")
    {
        var antiforgery = context.RequestServices.GetService<IAntiforgery>();
        antiforgery?.ValidateRequestAsync(context).GetAwaiter().GetResult();
    }
    return next();
});

app.MapControllers();

app.Run();
