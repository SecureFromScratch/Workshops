// Api/Controllers/TasksController.cs
using Recipes.Api.Models;
using Recipes.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Threading.Tasks;


namespace Recipes.Api.Controllers
{
   [ApiController]
   [Route("api/recipes")]
   [Authorize]
   public class RecipesController : ControllerBase
   {
      private readonly IRecipeService m_service;
      private readonly ILogger<RecipesController> m_logger;

      public RecipesController(IRecipeService service, ILogger<RecipesController> logger)
      {
         m_service = service;
         m_logger = logger;
      }

      [HttpGet]
      public async Task<ActionResult<IEnumerable<Recipe>>> GetAll()
      {
         var recipes = await m_service.GetAllAsync();
         return Ok(recipes);
      }

      [HttpGet("{id:long}")]
      public async Task<ActionResult<Recipe>> GetById(long id)
      {
         var task = await m_service.GetByIdAsync(id);
         if (task == null)
         {
            return NotFound();
         }

         return Ok(task);
      }

      [HttpPost]
      public async Task<ActionResult<Recipe>> Create([FromBody] Recipe recipe)
      {
         var userName = User.Identity?.Name ?? "unknown";

         var entity = new Recipe
         {
            Name = recipe.Name,
            Description = recipe.Description,
            Photo = recipe.Photo,
            Status = recipe.Status,
            CreatedBy = userName
         };

         var created = await m_service.CreateAsync(entity, userName);
         return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
      }

      [HttpPut("{id:long}")]
      public async Task<ActionResult<Recipe>> Update(long id, [FromBody] Recipe recipe)
      {
         var entity = new Recipe
         {
            Name = recipe.Name,
            Description = recipe.Description,
            Photo = recipe.Photo,
            Status = recipe.Status
         };

         var updated = await m_service.UpdateAsync(id, entity);
         if (updated == null)
         {
            return NotFound();
         }

         return Ok(updated);
      }

      [HttpDelete("{id:long}")]
      public async Task<IActionResult> Delete(long id)
      {
         var ok = await m_service.DeleteAsync(id);
         if (!ok)
         {
            return NotFound();
         }

         return NoContent();
      }


      [HttpPost("{id:long}/photo")]
      public async Task<IActionResult> UploadPhoto(long id, IFormFile photoFile)
      {
         if (photoFile == null || photoFile.Length == 0)
            return BadRequest(new { error = "Missing file." });


         var ct = photoFile.ContentType ?? "";

         var recipe = await m_service.GetByIdAsync(id);
         if (recipe is null)
            return NotFound(new { error = "Recipe not found." });

         // Determine file extension
         var ext = ct switch
         {
            "image/jpeg" => ".jpg",
            "image/png" => ".png",
            "image/webp" => ".webp",
            _ => ".jpg"
         };

         // Create directory structure: wwwroot/uploads/recipes/{id}/
         var relativeDir = Path.Combine("uploads", "recipes", id.ToString());
         var absoluteDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", relativeDir);
         Directory.CreateDirectory(absoluteDir);


         var absolutePath = Path.Combine(absoluteDir, photoFile.FileName);

         // Save file
         await using (var fs = System.IO.File.Create(absolutePath))
         {
            await photoFile.CopyToAsync(fs, HttpContext.RequestAborted);
         }

         // Update recipe with web-accessible path
         recipe.Photo = "/" + Path.Combine(relativeDir, photoFile.FileName).Replace('\\', '/');

         var updated = await m_service.UpdateAsync(id, recipe);

         return Ok(updated);
      }

      public class PhotoFromUrlDto
      {
         public string Url { get; set; } = string.Empty;
         public string? Filename { get; set; }
      }
      
      [HttpPost("{id:long}/photo-from-url")]
      public async Task<IActionResult> UploadPhotoFromUrl(long id, [FromBody] PhotoFromUrlDto dto)
      {
         if (string.IsNullOrWhiteSpace(dto.Url))
            return BadRequest(new { error = "URL is required." });

         var recipe = await m_service.GetByIdAsync(id);
         if (recipe == null)
            return NotFound(new { error = "Recipe not found." });

         try
         {
            // SSRF VULNERABILITY: Fetches user-provided URL without validation
            using var httpClient = new HttpClient();
            httpClient.Timeout = TimeSpan.FromSeconds(10);

            m_logger.LogInformation("Fetching photo from URL: {Url}", dto.Url);

            var response = await httpClient.GetAsync(dto.Url);
            response.EnsureSuccessStatusCode();

            var contentBytes = await response.Content.ReadAsByteArrayAsync();

            m_logger.LogInformation("Downloaded {Size} bytes from {Url}", contentBytes.Length, dto.Url);

            // Create directory structure
            var relativeDir = Path.Combine("uploads", "recipes", id.ToString());
            var absoluteDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", relativeDir);
            Directory.CreateDirectory(absoluteDir);

            // PATH TRAVERSAL VULNERABILITY: Uses user-provided filename without sanitization
            var filename = dto.Filename ?? Path.GetFileName(dto.Url) ?? "photo.jpg";
            var absolutePath = Path.Combine(absoluteDir, filename);

            m_logger.LogInformation("Saving file to: {Path}", absolutePath);

            // Save file
            await System.IO.File.WriteAllBytesAsync(absolutePath, contentBytes);

            // Update recipe with web-accessible path
            recipe.Photo = "/" + Path.Combine(relativeDir, filename).Replace('\\', '/');
            var updated = await m_service.UpdateAsync(id, recipe);

            return Ok(new
            {
               message = "Photo uploaded from URL successfully",
               path = absolutePath,
               size = contentBytes.Length,
               recipe = updated
            });
         }
         catch (HttpRequestException ex)
         {
            m_logger.LogError(ex, "Failed to fetch URL: {Url}", dto.Url);
            return BadRequest(new { error = $"Failed to fetch URL: {ex.Message}" });
         }
         catch (Exception ex)
         {
            m_logger.LogError(ex, "Error uploading photo from URL");
            return StatusCode(500, new { error = $"Internal error: {ex.Message}" });
         }
      }
   }
}
