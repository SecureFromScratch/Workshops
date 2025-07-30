using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EmailRaceDemo.Data;
using EmailRaceDemo.Models;

namespace EmailRaceDemo.Controllers;

[ApiController]
[Route("api/safe-account")]
public class AccountController : ControllerBase
{
   private readonly AppDb _db;
   private readonly IEmailSvc _mail;

   public AccountController(AppDb db, IEmailSvc mail)
   {
      _db = db;
      _mail = mail;
   }

   /* ---------- demo helpers ---------- */

   [HttpPost("create")]
   public async Task<IActionResult> Create([FromBody] CreateUser req)
   {
      var u = new User { Email = req.Email };
      _db.Users.Add(u);
      await _db.SaveChangesAsync();
      return Ok(u.Id);
   }

   [HttpGet("{id:int}")]
   public async Task<IActionResult> Get(int id) =>
      await _db.Users.FindAsync(id) is { } u
         ? Ok(new { u.Id, u.Email, u.PendingEmail })
         : NotFound();

   /* ---------- change-email flow (race-free) ---------- */

   [HttpPost("change-email")]
   public async Task<IActionResult> ChangeEmail([FromBody] ChangeEmail req)
   {
      var token = Guid.NewGuid().ToString("N");
      _db.EmailChangeRequests.Add(new EmailChange
      {
         UserId   = req.UserId,
         NewEmail = req.NewEmail,
         Token    = token,
         ExpiresAt = DateTime.UtcNow.AddHours(1)
      });
      await _db.SaveChangesAsync();
      await _mail.SendAsync(req.NewEmail, BuildLink(token, req.NewEmail));
      return Ok();
   }

   [HttpGet("confirm-email")]
   public async Task<IActionResult> Confirm([FromQuery] string token,
                                            [FromQuery] string email)
   {
      var r = await _db.EmailChangeRequests
              .FirstOrDefaultAsync(x => x.Token == token &&
                                        x.NewEmail == email &&
                                        x.ExpiresAt > DateTime.UtcNow);
      if (r is null) return BadRequest("invalid");
      await using var tx = await _db.Database.BeginTransactionAsync();
      var u = await _db.Users.FindAsync(r.UserId);
      u.Email = r.NewEmail;
      _db.EmailChangeRequests.Remove(r);
      await _db.SaveChangesAsync();
      await tx.CommitAsync();
      return Ok();
   }

   /* ---------- helpers ---------- */

   private string BuildLink(string token, string email) =>
      $"{Request.Scheme}://{Request.Host}/api/safe-account/confirm-email?token={token}&email={Uri.EscapeDataString(email)}";
}

/* ---------- records ---------- */
public record CreateUser(string Email);
public record ChangeEmail(int UserId, string NewEmail);
