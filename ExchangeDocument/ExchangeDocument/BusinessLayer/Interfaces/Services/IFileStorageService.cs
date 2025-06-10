using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

namespace ExchangeDocument.BusinessLayer.Interfaces.Services;

public interface IFileStorageService
{
    /// <summary>
    /// Lưu file vào thư mục wwwroot/files và trả về URL (đường dẫn tương đối bắt đầu bằng "/files/...").
    /// </summary>
    /// <param name="file">IFormFile upload</param>
    /// <param name="subDirectory">thư mục con (ví dụ "reviews")</param>
    /// <returns>Đường dẫn URL tương đối</returns>
    Task<string> SaveFileAsync(IFormFile file, string subDirectory);

    /// <summary>
    /// Xoá file vật lý nếu tồn tại (idempotent).
    /// </summary>
    Task DeleteFileAsync(string fileUrl);
}
