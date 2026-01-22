// Infrastructure/ApiAccessTokenHandler.cs
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

public sealed class ApiAccessTokenHandler : DelegatingHandler
{
    private readonly IHttpContextAccessor m_httpContextAccessor;
    private readonly ILogger<ApiAccessTokenHandler> m_logger;

    public ApiAccessTokenHandler(
        IHttpContextAccessor a_httpContextAccessor,
        ILogger<ApiAccessTokenHandler> a_logger)
    {
        m_httpContextAccessor = a_httpContextAccessor;
        m_logger = a_logger;
    }

    protected override async Task<HttpResponseMessage> SendAsync(
        HttpRequestMessage a_request,
        CancellationToken a_cancellationToken)
    {
        HttpContext? context = m_httpContextAccessor.HttpContext;

        if (context != null &&
            context.User.Identity != null &&
            context.User.Identity.IsAuthenticated)
        {
            string? accessToken = context.User.FindFirst("access_token")?.Value;

            if (!string.IsNullOrEmpty(accessToken))
            {
                a_request.Headers.Authorization =
                    new AuthenticationHeaderValue("Bearer", accessToken);

                m_logger.LogDebug(
                    "Added Authorization header for user {Name}",
                    context.User.Identity.Name);
            }
            else
            {
                m_logger.LogWarning(
                    "Authenticated user {Name} has no access_token claim.",
                    context.User.Identity.Name);
            }
        }
        else
        {
            m_logger.LogDebug("Unauthenticated request; no Authorization header added.");
        }

        return await base.SendAsync(a_request, a_cancellationToken);
    }
}
