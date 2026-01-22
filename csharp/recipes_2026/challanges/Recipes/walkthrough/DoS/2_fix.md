## Secure File Upload

1. **Random filename** - Prevents path traversal and filename-based attacks
2. **Magic byte validation** - Verifies actual file content
3. **Strict whitelist** - Only allows specific image types
4. **File size limit** - Prevents DoS via large uploads
5. **Path validation** - Ensures final path is within intended directory
6. **No user-controlled filenames** - Eliminates entire class of attacks

```csharp
[HttpPost("{id:long}/photo")]
public async Task<IActionResult> UploadPhoto(long id, IFormFile photoFile)
{
    if (photoFile == null || photoFile.Length == 0)
        return BadRequest(new { error = "Missing file." });

    const long maxFileSize = 5 * 1024 * 1024;
    if (photoFile.Length > maxFileSize)
        return BadRequest(new { error = "File too large. Maximum size is 5MB." });

    var recipe = await m_service.GetByIdAsync(id);
    if (recipe is null)
        return NotFound(new { error = "Recipe not found." });

    // DETECT actual file type from content (magic bytes)
    var detectedType = await DetectImageTypeAsync(photoFile);
    if (detectedType == null)
        return BadRequest(new { error = "Invalid or unsupported image file." });

    // Use DETECTED type for both extension and content-type
    var ext = detectedType.Extension;
    var contentType = detectedType.MimeType;

    // Generate safe filename
    var safeFileName = $"{Guid.NewGuid()}{ext}";

    // Create directory structure
    var relativeDir = Path.Combine("uploads", "recipes", id.ToString());
    var absoluteDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", relativeDir);
    Directory.CreateDirectory(absoluteDir);

    var absolutePath = Path.Combine(absoluteDir, safeFileName);

    // Path traversal protection
    var fullAbsoluteDir = Path.GetFullPath(absoluteDir);
    var fullAbsolutePath = Path.GetFullPath(absolutePath);
    if (!fullAbsolutePath.StartsWith(fullAbsoluteDir, StringComparison.OrdinalIgnoreCase))
        return BadRequest(new { error = "Invalid file path." });

    // Save file
    await using (var fs = System.IO.File.Create(absolutePath))
    {
        photoFile.OpenReadStream().Position = 0; // Reset after detection
        await photoFile.CopyToAsync(fs, HttpContext.RequestAborted);
    }

    // Store BOTH the path and the DETECTED content type
    recipe.Photo = "/" + Path.Combine(relativeDir, safeFileName).Replace('\\', '/');
    recipe.PhotoContentType = contentType; // Store verified content type

    var updated = await m_service.UpdateAsync(id, recipe);

    return Ok(updated);
}

// Helper to detect ACTUAL file type from content
private async Task<ImageType?> DetectImageTypeAsync(IFormFile file)
{
    var buffer = new byte[12]; // Need 12 bytes for WebP
    await using var stream = file.OpenReadStream();
    var bytesRead = await stream.ReadAsync(buffer, 0, buffer.Length);
    
    if (bytesRead < 4)
        return null;

    // JPEG: FF D8 FF
    if (buffer[0] == 0xFF && buffer[1] == 0xD8 && buffer[2] == 0xFF)
        return new ImageType(".jpg", "image/jpeg");

    // PNG: 89 50 4E 47 0D 0A 1A 0A
    if (buffer[0] == 0x89 && buffer[1] == 0x50 && buffer[2] == 0x4E && buffer[3] == 0x47)
        return new ImageType(".png", "image/png");

    // WebP: RIFF .... WEBP
    if (bytesRead >= 12 &&
        buffer[0] == 0x52 && buffer[1] == 0x49 && buffer[2] == 0x46 && buffer[3] == 0x46 &&
        buffer[8] == 0x57 && buffer[9] == 0x45 && buffer[10] == 0x42 && buffer[11] == 0x50)
        return new ImageType(".webp", "image/webp");

    return null; // Unsupported or invalid
}

private record ImageType(string Extension, string MimeType);
```


