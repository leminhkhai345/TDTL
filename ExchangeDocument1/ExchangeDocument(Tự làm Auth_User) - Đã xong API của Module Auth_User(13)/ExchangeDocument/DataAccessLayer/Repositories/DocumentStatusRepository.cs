using ExchangeDocument.DataAccessLayer.Data;
using ExchangeDocument.DataAccessLayer.Entities;
using ExchangeDocument.DataAccessLayer.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

namespace ExchangeDocument.DataAccessLayer.Repositories
{
    public class DocumentStatusRepository : IDocumentStatusRepository
    {
        private readonly ExchangeDocumentContext _context;

        public DocumentStatusRepository(ExchangeDocumentContext context)
        {
            _context = context;
        }

        public async Task<DocumentStatus?> GetByIdAsync(int id)
        {
            // Chỉ tìm theo ID, không cần quan tâm IsDeleted vì DocumentStatus không có soft delete
            return await _context.DocumentStatuses.FindAsync(id);
        }
    }
}
