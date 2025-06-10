using ExchangeDocument.BusinessLayer.DTOs;
using ExchangeDocument.BusinessLayer.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ExchangeDocument.PresentationLayer.Controllers
{
    [ApiController]
    [Route("api/admin/statistics")]
    [Authorize(Roles = "Admin")]
    public class AdminStatisticsController : ControllerBase
    {
        private readonly IAdminStatisticsService _statsService;
        public AdminStatisticsController(IAdminStatisticsService statsService)
        {
            _statsService = statsService;
        }

        // GET: /api/admin/statistics/overview
        [HttpGet("overview")]
        public async Task<ActionResult<AdminOverviewStatsDto>> GetOverview()
            => Ok(await _statsService.GetOverviewStatsAsync());

        // GET: /api/admin/statistics/top-categories?count=5
        [HttpGet("top-categories")]
        public async Task<ActionResult<List<TopCategoryStatDto>>> GetTopCategories([FromQuery] int count = 5)
            => Ok(await _statsService.GetTopCategoriesAsync(count));

        // GET: /api/admin/statistics/top-sellers?count=5&sortBy=Revenue
        [HttpGet("top-sellers")]
        public async Task<ActionResult<List<TopSellerStatDto>>> GetTopSellers([FromQuery] int count = 5, [FromQuery] TopSellerSortBy sortBy = TopSellerSortBy.Revenue)
            => Ok(await _statsService.GetTopSellersAsync(count, sortBy));
    }
}
