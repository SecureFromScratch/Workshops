using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Recipes.Api.Data;
using Recipes.Api.Models;

namespace Recipes.Api.Services;

public class UserService : IUserService
{
   private readonly AppDbContext m_db;
   private readonly IPasswordHasher<AppUser> m_passwordHasher;

   public UserService(AppDbContext db, IPasswordHasher<AppUser> passwordHasher)
   {
      m_db = db;
      m_passwordHasher = passwordHasher;
   }

   public async Task<bool> IsFirstUserAsync()
   {
      return !await m_db.Users.AnyAsync();
   }

   private void ValidatePasswordStrength(string password)
   {
      if (string.IsNullOrWhiteSpace(password) || password.Length < 8)
         throw new ArgumentException("Password must be at least 8 characters long");

      if (!password.Any(char.IsUpper))
         throw new ArgumentException("Password must contain at least one uppercase letter");

      if (!password.Any(char.IsLower))
         throw new ArgumentException("Password must contain at least one lowercase letter");

      if (!password.Any(char.IsDigit))
         throw new ArgumentException("Password must contain at least one number");

      const string specials = "!@#$%^&*()_+-=[]{};':\"\\|,.<>/?";
      if (!password.Any(specials.Contains))
         throw new ArgumentException("Password must contain at least one special character");
   }

   public async Task<AppUser> RegisterUserAsync(string userName, string rawPassword, bool isAdmin)
   {
      if (string.IsNullOrWhiteSpace(userName))
         throw new ArgumentException("Username cannot be empty");

      userName = userName.Trim();
      if (userName.Length < 3)
         throw new ArgumentException("Username must be at least 3 characters long");

      if (await m_db.Users.AnyAsync(u => u.UserName == userName))
         throw new ArgumentException("Username already exists");

      ValidatePasswordStrength(rawPassword);

      var user = new AppUser
      {
         UserName = userName,
         Roles = isAdmin ? "ADMIN,USER" : "USER",
         Enabled = true
      };

      user.PasswordHash = m_passwordHasher.HashPassword(user, rawPassword);

      m_db.Users.Add(user);
      await m_db.SaveChangesAsync();

      return user;
   }

   public async Task<AppUser> RegisterFirstAdminAsync(string userName, string rawPassword)
   {
      if (!await IsFirstUserAsync())
         throw new InvalidOperationException("First user already exists");

      return await RegisterUserAsync(userName, rawPassword, isAdmin: true);
   }

   public Task<AppUser?> FindByUserNameAsync(string userName)
   {
      return m_db.Users.SingleOrDefaultAsync(u => u.UserName == userName);
   }

   public Task<bool> VerifyPasswordAsync(AppUser user, string rawPassword)
   {
      var result = m_passwordHasher.VerifyHashedPassword(user, user.PasswordHash, rawPassword);
      return System.Threading.Tasks.Task.FromResult(result == PasswordVerificationResult.Success);
   }
}
