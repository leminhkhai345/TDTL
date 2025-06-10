using ExchangeDocument.BusinessLayer.Interfaces.Services;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using System;
using System.IO;
using System.Threading.Tasks;

namespace ExchangeDocument.BusinessLayer.Services;

public class FileStorageService : IFileStorageService
{
    private readonly IWebHostEnvironment _env;

    public FileStorageService(IWebHostEnvironment env)
    {
        _env = env;
    }

    public async Task<string> SaveFileAsync(IFormFile file, string subDirectory)
    {
        var root = _env.WebRootPath ?? Path.Combine(AppContext.BaseDirectory, "wwwroot");
        var dir = Path.Combine(root, "files", subDirectory);
        if (!Directory.Exists(dir)) Directory.CreateDirectory(dir);
        var uniqueName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
        var path = Path.Combine(dir, uniqueName);
        await using var stream = new FileStream(path, FileMode.Create);
        await file.CopyToAsync(stream);
        return $"/files/{subDirectory}/{uniqueName}";
    }

    public Task DeleteFileAsync(string fileUrl)
    {
        var root = _env.WebRootPath ?? Path.Combine(AppContext.BaseDirectory, "wwwroot");
        var physical = Path.Combine(root, fileUrl.TrimStart('/').Replace('/', Path.DirectorySeparatorChar));
        if (File.Exists(physical)) File.Delete(physical);
        return Task.CompletedTask;
    }
}
