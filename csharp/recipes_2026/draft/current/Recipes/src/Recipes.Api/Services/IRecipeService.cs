// Api/Services/ITaskService.cs
using Recipes.Api.Models;
using System.Collections.Generic;
using System.Threading.Tasks;


namespace Recipes.Api.Services
{
   public interface IRecipeService
   {
      Task<List<Recipe>> GetAllAsync();
      Task<Recipe?> GetByIdAsync(long id);
      Task<Recipe> CreateAsync(Recipe recipe, string currentUser);
      Task<Recipe?> UpdateAsync(long id, Recipe updated);
      Task<bool> DeleteAsync(long id);
   }
}
