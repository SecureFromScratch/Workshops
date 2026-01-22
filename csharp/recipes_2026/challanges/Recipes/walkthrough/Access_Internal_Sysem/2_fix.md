# SSRF Vulnerability Remediation Tutorial

The current code blindly fetches any URL provided by the user:

```csharp
// VULNERABLE CODE
var response = await httpClient.GetAsync(dto.Url);
```

**Why this is dangerous:**
- Allows access to internal services (localhost, 127.0.0.1, internal IPs)
- Can access cloud metadata services
- No validation of URL scheme, hostname, or port
- Server acts as a proxy for attackers

## Defense-in-Depth Strategy

We'll implement **multiple layers** of protection:

1. ✅ URL validation and allowlisting
2. ✅ Scheme restriction
3. ✅ Hostname/IP blocklisting
4. ✅ DNS resolution validation
5. ✅ Network-level restrictions
6. ✅ Request timeout and size limits
7. ✅ Content-type validation
8. ✅ Logging and monitoring

## Implementation

### Step 1: Create a URL Validation Service

Create a new file `Services/UrlValidationService.cs`:

```csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text.RegularExpressions;

namespace YourApp.Services
{
    public interface IUrlValidationService
    {
        (bool IsValid, string Error) ValidateUrl(string url);
    }

    public class UrlValidationService : IUrlValidationService
    {
        // Allowlist: Only allow specific domains (MOST SECURE)
        private static readonly HashSet<string> AllowedDomains = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "imgur.com",
            "i.imgur.com",
            "unsplash.com",
            "images.unsplash.com",
            "pixabay.com",
            "cdn.pixabay.com",
            "pexels.com",
            "images.pexels.com"
            // Add other trusted image hosting services
        };

        // Blocklist: Dangerous IP ranges and hostnames
        private static readonly HashSet<string> BlockedHostnames = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "localhost",
            "127.0.0.1",
            "0.0.0.0",
            "[::1]",
            "::1",
            "metadata",
            "metadata.google.internal",
            "169.254.169.254",
            "instance-data"
        };

        // Private IP ranges (CIDR notation)
        private static readonly List<(IPAddress Network, int PrefixLength)> PrivateIpRanges = new List<(IPAddress, int)>
        {
            (IPAddress.Parse("10.0.0.0"), 8),       // 10.0.0.0/8
            (IPAddress.Parse("172.16.0.0"), 12),    // 172.16.0.0/12
            (IPAddress.Parse("192.168.0.0"), 16),   // 192.168.0.0/16
            (IPAddress.Parse("127.0.0.0"), 8),      // 127.0.0.0/8 (loopback)
            (IPAddress.Parse("169.254.0.0"), 16),   // 169.254.0.0/16 (link-local)
            (IPAddress.Parse("fc00::"), 7),         // fc00::/7 (IPv6 private)
            (IPAddress.Parse("fe80::"), 10)         // fe80::/10 (IPv6 link-local)
        };

        private readonly ILogger<UrlValidationService> _logger;

        public UrlValidationService(ILogger<UrlValidationService> logger)
        {
            _logger = logger;
        }

        public (bool IsValid, string Error) ValidateUrl(string url)
        {
            // Step 1: Basic validation
            if (string.IsNullOrWhiteSpace(url))
            {
                return (false, "URL cannot be empty");
            }

            // Step 2: Parse URL
            if (!Uri.TryCreate(url, UriKind.Absolute, out Uri? uri))
            {
                return (false, "Invalid URL format");
            }

            // Step 3: Validate scheme (only HTTPS for production, HTTP for dev)
            if (uri.Scheme != Uri.UriSchemeHttps && uri.Scheme != Uri.UriSchemeHttp)
            {
                _logger.LogWarning("Blocked URL with invalid scheme: {Scheme}", uri.Scheme);
                return (false, $"Only HTTP and HTTPS schemes are allowed. Blocked: {uri.Scheme}");
            }

            // PRODUCTION: Force HTTPS only
            // Uncomment this in production:
            // if (uri.Scheme != Uri.UriSchemeHttps)
            // {
            //     return (false, "Only HTTPS URLs are allowed");
            // }

            // Step 4: Check domain allowlist
            if (!IsHostnameAllowed(uri.Host))
            {
                _logger.LogWarning("Blocked URL with disallowed domain: {Host}", uri.Host);
                return (false, $"Domain not allowed: {uri.Host}. Only trusted image hosting services are permitted.");
            }

            // Step 5: Check hostname blocklist
            if (IsHostnameBlocked(uri.Host))
            {
                _logger.LogWarning("Blocked URL with dangerous hostname: {Host}", uri.Host);
                return (false, "Access to this hostname is forbidden");
            }

            // Step 6: Validate port (block non-standard ports)
            if (uri.Port != 80 && uri.Port != 443 && uri.Port != -1)
            {
                _logger.LogWarning("Blocked URL with non-standard port: {Port}", uri.Port);
                return (false, "Only standard HTTP/HTTPS ports (80, 443) are allowed");
            }

            // Step 7: DNS resolution check (prevent DNS rebinding attacks)
            if (!IsSafeDnsResolution(uri.Host))
            {
                _logger.LogWarning("Blocked URL due to unsafe DNS resolution: {Host}", uri.Host);
                return (false, "This hostname resolves to a restricted IP address");
            }

            // Step 8: Additional security checks
            if (ContainsSuspiciousPatterns(url))
            {
                _logger.LogWarning("Blocked URL with suspicious patterns: {Url}", url);
                return (false, "URL contains suspicious patterns");
            }

            _logger.LogInformation("URL validation passed: {Url}", url);
            return (true, string.Empty);
        }

        private bool IsHostnameAllowed(string hostname)
        {
            // Check if hostname matches allowlist (exact match or subdomain)
            foreach (var allowedDomain in AllowedDomains)
            {
                if (hostname.Equals(allowedDomain, StringComparison.OrdinalIgnoreCase) ||
                    hostname.EndsWith("." + allowedDomain, StringComparison.OrdinalIgnoreCase))
                {
                    return true;
                }
            }
            return false;
        }

        private bool IsHostnameBlocked(string hostname)
        {
            // Check exact blocklist
            if (BlockedHostnames.Contains(hostname))
            {
                return true;
            }

            // Check for IP address format
            if (IPAddress.TryParse(hostname, out IPAddress? ipAddress))
            {
                return IsPrivateOrLocalIp(ipAddress);
            }

            return false;
        }

        private bool IsSafeDnsResolution(string hostname)
        {
            try
            {
                // Resolve hostname to IP addresses
                var addresses = Dns.GetHostAddresses(hostname);

                // Check if any resolved IP is private or local
                foreach (var address in addresses)
                {
                    if (IsPrivateOrLocalIp(address))
                    {
                        _logger.LogWarning("DNS resolution blocked: {Hostname} resolves to private IP {IP}", 
                            hostname, address);
                        return false;
                    }
                }

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "DNS resolution failed for {Hostname}", hostname);
                return false; // Fail secure: if DNS fails, block the request
            }
        }

        private bool IsPrivateOrLocalIp(IPAddress ipAddress)
        {
            // Check loopback
            if (IPAddress.IsLoopback(ipAddress))
            {
                return true;
            }

            // Check if IP is in private ranges
            foreach (var (network, prefixLength) in PrivateIpRanges)
            {
                if (IsInSubnet(ipAddress, network, prefixLength))
                {
                    return true;
                }
            }

            // Block link-local addresses
            var bytes = ipAddress.GetAddressBytes();
            if (ipAddress.AddressFamily == System.Net.Sockets.AddressFamily.InterNetwork)
            {
                // 169.254.0.0/16
                if (bytes[0] == 169 && bytes[1] == 254)
                {
                    return true;
                }
            }

            return false;
        }

        private bool IsInSubnet(IPAddress address, IPAddress network, int prefixLength)
        {
            if (address.AddressFamily != network.AddressFamily)
                return false;

            var addressBytes = address.GetAddressBytes();
            var networkBytes = network.GetAddressBytes();

            int fullBytes = prefixLength / 8;
            int remainingBits = prefixLength % 8;

            // Check full bytes
            for (int i = 0; i < fullBytes; i++)
            {
                if (addressBytes[i] != networkBytes[i])
                    return false;
            }

            // Check remaining bits
            if (remainingBits > 0)
            {
                byte mask = (byte)(0xFF << (8 - remainingBits));
                if ((addressBytes[fullBytes] & mask) != (networkBytes[fullBytes] & mask))
                    return false;
            }

            return true;
        }

        private bool ContainsSuspiciousPatterns(string url)
        {
            // Check for URL encoding tricks
            if (Regex.IsMatch(url, @"%[0-9a-fA-F]{2}", RegexOptions.IgnoreCase))
            {
                var decoded = Uri.UnescapeDataString(url);
                if (decoded.Contains("localhost", StringComparison.OrdinalIgnoreCase) ||
                    decoded.Contains("127.0.0.1") ||
                    decoded.Contains("169.254"))
                {
                    return true;
                }
            }

            // Check for IP address in decimal or other formats
            if (Regex.IsMatch(url, @"\d{8,10}")) // Decimal IP representation
            {
                return true;
            }

            // Check for IPv6 variations
            if (url.Contains("::") || url.Contains("[::1]"))
            {
                return true;
            }

            // Check for @ symbol (credential bypass attempt)
            if (url.Contains("@"))
            {
                return true;
            }

            return false;
        }
    }
}
```

