using recipes_api.Models;
using System.Collections.Generic;
using System.Data.SQLite;
using System.IO;
using System.Threading.Tasks;
using System.Security.Cryptography;
using System.Text;


namespace recipes_api.data
{
    public class RecipeDataLayer : IRecipeDataLayer
    {
        private readonly string _connectionString;
        private readonly string _dbFilePath;

        public RecipeDataLayer(string connectionString)        
        {
            _connectionString = connectionString;
            string dataFolder = Path.Combine(Directory.GetCurrentDirectory(), "data");
            if (!Directory.Exists(dataFolder))
            {
                Directory.CreateDirectory(dataFolder);
            }

            _dbFilePath = Path.Combine(dataFolder, "recipes.db");
            _connectionString = $"Data Source={_dbFilePath};Version=3;";

            EnsureDatabaseCreated();
        }

        private void EnsureDatabaseCreated()
        {
            if (!File.Exists(_dbFilePath))
            {
                SQLiteConnection.CreateFile(_dbFilePath);
                CreateTables();
                Console.WriteLine($"Database created at: {_dbFilePath}");
            }
            else
            {
                Console.WriteLine($"Database already exists at: {_dbFilePath}");
            }
        }

        private void CreateTables()
        {
            using (var connection = new SQLiteConnection(_connectionString))
            {
                connection.Open();
                using (var command = new SQLiteCommand(connection))
                {
                    command.CommandText = @"
                        CREATE TABLE IF NOT EXISTS Recipes (
                            Id INTEGER PRIMARY KEY AUTOINCREMENT,
                            Name TEXT NOT NULL,
                            Instructions TEXT NOT NULL,
                            ImagePath TEXT,
                            Deleted INTEGER DEFAULT 0
                        );

                        CREATE TABLE IF NOT EXISTS Users (
                            Id INTEGER PRIMARY KEY AUTOINCREMENT,
                            Username TEXT NOT NULL UNIQUE,
                            Password TEXT NOT NULL
                        );
                    ";
                    command.ExecuteNonQuery();
                }
            }

            SeedUsers();
        }

        private void SeedUsers()
            {
                using (var connection = new SQLiteConnection(_connectionString))
                {
                    connection.Open();

                    // Check if users already exist
                    using (var checkCommand = new SQLiteCommand("SELECT COUNT(*) FROM Users", connection))
                    {
                        long userCount = (long)checkCommand.ExecuteScalar();
                        if (userCount > 0) return; // Don't insert if users exist
                    }

                    using (var transaction = connection.BeginTransaction())
                    {
                        using (var command = new SQLiteCommand(connection))
                        {
                            command.Transaction = transaction; // Set the transaction

                            command.CommandText = "INSERT INTO Users (Username, Password) VALUES (@Username, @Password)";
                            
                            command.Parameters.AddWithValue("@Username", "admin");
                            command.Parameters.AddWithValue("@Password", HashPassword("admin123"));
                            command.ExecuteNonQuery();

                            command.Parameters.Clear();
                            command.Parameters.AddWithValue("@Username", "user1");
                            command.Parameters.AddWithValue("@Password", HashPassword("password1"));
                            command.ExecuteNonQuery();

                            command.Parameters.Clear();
                            command.Parameters.AddWithValue("@Username", "user2");
                            command.Parameters.AddWithValue("@Password", HashPassword("password2"));
                            command.ExecuteNonQuery();
                        }
                        transaction.Commit();
                    }

                    Console.WriteLine("Sample users added to database.");
                }
            }


          private string HashPassword(string password)
        {
            using (SHA256 sha256 = SHA256.Create())
            {
                byte[] bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
                return Convert.ToBase64String(bytes);
            }
        }


        public async Task AddRecipe(Recipe recipe)
        {
            try
            {
                using (var connection = new SQLiteConnection(_connectionString))
                {
                    string sql = "INSERT INTO Recipes (Name, Instructions, ImagePath) VALUES (@Name, @Instructions, @ImagePath)";
                    using (var command = new SQLiteCommand(sql, connection))
                    {
                        command.Parameters.AddWithValue("@Name", recipe.Name);
                        command.Parameters.AddWithValue("@Instructions", recipe.Instructions);
                        command.Parameters.AddWithValue("@ImagePath", recipe.ImagePath);

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
                using (var connection = new SQLiteConnection(_connectionString))
                {
                    await connection.OpenAsync();
                    using (var transaction = connection.BeginTransaction())
                    {
                        foreach (var recipe in recipes)
                        {
                            // 🚨 SQL Injection Vulnerability: Directly Concatenating User Input
                            string sql = $"INSERT INTO Recipes (Name, Instructions, ImagePath) VALUES ('{recipe.Name}', '{recipe.Instructions}', '{recipe.ImagePath}')";
                            
                            using (var command = new SQLiteCommand(sql, connection, transaction))
                            {
                                await command.ExecuteNonQueryAsync();
                            }
                        }
                        transaction.Commit();
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

            using (var connection = new SQLiteConnection(_connectionString))
            {
                await connection.OpenAsync();
                var command = new SQLiteCommand("SELECT Name, Instructions, ImagePath FROM Recipes WHERE Deleted IS NULL OR Deleted = 0 ORDER BY Id DESC", connection);

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
