using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using recipes_api.data;
using recipes_api.Models;
using recipes_api.utils;
using recipes_api.attributes;


namespace recipes_api.Controllers
{
    [ApiController]
    //[AutoValidateAntiforgeryToken]
    [Route("[controller]")]
    public class RecipesController : ControllerBase
    {
        

        private readonly IRecipeDataLayer _recipeDataLayer;
        private readonly IWebHostEnvironment _webHostEnvironment;


        private readonly ILogger<RecipesController> _logger;        

        // Mime type validation 
        private static readonly Dictionary<string, List<byte[]>> FileSignatures = new Dictionary<string, List<byte[]>>
        {
            { ".jpeg", new List<byte[]>
                {
                    new byte[] { 0xFF, 0xD8, 0xFF, 0xE0 },
                    new byte[] { 0xFF, 0xD8, 0xFF, 0xE2 },
                    new byte[] { 0xFF, 0xD8, 0xFF, 0xE3 }
                }
            },

            { ".png", new List<byte[]>
                {
                    new byte[] { 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A }
                }
            }
        };
        public static bool ValidateFileSignature(IFormFile file, string[] expectedExtensions)
        {
            bool result = false;

            if (file == null || file.Length == 0)
                return result;

            for (int i=0;i<expectedExtensions.Length & !result;  i++) {
            //foreach (string expectedExtension in expectedExtensions) {
                if (FileSignatures.ContainsKey(expectedExtensions[i]))
                {
                    using var reader = new BinaryReader(file.OpenReadStream());
                    var signatures = FileSignatures[expectedExtensions[i]];
                    var headerBytes = reader.ReadBytes(signatures.Max(m => m.Length));

                    result =  signatures.Any(signature => headerBytes.Take(signature.Length).SequenceEqual(signature));
                }
            }
            return result;
        }

        public RecipesController(ILogger<RecipesController> logger, IRecipeDataLayer recipeDataLayer, IWebHostEnvironment webHostEnvironment)
        
        {
            _logger = logger;
            

            /*_recipes = new List<Recipe>
        {
            new Recipe
            {
                Id = 1,
                Name = "Chocolate Cake",
                Instructions = "<ol>" +
                               "<li>Preheat oven to 350°F (177°C).</li>" +
                               "<li>In a large mixing bowl, combine flour, sugar, cocoa powder, baking soda, and salt.</li>" +
                               "<li>Add eggs, milk, oil, and vanilla extract; mix until smooth.</li>" +
                               "<li>Pour batter into a greased baking pan.</li>" +
                               "<li>Bake for 30-35 minutes or until a toothpick inserted in the center comes out clean.</li>" +
                               "<li>Let it cool before frosting or serving.</li>" +
                               "</ol>",
                ImagePath = "chocolate-cake.png"
            },
            new Recipe
            {
                Id = 2,
                Name = "Orange Cake",
                Instructions = "<ol>" +
                               "<li>Preheat oven to 350°F (177°C).</li>" +
                               "<li>Combine flour, sugar, baking powder, and salt in a mixing bowl.</li>" +
                               "<li>In a separate bowl, mix eggs, orange juice, oil, and zest from one orange.</li>" +
                               "<li>Add wet ingredients to dry ingredients and stir until combined.</li>" +
                               "<li>Pour into a greased baking pan.</li>" +
                               "<li>Bake for 25-30 minutes, or until golden and set.</li>" +
                               "<li>Let cool before serving.</li>" +
                               "</ol>",
                ImagePath = "orange-cake.png"
            },
            new Recipe
            {
                Id = 3,
                Name = "Carrot Cake",
                Instructions = "<ol>" +
                               "<li>Preheat oven to 350°F (177°C).</li>" +
                               "<li>Mix flour, sugar, baking powder, baking soda, and cinnamon in a bowl.</li>" +
                               "<li>In a separate bowl, combine eggs, oil, and vanilla extract.</li>" +
                               "<li>Stir in grated carrots and crushed pineapple.</li>" +
                               "<li>Combine wet and dry ingredients, then pour into a greased baking pan.</li>" +
                               "<li>Bake for 35-40 minutes, or until a toothpick comes out clean.</li>" +
                               "<li>Cool and top with cream cheese frosting.</li>" +
                               "</ol>",
                ImagePath = "carrot-cake.png"
            }
        };*/
            _recipeDataLayer = recipeDataLayer;
            _webHostEnvironment = webHostEnvironment;

        }

