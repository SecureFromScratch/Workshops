// Extensions/BffAuthExtensions.cs
using System;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Recipes.Bff.Extensions
{
    public static class BffAuthExtensions
    {
        public static IServiceCollection AddBffAuthAndApiClient(
            this IServiceCollection services,
            IConfiguration configuration)
        {
            var apiAddress = configuration["ReverseProxy:Clusters:apiCluster:Destinations:api:Address"
];


            services.AddHttpClient("Api", client =>
            {
                client.BaseAddress = new Uri(apiAddress);
            });

            services.AddAuthentication("bff")
                .AddCookie("bff", options =>
                {
                    options.Cookie.HttpOnly = true;
                    options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
                    options.Cookie.SameSite = SameSiteMode.Strict;
                });

            return services;
        }
    }
}
