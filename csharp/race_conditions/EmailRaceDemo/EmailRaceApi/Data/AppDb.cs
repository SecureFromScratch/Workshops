using Microsoft.EntityFrameworkCore;
using EmailRaceDemo.Models;

namespace EmailRaceDemo.Data;

public class AppDb : DbContext
{
   public AppDb(DbContextOptions<AppDb> options) : base(options) { }
   public DbSet<User> Users => Set<User>();
   public DbSet<EmailChange> EmailChangeRequests => Set<EmailChange>();
}
