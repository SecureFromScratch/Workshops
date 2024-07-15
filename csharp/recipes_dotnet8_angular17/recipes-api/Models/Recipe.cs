namespace recipes_api.Models
{
    public class Recipe
    {
        public int? Id { get; set; }
        
        public string? Name { get; set; }
        public string? Instructions { get; set; }

        public string? ImagePath { get; set; }
        public string? ImageUrl { get; set; }
        public IFormFile? Image { get; set; }

        public string? Base64Image { get; set; }



    }
}
