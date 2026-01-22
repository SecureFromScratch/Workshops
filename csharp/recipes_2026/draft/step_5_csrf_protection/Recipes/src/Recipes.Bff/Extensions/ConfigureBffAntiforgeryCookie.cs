// Security/AntiforgeryServiceCollectionExtensions.cs
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;

namespace Recipes.Bff.Extensions
{
    public static class AntiforgeryServiceCollectionExtensions
    {
        public static IServiceCollection AddBffAntiforgery(this IServiceCollection services)
        {
            services.AddAntiforgery(options =>
            {
                options.Cookie.Name = "bff-xsrf";
                options.Cookie.HttpOnly = false; // for dev / JS access
                options.Cookie.SameSite = SameSiteMode.Lax;
                options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest; // dev only
                options.HeaderName = "X-CSRF-TOKEN";
            });

            return services;
        }
    }
}
