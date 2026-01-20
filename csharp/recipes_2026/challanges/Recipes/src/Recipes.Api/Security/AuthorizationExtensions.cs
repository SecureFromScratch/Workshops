using Microsoft.AspNetCore.Authorization;

namespace Recipes.Api.Extensions;

public static class AuthorizationExtensions
{
    public static IServiceCollection AddAuthorizationPolicies(this IServiceCollection services)
    {
        services.AddAuthorization(options =>
        {
            // Admin Only Policy
            options.AddPolicy("AdminOnly", policy =>
            {
                policy.RequireAuthenticatedUser();
                policy.RequireRole("Admin");
            });

            // User or Admin Policy
            options.AddPolicy("UserOrAdmin", policy =>
            {
                policy.RequireAuthenticatedUser();
                policy.RequireRole("User", "Admin");
            });

            // Moderator Policy
            options.AddPolicy("ModeratorOnly", policy =>
            {
                policy.RequireAuthenticatedUser();
                policy.RequireRole("Moderator");
            });

            // Staff Policy (Admin or Moderator)
            options.AddPolicy("StaffOnly", policy =>
            {
                policy.RequireAuthenticatedUser();
                policy.RequireRole("Admin", "Moderator");
            });

            // Email Verified Policy
            options.AddPolicy("EmailVerified", policy =>
            {
                policy.RequireAuthenticatedUser();
                policy.RequireClaim("EmailVerified", "true");
            });

            // Custom Permission Policy
            options.AddPolicy("CanManageUsers", policy =>
            {
                policy.RequireAuthenticatedUser();
                policy.RequireClaim("Permission", "ManageUsers");
            });

            // Multiple Requirements Policy
            options.AddPolicy("AdminWithVerifiedEmail", policy =>
            {
                policy.RequireAuthenticatedUser();
                policy.RequireRole("Admin");
                policy.RequireClaim("EmailVerified", "true");
            });
        });

        return services;
    }
}