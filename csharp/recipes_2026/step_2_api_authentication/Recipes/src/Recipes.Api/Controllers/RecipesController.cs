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
   //[Authorize(Policy = "TaskPolicy")]
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

      public class RecipeCreateUpdateDto
      {
         public string Name { get; set; } = string.Empty;
         public string? Description { get; set; }
         public string? Photo { get; set; }

         // Use the alias, not bare TaskStatus
         public RecipeStatus Status { get; set; } = RecipeStatus.Draft;
      }

      [HttpPost]
      public async Task<ActionResult<Recipe>> Create([FromBody] RecipeCreateUpdateDto dto)
      {
         var userName = User.Identity?.Name ?? "unknown";

         var entity = new Recipe
         {
            Name = dto.Name,
            Description = dto.Description,
            Photo = dto.Photo,
            Status = dto.Status
         };

         var created = await m_service.CreateAsync(entity, userName);
         return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
      }

      [HttpPut("{id:long}")]
      public async Task<ActionResult<Recipe>> Update(long id, [FromBody] RecipeCreateUpdateDto dto)
      {
         var entity = new Recipe
         {
            Name = dto.Name,
            Description = dto.Description,
            Photo = dto.Photo,
            Status = dto.Status
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
            return BadRequest("Missing file.");

         const long maxBytes = 5 * 1024 * 1024;
         if (photoFile.Length > maxBytes)
            return BadRequest("File too large.");

         var ct = photoFile.ContentType ?? "";
         if (ct != "image/jpeg" && ct != "image/png" && ct != "image/webp")
            return BadRequest("Unsupported image type.");

         var recipe = await m_service.GetByIdAsync(id);
         if (recipe is null)
            return NotFound();

         var ext = ct switch
         {
            "image/jpeg" => ".jpg",
            "image/png" => ".png",
            "image/webp" => ".webp",
            _ => ""
         };

         var fileName = $"{Guid.NewGuid():N}{ext}";
         var relDir = Path.Combine("uploads", "recipes", id.ToString());
         var absDir = Path.Combine(Environment.CurrentDirectory, relDir);
         Directory.CreateDirectory(absDir);

         var absPath = Path.Combine(absDir, fileName);
         await using (var fs = System.IO.File.Create(absPath))
            await photoFile.CopyToAsync(fs, HttpContext.RequestAborted);

         recipe.Photo = "/" + Path.Combine(relDir, fileName).Replace('\\', '/');

         var updated = await m_service.UpdateAsync(id, recipe);
         return Ok(updated);
      }

   }
}
