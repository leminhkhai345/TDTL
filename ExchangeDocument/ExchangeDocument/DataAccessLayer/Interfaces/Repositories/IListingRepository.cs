using ExchangeDocument.DataAccessLayer.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ExchangeDocument.DataAccessLayer.Interfaces.Repositories
{
    public interface IListingRepository
    {
        Task<Listing> AddAsync(Listing listing);
        Task<Listing?> GetByIdAsync(int id);
        /// <summary>
        /// Retrieve all listings created by a specific user.
        /// </summary>
        Task<List<Listing>> GetByOwnerAsync(int ownerId);
        /// <summary>
        /// Retrieve active listings with pagination (public).
        /// </summary>
        Task<(List<Listing> Items, int TotalCount)> GetActivePagedAsync(int pageNumber, int pageSize);
    }
}
