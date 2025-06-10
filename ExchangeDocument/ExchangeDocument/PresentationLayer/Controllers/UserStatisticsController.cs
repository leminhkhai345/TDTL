using ExchangeDocument.BusinessLayer.DTOs;
using ExchangeDocument.BusinessLayer.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;

namespace ExchangeDocument.PresentationLayer.Controllers
{
    [ApiController]
    [Route("api/users/me/statistics")]
    [Authorize]
    public class UserStatisticsController : ControllerBase
    {
        private readonly IUserStatisticsService _statsService;
        public UserStatisticsController(IUserStatisticsService statsService) => _statsService = statsService;

        private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        // GET: /api/users/me/statistics/overview
        [HttpGet("overview")]
        public async Task<ActionResult<UserOverviewStatsDto>> GetOverview()
            => Ok(await _statsService.GetOverviewStatsAsync(GetUserId()));

        // GET: /api/users/me/statistics/top-revenue-transactions?count=3
        [HttpGet("top-revenue-transactions")]
        public async Task<ActionResult<List<SellerTopRevenueTransactionDto>>> GetTopRevenue([FromQuery] int count = 3)
            => Ok(await _statsService.GetTopRevenueTransactionsAsync(GetUserId(), count));

        // GET: /api/users/me/statistics/top-selling-titles?count=3
        [HttpGet("top-selling-titles")]
        public async Task<ActionResult<List<SellerTopSellingTitleDto>>> GetTopSelling([FromQuery] int count = 3)
            => Ok(await _statsService.GetTopSellingTitlesAsync(GetUserId(), count));
    }
}