### Step 2: Create a Safe HTTP Client Service

Create `Services/SafeHttpClientService.cs`:

```csharp
using System;
using System.IO;
using System.Net.Http;
using System.Threading.Tasks;

namespace YourApp.Services
{
    public interface ISafeHttpClientService
    {
        Task<(bool Success, byte[] Content, string Error)> FetchImageAsync(string url);
    }

    public class SafeHttpClientService : ISafeHttpClientService
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IUrlValidationService _urlValidationService;
        private readonly ILogger<SafeHttpClientService> _logger;

        // Security limits
        private const int MaxFileSizeBytes = 10 * 1024 * 1024; // 10 MB
        private const int TimeoutSeconds = 10;

        // Allowed content types
        private static readonly HashSet<string> AllowedContentTypes = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/gif",
            "image/webp",
            "image/svg+xml"
        };

        public SafeHttpClientService(
            IHttpClientFactory httpClientFactory,
            IUrlValidationService urlValidationService,
            ILogger<SafeHttpClientService> logger)
        {
            _httpClientFactory = httpClientFactory;
            _urlValidationService = urlValidationService;
            _logger = logger;
        }

        public async Task<(bool Success, byte[] Content, string Error)> FetchImageAsync(string url)
        {
            // Step 1: Validate URL
            var (isValid, validationError) = _urlValidationService.ValidateUrl(url);
            if (!isValid)
            {
                _logger.LogWarning("URL validation failed: {Error}", validationError);
                return (false, Array.Empty<byte>(), validationError);
            }

            try
            {
                // Step 2: Create HTTP client with strict configuration
                var httpClient = _httpClientFactory.CreateClient();
                httpClient.Timeout = TimeSpan.FromSeconds(TimeoutSeconds);
                httpClient.DefaultRequestHeaders.Add("User-Agent", "RecipeApp/1.0");

                // Step 3: Send HEAD request first to check content type and size
                var headResponse = await httpClient.SendAsync(
                    new HttpRequestMessage(HttpMethod.Head, url),
                    HttpCompletionOption.ResponseHeadersRead);

                if (!headResponse.IsSuccessStatusCode)
                {
                    return (false, Array.Empty<byte>(), $"Server returned {headResponse.StatusCode}");
                }

                // Step 4: Validate content type
                var contentType = headResponse.Content.Headers.ContentType?.MediaType;
                if (string.IsNullOrEmpty(contentType) || !AllowedContentTypes.Contains(contentType))
                {
                    _logger.LogWarning("Invalid content type: {ContentType}", contentType);
                    return (false, Array.Empty<byte>(), 
                        $"Invalid content type: {contentType}. Only images are allowed.");
                }

                // Step 5: Validate content length
                var contentLength = headResponse.Content.Headers.ContentLength;
                if (contentLength.HasValue && contentLength.Value > MaxFileSizeBytes)
                {
                    _logger.LogWarning("File too large: {Size} bytes", contentLength.Value);
                    return (false, Array.Empty<byte>(), 
                        $"File too large: {contentLength.Value} bytes. Maximum: {MaxFileSizeBytes} bytes");
                }

                // Step 6: Fetch the actual content
                _logger.LogInformation("Fetching image from validated URL: {Url}", url);
                var getResponse = await httpClient.GetAsync(url, HttpCompletionOption.ResponseHeadersRead);
                getResponse.EnsureSuccessStatusCode();

                // Step 7: Read content with size limit
                using var stream = await getResponse.Content.ReadAsStreamAsync();
                using var memoryStream = new MemoryStream();
                
                var buffer = new byte[8192];
                int totalBytesRead = 0;
                int bytesRead;

                while ((bytesRead = await stream.ReadAsync(buffer, 0, buffer.Length)) > 0)
                {
                    totalBytesRead += bytesRead;
                    
                    // Enforce size limit during download
                    if (totalBytesRead > MaxFileSizeBytes)
                    {
                        _logger.LogWarning("Download exceeded size limit");
                        return (false, Array.Empty<byte>(), "File size exceeded maximum limit during download");
                    }

                    await memoryStream.WriteAsync(buffer, 0, bytesRead);
                }

                var content = memoryStream.ToArray();
                _logger.LogInformation("Successfully fetched {Size} bytes from {Url}", content.Length, url);

                return (true, content, string.Empty);
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "HTTP request failed for URL: {Url}", url);
                return (false, Array.Empty<byte>(), $"Failed to fetch URL: {ex.Message}");
            }
            catch (TaskCanceledException ex)
            {
                _logger.LogError(ex, "Request timeout for URL: {Url}", url);
                return (false, Array.Empty<byte>(), "Request timeout");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error fetching URL: {Url}", url);
                return (false, Array.Empty<byte>(), "An unexpected error occurred");
            }
        }
    }
}
```

