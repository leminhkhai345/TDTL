using ExchangeDocument.DataAccessLayer.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ExchangeDocument.DataAccessLayer.Interfaces.Repositories
{
    public interface ISystemStatusRepository
    {
        Task<SystemStatus?> GetByDomainAndCodeAsync(string domain, string code);
        Task<SystemStatus?> GetByIdAsync(int id);
        Task<List<SystemStatus>> GetByDomainAsync(string domain);
    }
}
