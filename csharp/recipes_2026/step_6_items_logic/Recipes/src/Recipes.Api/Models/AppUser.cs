using System.ComponentModel.DataAnnotations;

namespace Recipes.Api.Models;

public class AppUser
{
   public int Id { get; set; }

   [Required]
   [MaxLength(64)]
   public string UserName { get; set; } = string.Empty;

   [Required]
   public string PasswordHash { get; set; } = string.Empty;

   // "ADMIN,USER" or "USER"
   [Required]
   public string Roles { get; set; } = "USER";

   public bool Enabled { get; set; } = true;

   public int FailedAttempts { get; set; }

   public DateTimeOffset? LockoutEnd { get; set; }
}
