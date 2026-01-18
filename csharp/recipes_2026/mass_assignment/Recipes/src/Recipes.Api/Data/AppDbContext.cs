using Microsoft.EntityFrameworkCore;
using Recipes.Api.Models;

namespace Recipes.Api.Data;

public class AppDbContext : DbContext
{
   public AppDbContext(DbContextOptions<AppDbContext> options)
      : base(options)
   {
   }

   public DbSet<AppUser> Users => Set<AppUser>();   

   public DbSet<Recipe> Recipes => Set<Recipe>();


   protected override void OnModelCreating(ModelBuilder modelBuilder)
   {
      base.OnModelCreating(modelBuilder);      

      var recipe = modelBuilder.Entity<Recipe>();

      recipe.Property(t => t.Status)
         .HasConversion<string>()
         .IsRequired();

      recipe.Property(t => t.CreateDate)
         .IsRequired();

      recipe.Property(t => t.Name)
         .HasMaxLength(200)
         .IsRequired();

      recipe.Property(t => t.Description)
         .HasMaxLength(2000);

      recipe.Property(t => t.CreatedBy)
         .HasMaxLength(100)
         .IsRequired();

      recipe.Property(t => t.Photo);
         
   }
}

