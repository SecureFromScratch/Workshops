// Api/Services/RecipeService.cs
using Microsoft.EntityFrameworkCore;
using Recipes.Api.Data;
using Recipes.Api.Models;
using Recipes.Api.Services;

namespace Recipes.Api.Serrvices
{
   public class RecipeService : IRecipeService
   {
      private readonly AppDbContext m_context;
      private readonly ILogger<RecipeService> m_logger;

      public RecipeService(AppDbContext context, ILogger<RecipeService> logger)
      {
         m_context = context;
         m_logger = logger;
      }     

      
      public async Task<Recipe> CreateAsync(Recipe recipe, string currentUser)
      {
         recipe.CreatedBy = currentUser;
         recipe.OnCreate();

         m_context.Recipes.Add(recipe);
         await m_context.SaveChangesAsync();
         return recipe;
      }

      public async Task<Recipe?> UpdateAsync(long id, Recipe updated)
      {
         var existing = await m_context.Recipes.FirstOrDefaultAsync(t => t.Id == id);
         if (existing == null)
         {
            return null;
         }

         existing.Name = updated.Name;
         existing.Description = updated.Description;
         existing.Photo = updated.Photo;
         existing.Status = updated.Status;

         await m_context.SaveChangesAsync();
         return existing;
      }

      public async Task<bool> DeleteAsync(long id)
      {
         var existing = await m_context.Recipes.FirstOrDefaultAsync(t => t.Id == id);
         if (existing == null)
         {
            return false;
         }

         m_context.Recipes.Remove(existing);
         await m_context.SaveChangesAsync();
         return true;
      }

        public Task<List<Recipe>> GetAllAsync()
        {
            throw new NotImplementedException();
        }

        public Task<Recipe?> GetByIdAsync(long id)
        {
            throw new NotImplementedException();
        }
    }
}
