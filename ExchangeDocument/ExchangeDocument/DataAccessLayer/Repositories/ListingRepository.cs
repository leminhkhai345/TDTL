using ExchangeDocument.DataAccessLayer.Data;
using ExchangeDocument.DataAccessLayer.Entities;
using ExchangeDocument.DataAccessLayer.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ExchangeDocument.DataAccessLayer.Repositories
{
    public class ListingRepository : IListingRepository
    {
        private readonly ExchangeDocumentContext _context;
        public ListingRepository(ExchangeDocumentContext context) => _context = context;

        public async Task<Listing> AddAsync(Listing listing)
        {
            _context.Listings.Add(listing);
            return listing;
        }

        public async Task<Listing?> GetByIdAsync(int id)
        {
            return await _context.Listings
                .Include(l => l.SystemStatus)
                .Include(l => l.ExchangeItems)
                .Include(l => l.Document)
                    .ThenInclude(d => d.Category)
                .Include(l => l.Owner)
                .Include(l => l.ListingPaymentMethods)
                    .ThenInclude(pm => pm.PaymentMethod)
                .FirstOrDefaultAsync(l => l.ListingId == id && !l.IsDeleted);
        }

        /// <summary>
        /// Retrieve all listings created by a specific user.
        /// </summary>
        public async Task<List<Listing>> GetByOwnerAsync(int ownerId)
        {
            return await _context.Listings
                .Include(l => l.SystemStatus)
                .Include(l => l.ExchangeItems)
                .Include(l => l.Document)
                    .ThenInclude(d => d.Category)
                .Include(l => l.Owner)
                .Include(l => l.ListingPaymentMethods)
                    .ThenInclude(pm => pm.PaymentMethod)
                .Where(l => l.OwnerId == ownerId && !l.IsDeleted)
                .ToListAsync();
        }

        /// <summary>
        /// Retrieve active listings with pagination (public).
        /// </summary>
        public async Task<(List<Listing> Items, int TotalCount)> GetActivePagedAsync(int pageNumber, int pageSize)
        {
            var query = _context.Listings
                .AsNoTracking()
                .Include(l => l.SystemStatus)
                .Include(l => l.Document)
                    .ThenInclude(d => d.Category)
                .Include(l => l.ListingPaymentMethods)
                    .ThenInclude(pm => pm.PaymentMethod)
                .Where(l => !l.IsDeleted
                            && l.SystemStatus.Domain == "Listing"
                            && l.SystemStatus.Code == "Active");
            var total = await query.CountAsync();
            var items = await query
                .OrderByDescending(l => l.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
            return (items, total);
        }
    }
}
