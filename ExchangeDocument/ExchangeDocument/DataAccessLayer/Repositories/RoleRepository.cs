using System.Threading.Tasks;
using ExchangeDocument.DataAccessLayer.Data;
using ExchangeDocument.DataAccessLayer.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;

namespace ExchangeDocument.DataAccessLayer.Repositories
{
    public class RoleRepository : IRoleRepository
    {
        private readonly ExchangeDocumentContext _context;

        public RoleRepository(ExchangeDocumentContext context)
        {
            _context = context;
        }

        public async Task<bool> ExistsAsync(int roleId)
        {
            return await _context.Roles.AnyAsync(r => r.RoleId == roleId);
        }
    }
}
