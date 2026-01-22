using Recipes.Api.Models;

namespace Recipes.Api.Services;

public interface IUserService
{
   Task<bool> IsFirstUserAsync();
   Task<AppUser> RegisterUserAsync(string userName, string rawPassword, bool isAdmin);
   Task<AppUser> RegisterFirstAdminAsync(string userName, string rawPassword);
   Task<AppUser?> FindByUserNameAsync(string userName);
   Task<bool> VerifyPasswordAsync(AppUser user, string rawPassword);
}
