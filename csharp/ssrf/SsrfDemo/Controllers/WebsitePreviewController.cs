using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using System.Threading.Tasks;
using System.Text.RegularExpressions;
using System.Web;

[ApiController]
[Route("api/[controller]")]
public class WebsitePreviewController : ControllerBase
{
	[HttpGet]
	public async Task<IActionResult> GetPreview([FromQuery] string url)
	{
		if (string.IsNullOrWhiteSpace(url))
			return BadRequest("URL required.");		
		
		if (!Uri.TryCreate(url, UriKind.Absolute, out var uriResult))
			return BadRequest("Invalid URL.");
		
		try
		{
			using var client = new HttpClient();
			client.DefaultRequestHeaders.UserAgent.ParseAdd("Mozilla/5.0 (compatible)");
			var html = await client.GetStringAsync(url);

			# region parsing
			var title = Regex.Match(html, @"<title>\s*(.+?)\s*</title>", RegexOptions.IgnoreCase).Groups[1]?.Value ?? "";
			var descMatch = Regex.Match(html, @"<meta\s+name=[""']description[""']\s+content=[""'](.+?)[""']", RegexOptions.IgnoreCase);
			var ogTitleMatch = Regex.Match(html, @"<meta\s+property=[""']og:title[""']\s+content=[""'](.+?)[""']", RegexOptions.IgnoreCase);
			var ogDescMatch = Regex.Match(html, @"<meta\s+property=[""']og:description[""']\s+content=[""'](.+?)[""']", RegexOptions.IgnoreCase);
			var ogImgMatch = Regex.Match(html, @"<meta\s+property=[""']og:image[""']\s+content=[""'](.+?)[""']", RegexOptions.IgnoreCase);
			#endregion
			
			var preview = new
			{
				url,
				title = HttpUtility.HtmlDecode(ogTitleMatch.Groups[1].Value) ??
						HttpUtility.HtmlDecode(title),
				description = 	HttpUtility.HtmlDecode(ogDescMatch.Groups[1].Value) ??
								HttpUtility.HtmlDecode(descMatch.Groups[1].Value),
				image = ogImgMatch.Groups[1].Value
			};			

			return Ok(preview);
		}
		catch (HttpRequestException)
		{
			return NotFound("Could not fetch the URL.");
		}
		catch
		{
			return StatusCode(500, "An error occurred while processing the URL.");
		}
	}
}			
