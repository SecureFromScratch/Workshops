namespace EmailRaceDemo.Models;



public class EmailChange
{
   public int Id { get; set; }
   public int UserId { get; set; }
   public string NewEmail { get; set; } = "";
   public string Token { get; set; } = "";
   public DateTime ExpiresAt { get; set; }
}