        // GET: api/Recipe
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Recipe>>> GetAllRecipes()
        {   
            var recipes = await _recipeDataLayer.GetAllRecipes();
            foreach (var recipe in recipes)
            {

                if (!string.IsNullOrEmpty(recipe.ImagePath))
                {
                    var imageFullPath = Path.Combine(_webHostEnvironment.ContentRootPath, "wwwroot", recipe.ImagePath.TrimStart('/', '\\'));

                    var normalizedFullPath = Path.GetFullPath(imageFullPath).Trim();

                    if (System.IO.File.Exists(normalizedFullPath))
                    {
                        try
                        {
                            // Read the image file and convert it to a byte array or Base64-encoded string
                            byte[] imageData = System.IO.File.ReadAllBytes(normalizedFullPath);
                            string imageBase64 = Convert.ToBase64String(imageData);

                            // Assign the image data to the recipe's Image property
                            recipe.Base64Image = imageBase64;
                        }
                        catch (Exception ex)
                        {
                            // Handle exceptions, such as file not found or access issues
                            Console.WriteLine($"Error reading image from path {recipe.ImagePath}: {ex.Message}");
                        }
                    }
                }
            }

            return Ok(recipes);
        }
        /// <summary>
        /// AddRecipe - Vulnerable don't use in production
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<IActionResult> AddRecipe([FromForm] Recipe model) // Use FromForm to extract data
        {
            if (model == null)
            {
                return BadRequest("Invalid recipe data");
            }

            string? imagePath = null;

            if (model.Image != null)
            {
                string uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images");
                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                }

                string filePath = Path.Combine(uploadsFolder, model.Image.FileName);

                // Save the file to the server
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await model.Image.CopyToAsync(stream);
                }

                imagePath = "/images/" + model.Image.FileName;
            }

            // Create a new recipe instance from the form data
            Recipe recipe = new Recipe
            {
                Name = model.Name,
                Instructions = model.Instructions,
                ImagePath = imagePath // Store the image path if available
            };

            // Save the recipe to a database or other storage            
            await _recipeDataLayer.AddRecipe(recipe);

            return Ok(new { message = "Recipe added successfully", recipe });
        }




        [HttpPost("AddRecipes")]
        public async Task<IActionResult> AddRecipes([FromBody] List<Recipe> recipes)
        {
            if (recipes == null || recipes.Count == 0)
            {
                return BadRequest("No recipes provided.");
            }

            try
            {

                foreach (Recipe recipe in recipes)
                {

                    string uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images"); // File save location

                    if (!Utils.IsAllowedUrl(recipe.ImageUrl))
                        return StatusCode(500, "An error occurred while saving the recipes.");
                    recipe.ImagePath = await Utils.DownloadImageAsync(recipe.ImageUrl, uploadsFolder);
                                       

                }
                // Assume AddRecipesAsync takes a list of recipes and handles them accordingly
                await _recipeDataLayer.AddRecipes(recipes);
                return Ok(new { message = "Recipes added successfully" });
            }
            catch (Exception ex)
            {
                // Log the exception details here and handle the exception as necessary
                return StatusCode(500, "An error occurred while saving the recipes.");
            }

        }

        

        // Apply the custom RestrictIP attribute
        [RestrictIP(allowedIP: "127.0.0.1", blockedIP: "192.168.7.6")]
        [HttpGet("Secret")]
        public IActionResult GetSecret()
        {
            return Ok("This is a super secret.");
        }

    }
}
