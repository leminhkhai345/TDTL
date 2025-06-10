using ExchangeDocument.BusinessLayer.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ExchangeDocument.BusinessLayer.Interfaces.Services
{
    public interface IDocumentService
    {
        Task<(DocumentDto? document, string? errorMessage)> AddDocumentAsync(DocumentCreateDto documentDto, int userId);
        Task<DocumentDetailDto?> GetListedDocumentDetailsByIdAsync(int id);
        Task<(DocumentDetailDto? document, string? errorMessage)> UpdateDocumentAsync(int id, DocumentUpdateDto updateDto, int userId);
        /// <summary>
        /// Soft-delete a document by its ID and user permission.
        /// </summary>
        Task<string?> DeleteDocumentAsync(int id, int userId);
        /// <summary>
        /// Get current user's inventory (InStock and Listed documents) with basic pagination.
        /// </summary>
        Task<PagedResult<DocumentInventoryDto>> GetMyInventoryAsync(int userId, DocumentQueryParameters queryParams);
        /// <summary>
        /// Get details of a document that belongs to current user and is still in inventory (InStock, Listed, PendingSale).
        /// </summary>
        Task<(DocumentDetailDto? document, string? errorMessage)> GetMyDocumentByIdAsync(int id, int userId);
        // Các phương thức khác cho CRUD, search sẽ được thêm vào đây
    }
}
