// File: Api/Models/Recipe.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Recipes.Api.Models
{
   [Table("Recipe")]
   public class Recipe
   {
      [Key]
      [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
      public long Id { get; set; }

      [Required]
      [MaxLength(200)]
      public string Name { get; set; } = string.Empty;

      [MaxLength(2000)]
      public string? Description { get; set; }
      
      [MaxLength(100)]
      public string CreatedBy { get; set; } = string.Empty;

      public string? Photo { get; set; }

      [Required]
      public RecipeStatus Status { get; set; } = RecipeStatus.Draft;

      [Required]
      public DateTime CreateDate { get; set; }

      public void OnCreate()
      {
         if (CreateDate == default)
         {
            CreateDate = DateTime.UtcNow;
         }

         if (Status == default)
         {
            Status = RecipeStatus.Draft;
         }
      }
   }
}
