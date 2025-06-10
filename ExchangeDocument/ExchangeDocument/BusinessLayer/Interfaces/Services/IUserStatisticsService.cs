using ExchangeDocument.BusinessLayer.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ExchangeDocument.BusinessLayer.Interfaces.Services
{
    /// <summary>
    /// Service cung cấp thống kê cho dashboard của người dùng/seller.
    /// </summary>
    public interface IUserStatisticsService
    {
        /// <summary>
        /// Thống kê tổng quan cho user hiện tại.
        /// </summary>
        Task<UserOverviewStatsDto> GetOverviewStatsAsync(int userId);

        /// <summary>
        /// Top N giao dịch mang lại doanh thu cao nhất cho seller trong 30 ngày.
        /// </summary>
        Task<List<SellerTopRevenueTransactionDto>> GetTopRevenueTransactionsAsync(int userId, int count);

        /// <summary>
        /// Top N đầu sách bán chạy nhất của seller trong 30 ngày.
        /// </summary>
        Task<List<SellerTopSellingTitleDto>> GetTopSellingTitlesAsync(int userId, int count);
    }
}
