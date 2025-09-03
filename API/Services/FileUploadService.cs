using Microsoft.AspNetCore.Http;
using System.Text.RegularExpressions;

namespace API.Services;

public interface IFileUploadService
{
    Task<string> UploadProductImageAsync(IFormFile file);
    Task<string> UploadProductImageFromDataUrlAsync(string dataUrl);
    void DeleteProductImageAsync(string fileName);
}

public class FileUploadService : IFileUploadService
{
    private readonly IWebHostEnvironment _environment;
    private readonly string _apiProductImagesPath;
    private readonly string _clientProductImagesPath;

    public FileUploadService(IWebHostEnvironment environment)
    {
        _environment = environment;
        
        // Save in API wwwroot/images/products for proper static file serving
        _apiProductImagesPath = Path.Combine(_environment.WebRootPath, "images", "products");
        
        // Save in client public/images/products for frontend access
        var clientPath = Path.Combine(_environment.ContentRootPath, "..", "client", "public", "images", "products");
        _clientProductImagesPath = Path.GetFullPath(clientPath);
        
        // Ensure both directories exist
        if (!Directory.Exists(_apiProductImagesPath))
        {
            Directory.CreateDirectory(_apiProductImagesPath);
        }
        
        if (!Directory.Exists(_clientProductImagesPath))
        {
            Directory.CreateDirectory(_clientProductImagesPath);
        }
    }

    public async Task<string> UploadProductImageAsync(IFormFile file)
    {
        if (file == null || file.Length == 0)
            throw new ArgumentException("File is empty or null");

        // Validate file type
        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
        var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
        
        if (!allowedExtensions.Contains(fileExtension))
            throw new ArgumentException("Invalid file type. Only JPG, PNG, GIF, and WebP are allowed.");

        // Validate file size (max 10MB)
        if (file.Length > 10 * 1024 * 1024)
            throw new ArgumentException("File size too large. Maximum size is 10MB.");

        // Generate unique filename
        var fileName = $"{Guid.NewGuid()}{fileExtension}";
        var apiFilePath = Path.Combine(_apiProductImagesPath, fileName);
        var clientFilePath = Path.Combine(_clientProductImagesPath, fileName);

        // Read file content once
        using var memoryStream = new MemoryStream();
        await file.CopyToAsync(memoryStream);
        var fileBytes = memoryStream.ToArray();

        // Save file to both locations
        await File.WriteAllBytesAsync(apiFilePath, fileBytes);
        await File.WriteAllBytesAsync(clientFilePath, fileBytes);

        // Return the relative path for database storage (API path)
        return $"/images/products/{fileName}";
    }

    public async Task<string> UploadProductImageFromDataUrlAsync(string dataUrl)
    {
        if (string.IsNullOrEmpty(dataUrl))
            throw new ArgumentException("Data URL is empty or null");

        // Parse data URL to extract MIME type and base64 data
        var match = Regex.Match(dataUrl, @"^data:([^;]+);base64,(.+)$");
        if (!match.Success)
            throw new ArgumentException("Invalid data URL format");

        var mimeType = match.Groups[1].Value;
        var base64Data = match.Groups[2].Value;

        // Validate MIME type
        var allowedMimeTypes = new[] { "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp" };
        if (!allowedMimeTypes.Contains(mimeType.ToLower()))
            throw new ArgumentException("Invalid image type. Only JPG, PNG, GIF, and WebP are allowed.");

        // Convert base64 to bytes
        var imageBytes = Convert.FromBase64String(base64Data);

        // Validate file size (max 10MB)
        if (imageBytes.Length > 10 * 1024 * 1024)
            throw new ArgumentException("File size too large. Maximum size is 10MB.");

        // Determine file extension from MIME type
        var extension = mimeType.ToLower() switch
        {
            "image/jpeg" or "image/jpg" => ".jpg",
            "image/png" => ".png",
            "image/gif" => ".gif",
            "image/webp" => ".webp",
            _ => ".jpg"
        };

        // Generate unique filename
        var fileName = $"{Guid.NewGuid()}{extension}";
        var apiFilePath = Path.Combine(_apiProductImagesPath, fileName);
        var clientFilePath = Path.Combine(_clientProductImagesPath, fileName);

        // Save file to both locations
        await File.WriteAllBytesAsync(apiFilePath, imageBytes);
        await File.WriteAllBytesAsync(clientFilePath, imageBytes);

        // Return the relative path for database storage (API path)
        return $"/images/products/{fileName}";
    }

    public void DeleteProductImageAsync(string fileName)
    {
        if (string.IsNullOrEmpty(fileName))
            return;

        // Extract just the filename from the path
        var fileNameOnly = Path.GetFileName(fileName);
        if (string.IsNullOrEmpty(fileNameOnly))
            return;

        var apiFilePath = Path.Combine(_apiProductImagesPath, fileNameOnly);
        var clientFilePath = Path.Combine(_clientProductImagesPath, fileNameOnly);
        
        // Delete from both locations
        if (File.Exists(apiFilePath))
        {
            File.Delete(apiFilePath);
        }
        
        if (File.Exists(clientFilePath))
        {
            File.Delete(clientFilePath);
        }
    }
}
