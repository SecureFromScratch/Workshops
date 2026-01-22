using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using System.Text;
using Recipes.Api.Security;

namespace Recipes.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RecipeAiController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<RecipeAiController> _logger;
        private static string? _cachedApiKey;
        private static readonly SemaphoreSlim _semaphore = new(1, 1);

        public RecipeAiController(
            IConfiguration configuration,
            IHttpClientFactory httpClientFactory,
            ILogger<RecipeAiController> logger)
        {
            _configuration = configuration;
            _httpClientFactory = httpClientFactory;
            _logger = logger;
        }

        private async Task<string> GetOpenAiApiKeyAsync()
        {
            if (!string.IsNullOrEmpty(_cachedApiKey))
            {
                return _cachedApiKey;
            }

            await _semaphore.WaitAsync();
            try
            {
                if (!string.IsNullOrEmpty(_cachedApiKey))
                {
                    return _cachedApiKey;
                }

                // AWS Secrets Manager now returns just the plain API key string
                var apiKey = await SecretsConfig.GetOpenAIApiKeyAsync(_configuration);

                if (string.IsNullOrEmpty(apiKey))
                {
                    throw new InvalidOperationException("API key is empty");
                }

                _cachedApiKey = apiKey.Trim();
                _logger.LogInformation("✅ API key retrieved successfully");

                return _cachedApiKey;
            }
            finally
            {
                _semaphore.Release();
            }
        }

        [HttpPost("generate")]
        public async Task<IActionResult> GenerateRecipe([FromBody] RecipeGenerationRequest request)
        {
            try
            {
                var openAiApiKey = await GetOpenAiApiKeyAsync();

                if (string.IsNullOrEmpty(openAiApiKey))
                {
                    return BadRequest(new { error = "OpenAI API key not configured" });
                }

                var httpClient = _httpClientFactory.CreateClient();
                httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {openAiApiKey}");

                var systemPrompt = @"You are a professional chef and recipe creator. Generate detailed, delicious recipes in JSON format.
The response must be valid JSON with the following structure:
{
  ""name"": ""Recipe Name"",
  ""description"": ""A detailed description with ingredients, steps, and serving suggestions in HTML format"",
  ""estimatedTime"": ""30 minutes"",
  ""servings"": 4,
  ""difficulty"": ""Easy|Medium|Hard""
}

Format the description with proper HTML tags like <p>, <strong>, <ul>, <li> for better readability.
Include sections for Ingredients and Instructions.";

                var userPrompt = $"Create a recipe based on: {request.Prompt}";

                if (!string.IsNullOrEmpty(request.Cuisine))
                    userPrompt += $"\nCuisine: {request.Cuisine}";

                if (!string.IsNullOrEmpty(request.DietaryRestrictions))
                    userPrompt += $"\nDietary restrictions: {request.DietaryRestrictions}";

                if (request.Servings.HasValue)
                    userPrompt += $"\nServings: {request.Servings}";

                var openAiRequest = new
                {
                    model = "gpt-3.5-turbo",  // Cheapest OpenAI model
                    messages = new[]
                    {
                        new { role = "system", content = systemPrompt },
                        new { role = "user", content = userPrompt }
                    },
                    response_format = new { type = "json_object" },
                    temperature = 0.7
                };

                var jsonContent = new StringContent(
                    JsonSerializer.Serialize(openAiRequest),
                    Encoding.UTF8,
                    "application/json"
                );

                var response = await httpClient.PostAsync(
                    "https://api.openai.com/v1/chat/completions",
                    jsonContent
                );

                if (!response.IsSuccessStatusCode)
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    _logger.LogError($"OpenAI API error: {errorContent}");
                    return StatusCode((int)response.StatusCode, new { error = "Failed to generate recipe" });
                }

                var responseContent = await response.Content.ReadAsStringAsync();
                
                var jsonOptions = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };
                
                var openAiResponse = JsonSerializer.Deserialize<OpenAiResponse>(responseContent, jsonOptions);

                var recipeJson = openAiResponse?.Choices?.FirstOrDefault()?.Message?.Content;

                if (string.IsNullOrEmpty(recipeJson))
                {
                    return BadRequest(new { error = "No recipe generated" });
                }

                var recipe = JsonSerializer.Deserialize<GeneratedRecipe>(recipeJson, jsonOptions);
                return Ok(recipe);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating recipe");
                return StatusCode(500, new { error = "An error occurred while generating the recipe" });
            }
        }

        [HttpPost("suggest-name")]
        public async Task<IActionResult> SuggestRecipeName([FromBody] NameSuggestionRequest request)
        {
            try
            {
                var openAiApiKey = await GetOpenAiApiKeyAsync();

                if (string.IsNullOrEmpty(openAiApiKey))
                {
                    return BadRequest(new { error = "OpenAI API key not configured" });
                }

                var httpClient = _httpClientFactory.CreateClient();
                httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {openAiApiKey}");

                var userPrompt = $"Suggest 5 creative recipe names for: {request.Ingredients}. Return only a JSON array of strings.";

                var openAiRequest = new
                {
                    model = "gpt-3.5-turbo",  // Cheapest OpenAI model
                    messages = new[]
                    {
                        new { role = "system", content = "You are a creative recipe naming assistant. Return only a JSON array of recipe name strings." },
                        new { role = "user", content = userPrompt }
                    },
                    response_format = new { type = "json_object" },
                    temperature = 0.9
                };

                var jsonContent = new StringContent(
                    JsonSerializer.Serialize(openAiRequest),
                    Encoding.UTF8,
                    "application/json"
                );

                var response = await httpClient.PostAsync(
                    "https://api.openai.com/v1/chat/completions",
                    jsonContent
                );

                if (!response.IsSuccessStatusCode)
                {
                    return StatusCode((int)response.StatusCode, new { error = "Failed to generate suggestions" });
                }

                var responseContent = await response.Content.ReadAsStringAsync();
                
                var jsonOptions = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };
                
                var openAiResponse = JsonSerializer.Deserialize<OpenAiResponse>(responseContent, jsonOptions);
                var suggestionsJson = openAiResponse?.Choices?.FirstOrDefault()?.Message?.Content;

                return Ok(new { suggestions = JsonSerializer.Deserialize<string[]>(suggestionsJson, jsonOptions) });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error suggesting recipe names");
                return StatusCode(500, new { error = "An error occurred" });
            }
        }

#if DEBUG
        [HttpPost("clear-cache")]
        public IActionResult ClearCache()
        {
            _cachedApiKey = null;
            _logger.LogInformation("API key cache cleared");
            return Ok(new { message = "API key cache cleared successfully. Next request will fetch fresh from AWS Secrets Manager." });
        }
#endif
    }

    // Request/Response Models
    public class RecipeGenerationRequest
    {
        public string Prompt { get; set; } = string.Empty;
        public string? Cuisine { get; set; }
        public string? DietaryRestrictions { get; set; }
        public int? Servings { get; set; }
    }

    public class NameSuggestionRequest
    {
        public string Ingredients { get; set; } = string.Empty;
    }

    public class GeneratedRecipe
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? EstimatedTime { get; set; }
        public int? Servings { get; set; }
        public string? Difficulty { get; set; }
    }

    public class OpenAiResponse
    {
        public List<Choice>? Choices { get; set; }
    }

    public class Choice
    {
        public Message? Message { get; set; }
    }

    public class Message
    {
        public string? Content { get; set; }
    }

    // Secret response model for parsing AWS Secrets Manager JSON
    public class SecretResponse
    {
        public string Secret { get; set; } = string.Empty;
        public string? Issuer { get; set; }
        public string? Audience { get; set; }
    }
}