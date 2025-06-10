using ExchangeDocument.DataAccessLayer.Data;
using ExchangeDocument.DataAccessLayer.Entities;
using ExchangeDocument.DataAccessLayer.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ExchangeDocument.DataAccessLayer.Repositories
{
    public class SystemStatusRepository : ISystemStatusRepository
    {
        private readonly ExchangeDocumentContext _context;
        public SystemStatusRepository(ExchangeDocumentContext context) => _context = context;

        public async Task<SystemStatus?> GetByIdAsync(int id)
        {
            return await _context.SystemStatuses.FindAsync(id);
        }

        public async Task<SystemStatus?> GetByDomainAndCodeAsync(string domain, string code)
        {
            return await _context.SystemStatuses
                .FirstOrDefaultAsync(s => s.Domain == domain && s.Code == code);
        }

        public async Task<List<SystemStatus>> GetByDomainAsync(string domain)
        {
            return await _context.SystemStatuses
                .Where(s => s.Domain == domain)
                .ToListAsync();
        }
    }
}
