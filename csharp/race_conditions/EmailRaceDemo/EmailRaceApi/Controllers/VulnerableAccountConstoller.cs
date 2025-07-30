using Microsoft.AspNetCore.Mvc;
using EmailRaceDemo.Data;
using EmailRaceDemo.Models;

namespace EmailRaceDemo.Controllers;

[ApiController]
[Route("api/account")]
public class AccountRaceController : ControllerBase
{
    private readonly AppDb _db;
    private readonly IEmailSvc _email;
    private static readonly Dictionary<string, int> Tokens = new();   // token ➜ userId

    public AccountRaceController(AppDb db, IEmailSvc email)
    {
        _db = db;
        _email = email;

    }

    [HttpGet("get-user/{id:int}")]
    public async Task<IActionResult> GetUser(int id)
    {
        var user = await _db.Users.FindAsync(id);
        return user == null ? NotFound() : Ok(new { user.Id, user.Email });
    }

    // ----- vulnerable change-email -----
    [HttpPost("change-email")]
    public async Task<IActionResult> ChangeEmail([FromBody] ChangeEmail req)
    {
        var user = await _db.Users.FindAsync(req.UserId);
        if (user is null) return NotFound();

        /* 1️⃣ רשום כתובת חדשה - והיא זו שתאושר בסוף */
        user.PendingEmail = req.NewEmail;
        await _db.SaveChangesAsync();                // TRX נסגרת

        /* 2️⃣ צור טוקן אך אל תקשור אותו לאימייל */
        var token = Guid.NewGuid().ToString("N");
        Tokens[token] = user.Id;

        /* 3️⃣ שמור את כתובת-ה-TO המקורית (התקיפה) */
        var toAddress = req.NewEmail;                // ← attacker@evil.com

        /* 4️⃣ תן לבקשה מתחרה זמן לדרוס את PendingEmail */
        await Task.Delay(200);                       // חלון מרוץ (די בסביבת prod)

        /* 5️⃣ רענן מה-DB – אולי כבר victim@corp.com */
        await _db.Entry(user).ReloadAsync();
        var bodyEmail = user.PendingEmail!;          // ← victim@corp.com

        /* 6️⃣ שלח: TO = כתובת התוקף, BODY = כתובת הקורבן */
        await _email.SendAsync(
             toAddress,
             $"Hi! Click to confirm {bodyEmail}: {BuildLink(token, user.PendingEmail)}");

        return Ok();
    }


    // ----- vulnerable confirm -----
    [HttpGet("confirm-email")]
    public async Task<IActionResult> Confirm(string token)
    {
        if (!Tokens.TryGetValue(token, out var uid)) return BadRequest("invalid");
        var user = await _db.Users.FindAsync(uid);
        if (user is null || user.PendingEmail is null) return BadRequest("no pending");

        user.Email = user.PendingEmail;                    // ④ applies whichever email is there now
        user.PendingEmail = null;
        await _db.SaveChangesAsync();
        return Ok();
    }
    private const string BaseUrl = "http://localhost:5024";

    private string BuildLink(string token, string email) =>
        $"{BaseUrl}/api/account/confirm-email" +
        $"?token={token}&email={Uri.EscapeDataString(email)}";


}



public record VulnerableChangeEmail(int UserId, string NewEmail);
