using System.Threading.Tasks;
using ExchangeDocument.BusinessLayer.DTOs;

namespace ExchangeDocument.BusinessLayer.Interfaces.Services
{
    /// <summary>
    /// Service cung cấp các thống kê cho dashboard Admin.
    /// </summary>
    public interface IAdminStatisticsService
    {
        /// <summary>
        /// Lấy thống kê tổng quan (overview) cho Admin dashboard.
        /// </summary>
        Task<AdminOverviewStatsDto> GetOverviewStatsAsync();

        /// <summary>
        /// Top N danh mục có nhiều listing Active nhất.
        /// </summary>
        Task<List<TopCategoryStatDto>> GetTopCategoriesAsync(int count);

        /// <summary>
        /// Top N seller theo doanh thu hoặc số đơn hàng trong 30 ngày.
        /// sortBy = "revenue" | "orderCount"
        /// </summary>
        Task<List<TopSellerStatDto>> GetTopSellersAsync(int count, TopSellerSortBy sortBy);
    }
}
