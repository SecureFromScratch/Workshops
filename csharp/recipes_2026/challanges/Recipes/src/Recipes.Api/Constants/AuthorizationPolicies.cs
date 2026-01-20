namespace Recipes.Api.Constants;

public static class AuthorizationPolicies
{
    public const string AdminOnly = nameof(AdminOnly);
    public const string UserOrAdmin = nameof(UserOrAdmin);
    public const string ModeratorOnly = nameof(ModeratorOnly);
    public const string StaffOnly = nameof(StaffOnly);
    public const string EmailVerified = nameof(EmailVerified);
    public const string CanManageUsers = nameof(CanManageUsers);
    public const string AdminWithVerifiedEmail = nameof(AdminWithVerifiedEmail);
}