using recipes_api.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace recipes_api.data
{
    
    public interface IRecipeDataLayer
    {
        Task  AddRecipe(Recipe recipe);  // Method to get all recipes

        Task AddRecipes(List<Recipe> recipes);  // Method to get all recipes
        Task<List<Recipe>> GetAllRecipes();  // Method to get all recipes
    }

}
