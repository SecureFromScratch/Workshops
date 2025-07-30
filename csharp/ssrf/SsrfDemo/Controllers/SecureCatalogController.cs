using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;
using System.ComponentModel.DataAnnotations;

// Model
public class CatalogItem
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public decimal Price { get; set; }
}

// Request DTO with validation and pagination
public class CatalogQuery
{
    [StringLength(50, ErrorMessage = "Category is too long.")]
    public string? Category { get; set; }

    [Range(0, double.MaxValue, ErrorMessage = "MinPrice cannot be negative.")]
    public decimal? MinPrice { get; set; }

    [Range(0, double.MaxValue, ErrorMessage = "MaxPrice cannot be negative.")]
    public decimal? MaxPrice { get; set; }

    [StringLength(100, ErrorMessage = "Search term is too long.")]
    public string? SearchTerm { get; set; }

    [Range(1, 100, ErrorMessage = "PageSize must be between 1 and 100.")]
    public int PageSize { get; set; } = 20;

    [Range(1, int.MaxValue, ErrorMessage = "PageNumber must be at least 1.")]
    public int PageNumber { get; set; } = 1;
}

// API Response DTO for pagination
public class PagedResult<T>
{
    public IEnumerable<T> Items { get; set; } = Enumerable.Empty<T>();
    public int TotalCount { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
}

// Controller
[Authorize]
[ApiController]
[Route("api/[controller]")]
public class CatalogController : ControllerBase
{
    // Simulated read-only catalog
    private static readonly List<CatalogItem> Catalog = new()
    {
        new CatalogItem { Id = 1, Name = "Red Shirt", Category = "Clothing", Price = 29.99m },
        new CatalogItem { Id = 2, Name = "Blue Jeans", Category = "Clothing", Price = 49.99m },
        new CatalogItem { Id = 3, Name = "Tablet", Category = "Electronics", Price = 199.99m },
        new CatalogItem { Id = 4, Name = "Headphones", Category = "Electronics", Price = 79.99m }
        // Add more items as needed
    };

    [HttpPost("search")]
    public ActionResult<PagedResult<CatalogItem>> Search([FromBody] CatalogQuery query)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var results = Catalog.AsQueryable();

        if (!string.IsNullOrWhiteSpace(query.Category))
            results = results.Where(i => i.Category.Equals(query.Category.Trim(), System.StringComparison.OrdinalIgnoreCase));

        if (query.MinPrice.HasValue)
            results = results.Where(i => i.Price >= query.MinPrice.Value);

        if (query.MaxPrice.HasValue)
            results = results.Where(i => i.Price <= query.MaxPrice.Value);

        if (!string.IsNullOrWhiteSpace(query.SearchTerm))
            results = results.Where(i => i.Name.Contains(query.SearchTerm.Trim(), System.StringComparison.OrdinalIgnoreCase));

        int total = results.Count();

        // Controlled resource consumption: Limit to max PageSize of 100
        int validatedPageSize = Math.Min(query.PageSize, 100);
        int pageNumber = query.PageNumber < 1 ? 1 : query.PageNumber;

        var page = results
            .Skip((pageNumber - 1) * validatedPageSize)
            .Take(validatedPageSize)
            .ToList();

        var pagedResult = new PagedResult<CatalogItem>
        {
            Items = page,
            TotalCount = total,
            PageNumber = pageNumber,
            PageSize = validatedPageSize
        };

        return Ok(pagedResult);
    }
}