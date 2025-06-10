using System;

namespace ExchangeDocument.BusinessLayer.DTOs
{
    /// <summary>
    /// Thống kê tổng quan cho Admin.
    /// </summary>
    public class AdminOverviewStatsDto
    {
        public int TotalActiveUsers { get; set; }
        public int TotalActiveListings { get; set; }
        public int TotalPendingListings { get; set; }
        public int CompletedOrdersLast30Days { get; set; }
        public decimal TotalRevenueLast30Days { get; set; }
    }

    public class TopCategoryStatDto
    {
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public int ActiveListingCount { get; set; }
    }

    public class TopSellerStatDto
    {
        public int SellerId { get; set; }
        public string SellerFullName { get; set; } = string.Empty;
        public decimal TotalRevenue { get; set; }
        public int CompletedOrderCount { get; set; }
    }

    /// <summary>
    /// Tiêu chí sắp xếp top seller.
    /// </summary>
    public enum TopSellerSortBy
    {
        Revenue,
        OrderCount
    }

    /// <summary>
    /// Thống kê tổng quan cho User/Seller.
    /// </summary>
    public class UserOverviewStatsDto
    {
        public int BooksInStock { get; set; }
        public int ActiveListings { get; set; }
        public int SoldOrdersLast30Days { get; set; }
        public decimal SalesRevenueLast30Days { get; set; }
        public int PurchasedOrdersLast30Days { get; set; }
        public decimal PurchaseSpendingLast30Days { get; set; }
    }

    public class SellerTopRevenueTransactionDto
    {
        public int OrderDetailId { get; set; }
        public string DocumentTitle { get; set; } = string.Empty;
        public string? DocumentAuthor { get; set; }
        public string? DocumentISBN { get; set; }
        public decimal SalePrice { get; set; }
        public DateTime OrderDate { get; set; }
    }

    public class SellerTopSellingTitleDto
    {
        public string BookTitle { get; set; } = string.Empty;
        public int QuantitySold { get; set; }
    }
}
