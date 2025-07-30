using System.Text.RegularExpressions;

namespace EmailRaceDemo.Controllers;


public interface IEmailSvc
{
    Task SendAsync(string to, string link);
}


public class ConsoleEmailSvc : IEmailSvc
{
   private static readonly Regex EmailParam =
       new(@"[?&]email=([^&]+)", RegexOptions.IgnoreCase | RegexOptions.Compiled);

   public Task SendAsync(string to, string link)
   {
      var emailInLink = ExtractEmail(link);

      if (!string.Equals(to, emailInLink, StringComparison.OrdinalIgnoreCase))
      {
         Console.ForegroundColor = ConsoleColor.Red;
         Console.WriteLine("⚠ RACE DETECTED");
         Console.ResetColor();
      }

      Console.ForegroundColor = ConsoleColor.Cyan;
      Console.WriteLine($"Token email : {emailInLink}");
      Console.ForegroundColor = ConsoleColor.Yellow;
      Console.WriteLine($"Mail sent to: {to}");
      Console.ForegroundColor = ConsoleColor.Gray;
      Console.WriteLine($"Confirmation: {link}\n");
      Console.ResetColor();

      return Task.CompletedTask;
   }

   /* robust: works even if the link isn’t a full URI */
   private static string ExtractEmail(string link)
   {
      if (Uri.TryCreate(link, UriKind.Absolute, out var uri))
      {
         var q = System.Web.HttpUtility.ParseQueryString(uri.Query);
         return Uri.UnescapeDataString(q["email"] ?? "");
      }

      var m = EmailParam.Match(link);
      return m.Success ? Uri.UnescapeDataString(m.Groups[1].Value) : "";
   }
}
