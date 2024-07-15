using HeyRed.Mime;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using recipes_api.data;
using recipes_api.Models;
using System.IO;
using System.Linq;
using System;
using System.Threading.Tasks;



namespace recipes_api.Controllers
{
    [ApiController]
    //[AutoValidateAntiforgeryToken]
    [Route("[controller]")]
    public class RecipesController : ControllerBase
    {

        private readonly IRecipeDataLayer _recipeDataLayer;
        private readonly IWebHostEnvironment _webHostEnvironment;
        private readonly IHttpClientFactory _clientFactory;


        private readonly ILogger<RecipesController> _logger;


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
            _clientFactory = clientFactory;

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





        [HttpPost]
        public async Task<IActionResult> AddRecipe([FromForm] Recipe model)
        {
            if (model == null)
            {
                return BadRequest("Invalid recipe data");
            }

            string? imagePath = null;

            if (model.Image != null)
            {
                var allowedExtensions = new[] { ".jpeg", ".png" };

                // Validate extension
                var extension = Path.GetExtension(model.Image.FileName).ToLowerInvariant();
                if (!allowedExtensions.Contains(extension))
                {
                    return BadRequest("Bad Request");
                }

                // Validate MIME type
                if (!ValidateFileSignature(model.Image, allowedExtensions))
                {
                    return BadRequest("Bad Request");
                }

                string uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images");
                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                }

                string uniqueFileName = Guid.NewGuid().ToString() + extension;
                string filePath = Path.Combine(uploadsFolder, uniqueFileName);

                if (!filePath.StartsWith(Path.GetFullPath(uploadsFolder)))
                {
                    return BadRequest("Bad Request");
                }

                if (model.Image.Length > 0)
                {
                    const long maxAllowedFileSize = 5 * 1024 * 1024; // 5 MB


                    if (model.Image.Length > maxAllowedFileSize)
                    {
                        return BadRequest("File size exceeds the maximum limit of 5 MB.");
                    }
                    else
                    {
                        using (var stream = new FileStream(filePath, FileMode.Create))
                        {
                            await model.Image.CopyToAsync(stream);

                        }
                    }
                }
                imagePath = "/images/" + uniqueFileName;
            }

            Recipe recipe = new Recipe
            {
                Name = model.Name,
                Instructions = model.Instructions,
                ImagePath = imagePath
            };

            await _recipeDataLayer.AddRecipe(recipe);

            return Ok(new { message = "Recipe added successfully", recipe });
        }


    }
}
}
