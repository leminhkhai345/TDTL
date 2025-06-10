using ExchangeDocument.BusinessLayer.DTOs;
using ExchangeDocument.BusinessLayer.Interfaces.Services;
using ExchangeDocument.DataAccessLayer.Data;
using ExchangeDocument.DataAccessLayer.Interfaces.Repositories;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace ExchangeDocument.BusinessLayer.Services
{
    /// <summary>
    /// Service cung cấp các thống kê cho dashboard Admin.
    /// </summary>
    public class AdminStatisticsService : IAdminStatisticsService
    {
        private readonly ExchangeDocumentContext _context;
        private readonly ISystemStatusRepository _statusRepo;
        private readonly ILogger<AdminStatisticsService> _logger;

        public AdminStatisticsService(
            ExchangeDocumentContext context,
            ISystemStatusRepository statusRepo,
            ILogger<AdminStatisticsService> logger)
        {
            _context = context;
            _statusRepo = statusRepo;
            _logger = logger;
        }

        /// <inheritdoc />
        public async Task<AdminOverviewStatsDto> GetOverviewStatsAsync()
        {
            _logger.LogInformation("Begin calculating admin overview statistics");

            // Fetch required status values sequentially to avoid DbContext concurrency issues
            var listingActive = await _statusRepo.GetByDomainAndCodeAsync("Listing", "Active")
                ?? throw new InvalidOperationException("Listing Active status not configured");
            var listingPending = await _statusRepo.GetByDomainAndCodeAsync("Listing", "Pending")
                ?? throw new InvalidOperationException("Listing Pending status not configured");
            var orderCompleted = await _statusRepo.GetByDomainAndCodeAsync("Order", "Completed")
                ?? throw new InvalidOperationException("Order Completed status not configured");

            var activeUserCount = await _context.Users.CountAsync(u => !u.IsDeleted);

            var fromDate = DateTime.UtcNow.AddDays(-30);

            var totalActiveListings = await _context.Listings
                .CountAsync(l => !l.IsDeleted && l.ListingStatusId == listingActive.StatusId);
            var totalPendingListings = await _context.Listings
                .CountAsync(l => !l.IsDeleted && l.ListingStatusId == listingPending.StatusId);

            var completedOrdersQuery = _context.Orders
                .Where(o => o.OrderStatusId == orderCompleted.StatusId && o.OrderDate >= fromDate);

            var completedOrdersLast30Days = await completedOrdersQuery.CountAsync();
            var totalRevenueLast30Days = await completedOrdersQuery.SumAsync(o => (decimal?)o.TotalAmount) ?? 0m;

            var dto = new AdminOverviewStatsDto
            {
                TotalActiveUsers = activeUserCount,
                TotalActiveListings = totalActiveListings,
                TotalPendingListings = totalPendingListings,
                CompletedOrdersLast30Days = completedOrdersLast30Days,
                TotalRevenueLast30Days = totalRevenueLast30Days
            };

            _logger.LogInformation("Admin overview statistics calculated successfully");
            return dto;
        }

        public async Task<List<TopCategoryStatDto>> GetTopCategoriesAsync(int count)
        {
            var listingActive = await _statusRepo.GetByDomainAndCodeAsync("Listing", "Active")
                ?? throw new InvalidOperationException("Listing Active status not configured");

            var query = from l in _context.Listings
                        where !l.IsDeleted && l.ListingStatusId == listingActive.StatusId
                        join d in _context.Documents on l.DocumentId equals d.DocumentId
                        join c in _context.Categories on d.CategoryId equals c.CategoryId
                        group l by new { c.CategoryId, c.CategoryName } into g
                        orderby g.Count() descending
                        select new TopCategoryStatDto
                        {
                            CategoryId = g.Key.CategoryId,
                            CategoryName = g.Key.CategoryName,
                            ActiveListingCount = g.Count()
                        };

            return await query.Take(count).ToListAsync();
        }

        public async Task<List<TopSellerStatDto>> GetTopSellersAsync(int count, TopSellerSortBy sortBy)
        {
            var orderCompleted = await _statusRepo.GetByDomainAndCodeAsync("Order", "Completed")
                ?? throw new InvalidOperationException("Order Completed status not configured");

            var fromDate = DateTime.UtcNow.AddDays(-30);

            var query = from o in _context.Orders
                        where o.OrderStatusId == orderCompleted.StatusId && o.OrderDate >= fromDate
                        join u in _context.Users on o.SellerId equals u.UserId
                        group o by new { u.UserId, u.FullName } into g
                        select new TopSellerStatDto
                        {
                            SellerId = g.Key.UserId,
                            SellerFullName = g.Key.FullName,
                            TotalRevenue = g.Sum(x => x.TotalAmount),
                            CompletedOrderCount = g.Count()
                        };

            query = sortBy == TopSellerSortBy.OrderCount
                ? query.OrderByDescending(x => x.CompletedOrderCount)
                : query.OrderByDescending(x => x.TotalRevenue);

            return await query.Take(count).ToListAsync();
        }
    }
}
