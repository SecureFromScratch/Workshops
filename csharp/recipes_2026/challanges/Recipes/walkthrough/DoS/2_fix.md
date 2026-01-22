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

    // Validate file size (e.g., max 5MB)
    const long maxFileSize = 5 * 1024 * 1024;
    if (photoFile.Length > maxFileSize)
        return BadRequest(new { error = "File too large. Maximum size is 5MB." });

    var recipe = await m_service.GetByIdAsync(id);
    if (recipe is null)
        return NotFound(new { error = "Recipe not found." });

    // Validate content type
    var allowedTypes = new[] { "image/jpeg", "image/png", "image/webp" };
    if (!allowedTypes.Contains(photoFile.ContentType?.ToLowerInvariant()))
        return BadRequest(new { error = "Invalid file type. Only JPEG, PNG, and WebP are allowed." });

    // Validate file signature (magic bytes) to prevent MIME type spoofing
    if (!await IsValidImageAsync(photoFile))
        return BadRequest(new { error = "File content does not match its type." });

    // Determine extension from validated content type
    var ext = photoFile.ContentType!.ToLowerInvariant() switch
    {
        "image/jpeg" => ".jpg",
        "image/png" => ".png",
        "image/webp" => ".webp",
        _ => null
    };

    if (ext == null)
        return BadRequest(new { error = "Unsupported image type." });

    // Generate a safe, random filename (prevents path traversal and overwrites)
    var safeFileName = $"{Guid.NewGuid()}{ext}";

    // Create directory structure
    var relativeDir = Path.Combine("uploads", "recipes", id.ToString());
    var absoluteDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", relativeDir);
    Directory.CreateDirectory(absoluteDir);

    // Build path with sanitized filename
    var absolutePath = Path.Combine(absoluteDir, safeFileName);

    // Ensure the resolved path is still within the intended directory (defense in depth)
    var fullAbsoluteDir = Path.GetFullPath(absoluteDir);
    var fullAbsolutePath = Path.GetFullPath(absolutePath);
    if (!fullAbsolutePath.StartsWith(fullAbsoluteDir, StringComparison.OrdinalIgnoreCase))
        return BadRequest(new { error = "Invalid file path." });

    // Save file
    await using (var fs = System.IO.File.Create(absolutePath))
    {
        await photoFile.CopyToAsync(fs, HttpContext.RequestAborted);
    }

    // Update recipe with web-accessible path
    recipe.Photo = "/" + Path.Combine(relativeDir, safeFileName).Replace('\\', '/');

    var updated = await m_service.UpdateAsync(id, recipe);

    return Ok(updated);
}

// Helper method to validate image file signatures
private async Task<bool> IsValidImageAsync(IFormFile file)
{
    var buffer = new byte[8];
    await using var stream = file.OpenReadStream();
    await stream.ReadAsync(buffer, 0, buffer.Length);
    stream.Position = 0; // Reset for later use

    // Check magic bytes for common image formats
    return file.ContentType?.ToLowerInvariant() switch
    {
        "image/jpeg" => buffer[0] == 0xFF && buffer[1] == 0xD8 && buffer[2] == 0xFF,
        "image/png" => buffer[0] == 0x89 && buffer[1] == 0x50 && buffer[2] == 0x4E && buffer[3] == 0x47,
        "image/webp" => buffer[0] == 0x52 && buffer[1] == 0x49 && buffer[2] == 0x46 && buffer[3] == 0x46 &&
                        buffer[8] == 0x57 && buffer[9] == 0x45 && buffer[10] == 0x42 && buffer[11] == 0x50,
        _ => false
    };
}
```

