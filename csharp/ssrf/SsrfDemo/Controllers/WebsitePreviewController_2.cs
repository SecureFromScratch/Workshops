using System;
using System.Net;
using System.Net.Http;
using System.Net.Sockets;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using HtmlAgilityPack;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class PreviewController : ControllerBase
{
	private static readonly HttpClient httpClient = new HttpClient
	{
		Timeout = TimeSpan.FromSeconds(5) // Short timeout
	};

	[HttpGet("website-preview")]
	public async Task<IActionResult> GetWebsitePreview([FromQuery] string url)
	{
		try
		{
			// 1. Validate URL format and scheme
			if (!Uri.TryCreate(url, UriKind.Absolute, out var uri) ||
			(uri.Scheme != Uri.UriSchemeHttp && uri.Scheme != Uri.UriSchemeHttps))
			{
				return BadRequest("Invalid URL.");
			}

			// 2. Prevent SSRF: Block localhost, private IPs, etc.
			if (IsLocalOrPrivateAddress(uri))
			{
				return BadRequest("Forbidden URL.");
			}

			// 3. Fetch the page content securely
			var response = await httpClient.GetAsync(uri);
			if (!response.IsSuccessStatusCode)
			{
				return BadRequest("Failed to retrieve the website.");
			}

			if (response.Content.Headers.ContentType?.MediaType != "text/html")
			{
				return BadRequest("URL is not a HTML page.");
			}

			string html = await response.Content.ReadAsStringAsync();

			// 4. Parse and extract preview (title, description)
			var doc = new HtmlDocument();
			doc.LoadHtml(html);

			string title = doc.DocumentNode.SelectSingleNode("//title")?.InnerText?.Trim() ?? "";
			string description = doc.DocumentNode
			.SelectSingleNode("//meta[@name='description']")?
			.GetAttributeValue("content", "") ?? "";

			return Ok(new
			{
				Title = title,
				Description = description
			});
		}
		catch (Exception ex)
		{
			// Log ex (not shown here)
			return BadRequest("Error processing the URL.");
		}
	}

	// Prevent SSRF: block localhost, internal IPs, etc.
	private bool IsLocalOrPrivateAddress(Uri uri)
	{
		try
		{
			var host = uri.Host;

			// Block 'localhost' and common local hostnames
			if (host.Equals("localhost", StringComparison.OrdinalIgnoreCase)
			|| host.Equals("127.0.0.1")
			|| host.StartsWith("::1")
			|| host.EndsWith(".local")
			)
			{
				return true;
			}

			// Attempt to resolve DNS
			var addresses = Dns.GetHostAddresses(host);
			foreach (var ip in addresses)
			{
				if (IPAddress.IsLoopback(ip)) return true;

				// Block private address ranges: 10/8, 172.16/12, 192.168/16, IPv6 unique local etc.
				if (ip.AddressFamily == AddressFamily.InterNetwork)
				{
					byte[] bytes = ip.GetAddressBytes();
					if (bytes[0] == 10
					|| (bytes[0] == 172 && bytes[1] >= 16 && bytes[1] <= 31)
					|| (bytes[0] == 192 && bytes[1] == 168))
						return true;
				}
				else if (ip.AddressFamily == AddressFamily.InterNetworkV6)
				{
					if (ip.IsIPv6LinkLocal || ip.IsIPv6SiteLocal)
						return true;
				}
			}
		}
		catch
		{
			return true; // On DNS failure, err on the safe side
		}
		return false;
	}
}
