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

        public async Task<SystemStatus?> GetByIdAsync(int id)
        {
            // Lấy status chung từ SystemStatuses
            return await _context.SystemStatuses.FindAsync(id);
        }
    }
}
