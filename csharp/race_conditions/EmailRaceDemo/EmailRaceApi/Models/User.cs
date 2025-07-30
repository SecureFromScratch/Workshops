namespace EmailRaceDemo.Models;

public class User
{
   public int Id { get; set; }
   public string Email { get; set; } = "";
   public string? PendingEmail { get; set; }
}

