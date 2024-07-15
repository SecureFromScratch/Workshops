using recipes_api.Models;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Threading.Tasks;
using Microsoft.Data.SqlClient;
using System.Linq.Expressions;

namespace recipes_api.data
{
    
    public class RecipeDataLayer : IRecipeDataLayer
    {
        private readonly string _connectionString;

        public RecipeDataLayer(string connectionString)
        {
            _connectionString = connectionString;
        }
        public async Task AddRecipe(Recipe recipe)
        {
            try
            {
                using (SqlConnection connection = new SqlConnection(_connectionString))
                {
                    string sql = $"INSERT INTO Recipes (Name, Instructions, ImagePath) VALUES ('" + recipe.Name +"','" + recipe.Instructions +"','" + recipe.ImagePath + "')";
                    using (SqlCommand command = new SqlCommand(sql, connection))
                    {                        
                        await connection.OpenAsync();
                        await command.ExecuteNonQueryAsync();
                    }
                }
            }

            catch (Exception ex)
            {
                Console.WriteLine(ex.ToString());
            }
        }

        public async Task AddRecipes(List<Recipe> recipes)
        {
            try
            {
                using (SqlConnection connection = new SqlConnection(_connectionString))
                {
                    foreach (Recipe recipe in recipes)
                    {

                        string sql = $"INSERT INTO Recipes (Name, Instructions, ImagePath) VALUES (@Name, @Instructions, @ImagePath) ";
                        using (SqlCommand command = new SqlCommand(sql, connection))
                        {
                            command.Parameters.AddWithValue("@Name", recipe.Name);
                            command.Parameters.AddWithValue("@Instructions", recipe.Instructions);
                            command.Parameters.AddWithValue("@ImagePath", recipe.ImagePath);

                            await connection.OpenAsync();
                            await command.ExecuteNonQueryAsync();
                        }
                    }
                }
            }

            catch (Exception ex)
            {
                Console.WriteLine(ex.ToString());
            }
        }

        public async Task<List<Recipe>> GetAllRecipes()
        {
            var recipes = new List<Recipe>();

            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                               
                var command = new SqlCommand("SELECT Name, Instructions, ImagePath FROM Recipes WHERE Deleted is null or Deleted=0", connection);
                using (var reader = await command.ExecuteReaderAsync())
                {
                    while (await reader.ReadAsync())
                    {
                        var recipe = new Recipe
                        {
                            Name = reader["Name"].ToString(),
                            Instructions = reader["Instructions"].ToString(),
                            ImagePath = reader["ImagePath"].ToString(),
                        };
                        recipes.Add(recipe);
                    }
                }
            }

            return recipes;
        }

    }

}
