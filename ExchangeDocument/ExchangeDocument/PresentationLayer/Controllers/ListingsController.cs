using ExchangeDocument.BusinessLayer.DTOs;
using ExchangeDocument.BusinessLayer.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using System.Threading.Tasks;

namespace ExchangeDocument.PresentationLayer.Controllers
{
    [ApiController]
    [Route("api/[controller]")] 
    [Authorize]
    public class ListingsController : ControllerBase
    {
        private readonly IListingService _listingService;
        public ListingsController(IListingService listingService)
        {
            _listingService = listingService;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ListingCreateDto dto)
        {
            // Lấy userId từ JWT
            var sub = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
            if (!int.TryParse(sub, out var userId))
                return Unauthorized();

            var (result, error) = await _listingService.CreateListingAsync(dto, userId);
            if (error != null)
            {
                // Business/validation error
                if (error.StartsWith("Conflict"))
                    return Conflict(new { message = error });
                return BadRequest(new { message = error });
            }

            return CreatedAtAction(nameof(GetById), new { id = result!.ListingId }, result);
        }

        [HttpGet("/api/admin/listings/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AdminGetById(int id)
        {
            var dto = await _listingService.AdminGetListingByIdAsync(id);
            if (dto == null)
                return NotFound();
            return Ok(dto);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var dto = await _listingService.GetListingByIdAsync(id);
            if (dto == null)
                return NotFound();
            return Ok(dto);
        }

        /// <summary>
        /// Public endpoint: retrieve paginated active listings.
        /// </summary>
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetPublicListings(
            [FromQuery, Range(1, int.MaxValue)] int pageNumber = 1,
            [FromQuery, Range(1, 50)] int pageSize = 10)
        {
            if (pageNumber < 1)
                return BadRequest(new { message = "pageNumber must be >= 1." });
            if (pageSize < 1 || pageSize > 50)
                return BadRequest(new { message = "pageSize must be between 1 and 50." });

            var result = await _listingService.GetPublicListingsAsync(pageNumber, pageSize);
            return Ok(result);
        }

        /// <summary>
        /// Update an existing listing.
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] ListingUpdateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
            var sub = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
            if (!int.TryParse(sub, out var userId))
                return Unauthorized();

            var (result, error) = await _listingService.UpdateListingAsync(id, dto, userId);
            if (error != null)
            {
                return error switch
                {
                    "NotFound" => NotFound(new { message = "Listing not found." }),
                    "Forbidden" => Forbid(),
                    var e when e.StartsWith("Conflict") => Conflict(new { message = e }),
                    _ => BadRequest(new { message = error })
                };
            }
            return Ok(result);
        }

        /// <summary>
        /// Delete (soft) own listing.
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id, [FromBody] ListingDeleteDto dto)
        {
            var sub = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
            if (!int.TryParse(sub, out var userId))
                return Unauthorized();

            var error = await _listingService.DeleteListingAsync(id, userId, dto.RowVersion);
            if (error != null)
            {
                return error switch
                {
                    "NotFound" => NotFound(new { message = "Listing not found." }),
                    "Forbidden" => Forbid(),
                    _ => BadRequest(new { message = error })
                };
            }
            return NoContent();
        }
    }
}
