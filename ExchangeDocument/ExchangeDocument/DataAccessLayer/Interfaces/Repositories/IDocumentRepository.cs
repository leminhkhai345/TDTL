using ExchangeDocument.DataAccessLayer.Entities;
using ExchangeDocument.BusinessLayer.DTOs;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace ExchangeDocument.DataAccessLayer.Interfaces.Repositories
{
    public interface IDocumentRepository
    {
        Task<Document> AddAsync(Document document);
        Task<Document?> GetByIdAsync(int id);
        Task<Document?> GetListedDocumentDetailsByIdAsync(int id);
        // Các phương thức CRUD khác có thể thêm vào đây
        Task<Document> UpdateAsync(Document document);
        /// <summary>
        /// Soft-delete a document by marking IsDeleted flag.
        /// </summary>
        Task SoftDeleteAsync(Document document);
        /// <summary>
        /// Get a paginated list of documents for a specific user, filtering by inventory status (InStock, Listed).
        /// </summary>
        Task<PagedResult<Document>> GetInventoryByUserAsync(int userId, DocumentQueryParameters queryParams);
    }
}
