using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using System.Threading.Tasks;
using System.Text.RegularExpressions;
using System.Web;


[ApiController]
[ServiceFilter(typeof(IpRestrictionAttribute))]
[Route("api/[controller]")]
public class SecretsController : ControllerBase
{
	[HttpGet]
	public async Task<IActionResult> GetSecret()
	{
		var html = @"
         <!DOCTYPE html>
         <html>
         <head>
            <title>Top Secret</title>
            <meta property='og:title' content='Top Secret Title' />
            <meta property='og:description' content='This is a confidential message.' />
            <meta property='og:image' content='https://example.com/secret.png' />
         </head>
         <body>
            <h1>This is a top secret</h1>
         </body>
         </html>";

      return Content(html, "text/html");
	}
}			