### Step 3: Update the Controller

Update your controller to use the new services:

```csharp
[HttpPost("{id:long}/photo-from-url")]
public async Task<IActionResult> UploadPhotoFromUrl(long id, [FromBody] PhotoFromUrlDto dto)
{
    if (string.IsNullOrWhiteSpace(dto.Url))
        return BadRequest(new { error = "URL is required." });

    var recipe = await m_service.GetByIdAsync(id);
    if (recipe == null)
        return NotFound(new { error = "Recipe not found." });

    // FIXED: Use safe HTTP client with validation
    var (success, contentBytes, error) = await _safeHttpClient.FetchImageAsync(dto.Url);
    
    if (!success)
    {
        m_logger.LogWarning("Failed to fetch image from {Url}: {Error}", dto.Url, error);
        return BadRequest(new { error = error });
    }

    try
    {
        // Create directory structure
        var relativeDir = Path.Combine("uploads", "recipes", id.ToString());
        var absoluteDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", relativeDir);
        Directory.CreateDirectory(absoluteDir);

        // FIXED: Sanitize filename to prevent path traversal
        var filename = SanitizeFilename(dto.Filename ?? "photo.jpg");
        var absolutePath = Path.Combine(absoluteDir, filename);

        // SECURITY: Ensure the final path is still within the uploads directory
        var normalizedPath = Path.GetFullPath(absolutePath);
        var normalizedDir = Path.GetFullPath(absoluteDir);
        
        if (!normalizedPath.StartsWith(normalizedDir, StringComparison.OrdinalIgnoreCase))
        {
            m_logger.LogWarning("Path traversal attempt detected: {Path}", absolutePath);
            return BadRequest(new { error = "Invalid filename" });
        }

        m_logger.LogInformation("Saving file to: {Path}", absolutePath);

        // Save file
        await System.IO.File.WriteAllBytesAsync(absolutePath, contentBytes);

        // Update recipe with web-accessible path
        recipe.Photo = "/" + Path.Combine(relativeDir, filename).Replace('\\', '/');
        var updated = await m_service.UpdateAsync(id, recipe);

        return Ok(new
        {
            message = "Photo uploaded from URL successfully",
            // SECURITY: Don't expose absolute filesystem paths
            filename = filename,
            size = contentBytes.Length,
            recipe = updated
        });
    }
    catch (Exception ex)
    {
        m_logger.LogError(ex, "Error saving photo");
        return StatusCode(500, new { error = "Internal error occurred" });
    }
}

private string SanitizeFilename(string filename)
{
    // Remove any path separators
    filename = Path.GetFileName(filename);
    
    // Remove invalid characters
    var invalidChars = Path.GetInvalidFileNameChars();
    filename = string.Join("_", filename.Split(invalidChars, StringSplitOptions.RemoveEmptyEntries));
    
    // Ensure it's not empty and has a safe extension
    if (string.IsNullOrWhiteSpace(filename))
    {
        filename = "photo.jpg";
    }
    
    // Limit length
    if (filename.Length > 100)
    {
        var extension = Path.GetExtension(filename);
        filename = filename.Substring(0, 100 - extension.Length) + extension;
    }
    
    return filename;
}
```

### Step 4: Register Services in Startup/Program.cs

```csharp
// In Program.cs or Startup.cs
builder.Services.AddHttpClient(); // For IHttpClientFactory
builder.Services.AddScoped<IUrlValidationService, UrlValidationService>();
builder.Services.AddScoped<ISafeHttpClientService, SafeHttpClientService>();
```

### Step 5: Add Configuration (appsettings.json)

```json
{
  "Security": {
    "AllowedImageDomains": [
      "imgur.com",
      "i.imgur.com",
      "unsplash.com",
      "images.unsplash.com"
    ],
    "MaxImageSizeBytes": 10485760,
    "RequestTimeoutSeconds": 10
  }
}
```

