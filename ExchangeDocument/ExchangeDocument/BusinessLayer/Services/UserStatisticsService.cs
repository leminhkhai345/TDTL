using ExchangeDocument.BusinessLayer.DTOs;
using ExchangeDocument.BusinessLayer.Interfaces.Services;
using ExchangeDocument.DataAccessLayer.Data;
using ExchangeDocument.DataAccessLayer.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ExchangeDocument.BusinessLayer.Services
{
    /// <summary>
    /// Service thống kê cho dashboard User/Seller.
    /// </summary>
    public class UserStatisticsService : IUserStatisticsService
    {
        private readonly ExchangeDocumentContext _context;
        private readonly ISystemStatusRepository _statusRepo;
        private readonly ILogger<UserStatisticsService> _logger;

        public UserStatisticsService(
            ExchangeDocumentContext context,
            ISystemStatusRepository statusRepo,
            ILogger<UserStatisticsService> logger)
        {
            _context = context;
            _statusRepo = statusRepo;
            _logger = logger;
        }

        public async Task<UserOverviewStatsDto> GetOverviewStatsAsync(int userId)
        {
            _logger.LogInformation("Calculating overview statistics for user {UserId}", userId);

            // Fetch required status codes sequentially to avoid concurrent DbContext operations
            var docInStock = await _statusRepo.GetByDomainAndCodeAsync("Document", "InStock")
                              ?? throw new InvalidOperationException("Document InStock status not configured");
            var listingActive = await _statusRepo.GetByDomainAndCodeAsync("Listing", "Active")
                              ?? throw new InvalidOperationException("Listing Active status not configured");
            var orderCompleted = await _statusRepo.GetByDomainAndCodeAsync("Order", "Completed")
                              ?? throw new InvalidOperationException("Order Completed status not configured");

            var fromDate = DateTime.UtcNow.AddDays(-30);

            // Execute each query sequentially on the same DbContext instance
            var booksInStock = await _context.Documents
                .CountAsync(d => d.UserId == userId && d.StatusId == docInStock.StatusId && !d.IsDeleted);

            var activeListings = await _context.Listings
                .CountAsync(l => l.OwnerId == userId && l.ListingStatusId == listingActive.StatusId && !l.IsDeleted);

            var soldOrdersQuery = _context.Orders.Where(o => o.SellerId == userId && o.OrderStatusId == orderCompleted.StatusId && o.OrderDate >= fromDate);
            var soldOrdersCount = await soldOrdersQuery.CountAsync();
            var soldRevenue = (await soldOrdersQuery.SumAsync(o => (decimal?)o.TotalAmount)) ?? 0;

            var purchasedOrdersQuery = _context.Orders.Where(o => o.BuyerId == userId && o.OrderStatusId == orderCompleted.StatusId && o.OrderDate >= fromDate);
            var purchasedOrdersCount = await purchasedOrdersQuery.CountAsync();
            var purchaseSpending = (await purchasedOrdersQuery.SumAsync(o => (decimal?)o.TotalAmount)) ?? 0;

            return new UserOverviewStatsDto
            {
                BooksInStock = booksInStock,
                ActiveListings = activeListings,
                SoldOrdersLast30Days = soldOrdersCount,
                SalesRevenueLast30Days = soldRevenue,
                PurchasedOrdersLast30Days = purchasedOrdersCount,
                PurchaseSpendingLast30Days = purchaseSpending
            };
        }

        public async Task<List<SellerTopRevenueTransactionDto>> GetTopRevenueTransactionsAsync(int userId, int count)
        {
            var orderCompleted = await _statusRepo.GetByDomainAndCodeAsync("Order", "Completed")
                ?? throw new InvalidOperationException("Order Completed status not configured");
            var fromDate = DateTime.UtcNow.AddDays(-30);

            var query = from od in _context.OrderDetails
                        join o in _context.Orders on od.OrderId equals o.OrderId
                        where o.SellerId == userId && o.OrderStatusId == orderCompleted.StatusId && o.OrderDate >= fromDate
                        join d in _context.Documents on od.DocumentId equals d.DocumentId
                        orderby od.PriceAtOrderTime descending
                        select new SellerTopRevenueTransactionDto
                        {
                            OrderDetailId = od.OrderDetailId,
                            DocumentTitle = d.Title,
                            DocumentAuthor = d.Author,
                            DocumentISBN = d.Isbn,
                            SalePrice = od.PriceAtOrderTime,
                            OrderDate = o.OrderDate
                        };
            return await query.Take(count).ToListAsync();
        }

        public async Task<List<SellerTopSellingTitleDto>> GetTopSellingTitlesAsync(int userId, int count)
        {
            var orderCompleted = await _statusRepo.GetByDomainAndCodeAsync("Order", "Completed")
                ?? throw new InvalidOperationException("Order Completed status not configured");
            var fromDate = DateTime.UtcNow.AddDays(-30);

            var query = from od in _context.OrderDetails
                        join o in _context.Orders on od.OrderId equals o.OrderId
                        where o.SellerId == userId && o.OrderStatusId == orderCompleted.StatusId && o.OrderDate >= fromDate
                        join d in _context.Documents on od.DocumentId equals d.DocumentId
                        group od by d.Title into g
                        orderby g.Sum(x => x.Quantity) descending
                        select new SellerTopSellingTitleDto
                        {
                            BookTitle = g.Key,
                            QuantitySold = g.Sum(x => x.Quantity)
                        };

            return await query.Take(count).ToListAsync();
        }
    }
}
