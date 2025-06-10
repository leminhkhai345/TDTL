using ExchangeDocument.BusinessLayer.DTOs;
using ExchangeDocument.BusinessLayer.Interfaces.Services;
using ExchangeDocument.DataAccessLayer.Interfaces.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace ExchangeDocument.PresentationLayer.Controllers
{
    [ApiController]
    [Route("api/admin/listings")]
    [Authorize(Roles = "Admin")]
    public class AdminListingsController : ControllerBase
    {
        private readonly IListingService _listingService;
        private readonly ISystemStatusRepository _statusRepo;

        public AdminListingsController(IListingService listingService, ISystemStatusRepository statusRepo)
        {
            _listingService = listingService;
            _statusRepo = statusRepo;
        }

        /// <summary>
        /// Retrieve paginated listings for admin with filtering and sorting
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> Get([FromQuery] AdminListingQueryParametersDto queryParams)
        {
            // Validate Status parameter
            if (!string.IsNullOrWhiteSpace(queryParams.Status))
            {
                var status = await _statusRepo.GetByDomainAndCodeAsync("Listing", queryParams.Status);
                if (status == null)
                {
                    var allowed = (await _statusRepo.GetByDomainAsync("Listing")).Select(s => s.Code);
                    return BadRequest(new { error = $"Invalid status '{queryParams.Status}'.", allowedValues = allowed });
                }
            }
            // Validate SortBy
            var allowedSortFields = new HashSet<string>(StringComparer.OrdinalIgnoreCase) { "ownername", "documenttitle", "statusname", "listingtype", "createdat" };
            if (!string.IsNullOrWhiteSpace(queryParams.SortBy) && !allowedSortFields.Contains(queryParams.SortBy))
            {
                return BadRequest(new { error = $"Invalid SortBy '{queryParams.SortBy}'.", allowedValues = allowedSortFields });
            }
            // Validate SortOrder
            var allowedSortOrders = new HashSet<string>(StringComparer.OrdinalIgnoreCase) { "asc", "desc" };
            if (!string.IsNullOrWhiteSpace(queryParams.SortOrder) && !allowedSortOrders.Contains(queryParams.SortOrder))
            {
                return BadRequest(new { error = $"Invalid SortOrder '{queryParams.SortOrder}'.", allowedValues = allowedSortOrders });
            }

            var result = await _listingService.GetAdminListingsAsync(queryParams);
            return Ok(result);
        }

        [HttpPut("{id}/approve")]
        public async Task<IActionResult> Approve(int id, [FromBody] ListingApproveDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
            var error = await _listingService.ApproveListingAsync(id, dto.RowVersion);
            if (error != null)
            {
                return error switch
                {
                    "NotFound" => NotFound(),
                    "InvalidState" => BadRequest(new { message = "Listing must be pending to approve." }),
                    "ConcurrencyConflict" => Conflict(new { message = "Listing was modified by another process. Please refresh and try again." }),
                    "StatusNotFound" => StatusCode(500, new { message = "Active listing status not configured." }),
                    _ => BadRequest(new { message = error })
                };
            }
            return NoContent();
        }

        [HttpPut("{id}/reject")]
        public async Task<IActionResult> Reject(int id, [FromBody] ListingRejectDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
            var error = await _listingService.RejectListingAsync(id, dto.Reason, dto.RowVersion);
            if (error != null)
            {
                return error switch
                {
                    "NotFound" => NotFound(),
                    "InvalidState" => BadRequest(new { message = "Listing must be pending to reject." }),
                    "ConcurrencyConflict" => Conflict(new { message = "Listing was modified by another process. Please refresh and try again." }),
                    "StatusNotFound" => StatusCode(500, new { message = "Rejected listing status not configured." }),
                    _ => BadRequest(new { message = error })
                };
            }
            return NoContent();
        }
    }
}
