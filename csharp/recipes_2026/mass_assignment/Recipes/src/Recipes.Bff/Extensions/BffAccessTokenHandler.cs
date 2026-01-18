// Security/BffAccessTokenHandler.cs
using System.Net.Http;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace Recipes.Bff.Extensions
{
    public sealed class BffAccessTokenHandler : DelegatingHandler
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public BffAccessTokenHandler(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        protected override Task<HttpResponseMessage> SendAsync(
    HttpRequestMessage request,
    CancellationToken cancellationToken)
        {
            HttpContext? httpContext = _httpContextAccessor.HttpContext;
            ClaimsPrincipal? user = httpContext?.User;

            if (user?.Identity?.IsAuthenticated == true)
            {
                string? token = user.FindFirst("access_token")?.Value;
                Console.WriteLine($"[BFF] Authenticated: {user.Identity.AuthenticationType}");
                Console.WriteLine($"[BFF] access_token length: {token?.Length ?? 0}");

                if (!string.IsNullOrEmpty(token))
                {
                    request.Headers.Authorization =
                        new AuthenticationHeaderValue("Bearer", token);
                    Console.WriteLine($"[BFF] Outgoing Authorization header: {request.Headers.Authorization}");
                }
                else
                {
                    Console.WriteLine("[BFF] No access_token claim found.");
                }
            }
            else
            {
                Console.WriteLine("[BFF] User not authenticated in HttpContext.");
            }

            return base.SendAsync(request, cancellationToken);
        }

    }
}
