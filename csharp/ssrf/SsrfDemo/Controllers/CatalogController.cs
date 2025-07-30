using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;

namespace CatalogApi.Controllers
{
	[ApiController]
	[Route("api/[controller]")]
	public class CatalogController : ControllerBase
	{
		private readonly List<CatalogItem> _items;

		public CatalogController()
		{
			_items = new List<CatalogItem>
			{
				new CatalogItem { Name = "Laptop", Category = "Electronics", Price = 1000.00m },
				new CatalogItem { Name = "Smartphone", Category = "Electronics", Price = 500.00m },
				new CatalogItem { Name = "Desk", Category = "Furniture", Price = 150.00m },
				new CatalogItem { Name = "Chair", Category = "Furniture", Price = 75.00m }
			};
		}

		[HttpGet]
		public ActionResult<IEnumerable<CatalogItem>> GetItems(
			[FromQuery] string category,
			[FromQuery] decimal? minPrice,
			[FromQuery] decimal? maxPrice)
		{
			try
			{
				var filteredItems = _items.Where(item =>
					(string.IsNullOrEmpty(category) ||
					item.Category.Equals(category, StringComparison.OrdinalIgnoreCase)) &&
					(!minPrice.HasValue || item.Price >= minPrice) &&
					(!maxPrice.HasValue || item.Price <= maxPrice)
				).ToList();

				return Ok(filteredItems);
			}
			catch (Exception ex)
			{
				return StatusCode(500, "Internal server error: " + ex.Message);
			}
		}
	}

	public class CatalogItem
	{
		public string Name { get; set; }
		public string Category { get; set; }
		public decimal Price { get; set; }
	}
}