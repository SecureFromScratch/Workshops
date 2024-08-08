// header
using Microsoft.AspNetCore.Antiforgery;

using recipes_api.data;

builder.Services.AddAntiforgery(options =>
{
    options.HeaderName = "X-XSRF-TOKEN"; // The header where the CSRF token is expected
});
//---------------------------------------------------------------------------------

//var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
//builder.Services.AddSingleton<IRecipeDataLayer>(new RecipeDataLayer(connectionString));

//.......

// app.UseCors("AllowAngularApp");

//---------------------------------------------------------------------------------

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

//---------------------------------------------------------------------------------
// app.MapControllers();
