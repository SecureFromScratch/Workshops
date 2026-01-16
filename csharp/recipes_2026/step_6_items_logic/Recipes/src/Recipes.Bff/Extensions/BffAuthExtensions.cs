using System;
using System.Net.Http.Headers;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Http;
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
            var apiAddress = configuration["ReverseProxy:Clusters:apiCluster:Destinations:api:Address"];
            
            if (string.IsNullOrWhiteSpace(apiAddress))
            {
                throw new InvalidOperationException(
                    "API address is not configured at ReverseProxy:Clusters:apiCluster:Destinations:api:Address"
                );
            }

            // Register the handler
            services.AddTransient<BffApiClientHandler>();

            // Register HttpClient with handler AND BaseAddress
            services.AddHttpClient("Api", client =>
            {
                client.BaseAddress = new Uri(apiAddress); // Make sure this is set!
            })
            .AddHttpMessageHandler<BffApiClientHandler>();

            services.AddAuthentication("bff")
            .AddCookie("bff", options =>
            {
                options.Cookie.Name = "bff";                 
                options.Cookie.HttpOnly = true;
                options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
                options.Cookie.SameSite = SameSiteMode.Lax;           
            });

            return services;
        }
    }

    // Handler to attach JWT to API calls
    public sealed class BffApiClientHandler : DelegatingHandler
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public BffApiClientHandler(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        protected override Task<HttpResponseMessage> SendAsync(
            HttpRequestMessage request,
            CancellationToken cancellationToken)
        {
            var httpContext = _httpContextAccessor.HttpContext;
            if (httpContext?.User.Identity?.IsAuthenticated == true)
            {
                var token = httpContext.User.FindFirst("access_token")?.Value;
                if (!string.IsNullOrEmpty(token))
                {
                    request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
                }
            }

            return base.SendAsync(request, cancellationToken);
        }
    }
}